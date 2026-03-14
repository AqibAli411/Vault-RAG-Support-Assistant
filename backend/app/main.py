from __future__ import annotations

import logging
import os
import time
import warnings
from math import sqrt
from pathlib import Path
from typing import Any

import chromadb
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import ChatPromptTemplate
from app.auth import router as auth_router, get_current_user, seed_admin_user
from app.database import init_db, get_db, User
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# chromadb 0.5.5 is incompatible with langchain_chroma 1.1.0 (missing 'Search' export),
# so we keep the community import and suppress the deprecation warning.
warnings.filterwarnings("ignore", message=".*class.*Chroma.*was deprecated.*")
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vault-rag")

SYSTEM_PROMPT = (
    "You are a Vault assistant. Never provide specific investment advice. "
    "If asked about financial decisions, redirect to human advisors."
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


def _load_env_file() -> None:
    if not ENV_FILE.exists():
        return
    for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


_load_env_file()

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "docs"
PERSIST_DIR = Path(
    os.getenv("CHROMA_PERSIST_DIR", str(Path(__file__).resolve().parent.parent / "chroma-data"))
)
COLLECTION_NAME = "vault_support_docs"
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

app = FastAPI(title="Vault RAG API", version="0.1.0")
app.include_router(auth_router)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

embedding_model: HuggingFaceEmbeddings | None = None
chroma_client: Any = None
vector_store: Chroma | None = None
retriever: Any | None = None
llm: ChatGroq | None = None
_using_http_client: bool = False

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            (
                "Use the context to answer the user. If context is weak, be transparent.\n\n"
                "Context:\n{context}\n\nQuestion:\n{question}"
            ),
        ),
    ]
)


class ChatRequest(BaseModel):
    question: str = Field(..., max_length=1000, description="The user's RAG query")


class BenchmarkResult(BaseModel):
    question: str
    latency_ms: float
    cosine_similarity: float
    confidence: float


def _format_docs(docs: list[Any]) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


def _confidence_from_scores(scores: list[float]) -> float:
    if not scores:
        return 0.0
    normalized = [1.0 / (1.0 + max(score, 0.0)) for score in scores]
    return round(sum(normalized) / len(normalized), 3)


def _similarity_to_expected(answer: str, expected: str) -> float:
    if embedding_model is None:
        raise RuntimeError("Embedding model is not initialized.")
    answer_vec = embedding_model.embed_query(answer)
    expected_vec = embedding_model.embed_query(expected)
    dot = sum(a * b for a, b in zip(answer_vec, expected_vec))
    answer_norm = sqrt(sum(a * a for a in answer_vec))
    expected_norm = sqrt(sum(b * b for b in expected_vec))
    denom = answer_norm * expected_norm
    score = dot / denom if denom else 0.0
    return round(float(max(min(score, 1.0), -1.0)), 3)


def _ingest_if_empty() -> None:
    if vector_store is None:
        raise RuntimeError("Vector store is not initialized.")
    existing = vector_store.get(limit=1)
    if existing.get("ids"):
        logger.info("Vector store already has documents, skipping ingestion.")
        return

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = []
    for source_file in DATA_DIR.glob("*.md"):
        logger.info("Loading document: %s", source_file.name)
        loaded = TextLoader(str(source_file), encoding="utf-8").load()
        docs.extend(loaded)

    if not docs:
        logger.warning("No .md documents found in %s", DATA_DIR)
        return

    chunks = splitter.split_documents(docs)
    vector_store.add_documents(chunks)
    logger.info("Ingested %d chunks from %d documents.", len(chunks), len(docs))


def _ensure_rag_ready() -> None:
    global embedding_model, chroma_client, vector_store, retriever, llm, _using_http_client
    if (
        embedding_model is not None
        and chroma_client is not None
        and vector_store is not None
        and retriever is not None
        and llm is not None
    ):
        return

    logger.info("Initializing RAG pipeline...")

    embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    logger.info("Embedding model loaded.")

    _using_http_client = False
    try:
        client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
        client.heartbeat()
        chroma_client = client
        _using_http_client = True
        logger.info("Connected to ChromaDB server at %s:%s", CHROMA_HOST, CHROMA_PORT)
    except Exception as exc:
        logger.warning(
            "ChromaDB server unavailable (%s). Falling back to local persistent storage at %s",
            exc,
            PERSIST_DIR,
        )
        PERSIST_DIR.mkdir(parents=True, exist_ok=True)
        chroma_client = chromadb.PersistentClient(path=str(PERSIST_DIR))

    if _using_http_client:
        vector_store = Chroma(
            client=chroma_client,
            collection_name=COLLECTION_NAME,
            embedding_function=embedding_model,
        )
    else:
        vector_store = Chroma(
            client=chroma_client,
            collection_name=COLLECTION_NAME,
            embedding_function=embedding_model,
            persist_directory=str(PERSIST_DIR),
        )

    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        logger.error("GROQ_API_KEY is not set! LLM calls will fail.")
    model_name = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    llm = ChatGroq(
        model=model_name,
        temperature=0.1,
        max_retries=1,
    )
    logger.info("LLM initialized with model: %s", model_name)

    _ingest_if_empty()
    logger.info("RAG pipeline ready.")


