FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=300 --retries 10 \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.5.1+cpu \
    && pip install --no-cache-dir --default-timeout=300 --retries 10 -r requirements.txt

COPY app ./app
COPY data ./data

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