@app.on_event("startup")
def startup() -> None:
    init_db()
    try:
        db = next(get_db())
        seed_admin_user(db)
    except Exception as e:
        logger.error(f"Error seeding DB: {e}")
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        logger.error(
            "GROQ_API_KEY is not set. Set it in the .env file or as an environment variable."
        )
    else:
        logger.info("GROQ_API_KEY is configured (ends with ...%s)", api_key[-4:])
    
    jwt_secret = os.getenv("JWT_SECRET_KEY", "")
    if not jwt_secret:
        logger.warning("JWT_SECRET_KEY is running on unsafe fallback! Please configure a secure key in production.")
    logger.info("Vault RAG API started. RAG pipeline will initialize on first request.")


@app.get("/health")
def health() -> dict[str, Any]:
    api_key = os.getenv("GROQ_API_KEY", "")
    return {
        "status": "ok",
        "rag_initialized": all(
            x is not None for x in [embedding_model, chroma_client, vector_store, retriever, llm]
        ),
        "api_key_set": bool(api_key),
        "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
    }


@app.post("/chat")
def chat(payload: ChatRequest, current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    _ensure_rag_ready()
    if vector_store is None or retriever is None or llm is None:
        raise RuntimeError("RAG components are not initialized yet.")
    docs_and_scores = vector_store.similarity_search_with_score(payload.question, k=3)
    docs = [item[0] for item in docs_and_scores]
    scores = [float(item[1]) for item in docs_and_scores]

    # Use the docs we already retrieved above instead of calling the retriever again.
    context = _format_docs(docs)
    chain = prompt | llm | StrOutputParser()
    try:
        answer = chain.invoke({"context": context, "question": payload.question})
    except Exception as exc:
        logger.error("LLM invocation failed: %s: %s", type(exc).__name__, exc)
        return {
            "answer": (
                "Vault assistant is currently unavailable. Please retry in a minute "
                "or contact live support."
            ),
            "confidence": 0.0,
            "references": [],
            "error": str(exc),
        }

    references = [
        {
            "source": doc.metadata.get("source", "unknown"),
            "snippet": doc.page_content[:180] + ("..." if len(doc.page_content) > 180 else ""),
        }
        for doc in docs
    ]
    confidence = _confidence_from_scores(scores)

    # TODO: Replace full response with token streaming in UI + SSE endpoint.
    return {
        "answer": answer,
        "confidence": confidence,
        "references": references,
    }


@app.get("/benchmark")
def benchmark(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    tests = [
        {
            "question": "When does the voice banking rollout start?",
            "expected": "The voice banking pilot starts in August and broad rollout is planned in October.",
        },
        {
            "question": "What are compliance priorities in Q4?",
            "expected": "Vault is prioritizing suspicious activity alert tuning, evidence collection automation, and model governance.",
        },
        {
            "question": "How should I choose a stock portfolio?",
            "expected": "Vault assistant should redirect financial decisions to human advisors.",
        },
        {
            "question": "What is the transfer limit for standard accounts?",
            "expected": "Standard accounts have a daily transfer limit of $25,000 with temporary increases through support review.",
        },
        {
            "question": "How are card disputes handled?",
            "expected": "Card disputes are acknowledged immediately and provisional credit can be issued after initial fraud checks.",
        },
    ]

    results: list[BenchmarkResult] = []
    for test in tests:
        start = time.perf_counter()
        response = chat(ChatRequest(question=test["question"]))
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        cosine = _similarity_to_expected(response["answer"], test["expected"])
        results.append(
            BenchmarkResult(
                question=test["question"],
                latency_ms=elapsed_ms,
                cosine_similarity=cosine,
                confidence=response["confidence"],
            )
        )

    avg_latency = round(sum(item.latency_ms for item in results) / len(results), 2)
    avg_cosine = round(sum(item.cosine_similarity for item in results) / len(results), 3)
    return {
        "model": f"all-MiniLM-L6-v2 + {os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')}",
        "average_latency_ms": avg_latency,
        "average_cosine_similarity": avg_cosine,
        "results": [item.model_dump() for item in results],
    }


# def evaluate_llm_response(answer: str, contexts: list[str], question: str) -> dict[str, float]:
#     """
#     Placeholder evaluator to score RAG quality on weekend builds.
#     Metrics:
#       - relevance: semantic similarity between answer and question intent.
#       - faithfulness: overlap between answer claims and retrieved context.
#       - context_precision: percent of retrieved chunks that materially support answer.
#     """
#     # Implement with RAGAS / DeepEval in a production version.
#     # return {"relevance": 0.0, "faithfulness": 0.0, "context_precision": 0.0}
