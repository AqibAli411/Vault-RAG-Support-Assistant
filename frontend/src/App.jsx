import { useMemo, useRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const MAX_TEXTAREA_ROWS = 4
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function normalizeSource(sourcePath) {
  const parts = sourcePath.split('/')
  return parts[parts.length - 1] || sourcePath
}

const typedMessages = new Set()
function TypewriterMarkdown({ content, speed = 15, messageId, onType }) {
  const [displayedContent, setDisplayedContent] = useState(typedMessages.has(messageId) ? content : '')
  const [isTyping, setIsTyping] = useState(!typedMessages.has(messageId))

  useEffect(() => {
    if (isTyping && onType) {
      onType()
    }
  }, [displayedContent, isTyping, onType])

  useEffect(() => {
    if (typedMessages.has(messageId)) {
      setDisplayedContent(content)
      setIsTyping(false)
      return
    }

    setDisplayedContent('')
    setIsTyping(true)
    let currentIndex = 0

    const interval = setInterval(() => {
      setDisplayedContent(content.substring(0, currentIndex + 1))
      currentIndex++
      if (currentIndex >= content.length) {
        clearInterval(interval)
        setIsTyping(false)
        typedMessages.add(messageId)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [content, speed, messageId])

  return (
    <div className="prose-custom font-body">
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed text-on-surface" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-on-surface space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-on-surface space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold font-headline text-white mb-3 mt-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold font-headline text-white mb-2 mt-4" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-bold font-headline text-white mb-2 mt-3" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          a: ({ node, ...props }) => <a className="text-lime hover:underline" {...props} />,
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="bg-surface-container text-amber-200 px-1 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <div className="bg-[#111] border border-border rounded-lg p-3 my-3 overflow-x-auto">
                <code className="text-amber-200 text-sm font-mono line-clamp-none block" {...props} />
              </div>
            ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-lime animate-pulse align-middle" />}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   MINI SVG SPARKLINE COMPONENT
   ════════════════════════════════════════════════════ */
function Sparkline({ data, color = '#b7f700', width = 120, height = 32 }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  )
}

/* ════════════════════════════════════════════════════
   MARKET INSIGHTS VIEW
   ════════════════════════════════════════════════════ */
function MarketInsightsView() {
  const indices = [
    { name: 'S&P 500', value: '5,892.41', change: '+1.23%', up: true, data: [40, 42, 38, 44, 46, 43, 48, 47, 50, 52, 49, 54, 56, 53, 58] },
    { name: 'NASDAQ', value: '18,741.09', change: '+0.87%', up: true, data: [60, 58, 62, 65, 63, 67, 64, 68, 70, 72, 69, 74, 71, 76, 78] },
    { name: 'DOW 30', value: '42,118.55', change: '-0.14%', up: false, data: [80, 78, 82, 79, 76, 78, 74, 77, 73, 75, 72, 74, 70, 73, 71] },
    { name: 'BTC/USD', value: '87,432.18', change: '+3.41%', up: true, data: [30, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65, 68] },
  ]
  const forex = [
    { pair: 'EUR/USD', rate: '1.0847', change: '+0.12%', up: true },
    { pair: 'GBP/USD', rate: '1.2936', change: '-0.08%', up: false },
    { pair: 'USD/JPY', rate: '154.82', change: '+0.31%', up: true },
    { pair: 'USD/CAD', rate: '1.3641', change: '+0.05%', up: true },
  ]
  const news = [
    { time: '2m ago', title: 'Fed signals cautious approach to rate adjustments amid inflation concerns', tag: 'Monetary Policy' },
    { time: '18m ago', title: 'Tech earnings beat expectations as AI infrastructure spending surges', tag: 'Earnings' },
    { time: '1h ago', title: 'European markets rally on improved manufacturing PMI data', tag: 'Global Markets' },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-white font-bold mb-1">Market Insights</h1>
        <p className="text-zinc-500 text-sm font-body">Live market data for Premium & Business members</p>
      </div>

      {/* Index Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {indices.map((idx) => (
          <div key={idx.name} className="p-5 bg-[#1A1A1A] border border-border rounded-xl hover:border-zinc-700 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-headline font-bold">{idx.name}</p>
              <span className={`text-xs font-bold font-headline ${idx.up ? 'text-lime' : 'text-red-400'}`}>{idx.change}</span>
            </div>
            <p className="font-headline text-2xl text-white font-bold mb-3">{idx.value}</p>
            <Sparkline data={idx.data} color={idx.up ? '#b7f700' : '#f87171'} width={200} height={28} />
          </div>
        ))}
      </div>

      {/* Foreign Exchange */}
      <div>
        <h2 className="text-[11px] text-zinc-500 uppercase tracking-widest font-headline font-bold mb-4">Foreign Exchange</h2>
        <div className="bg-[#1A1A1A] border border-border rounded-xl overflow-hidden">
          {forex.map((fx, i) => (
            <div key={fx.pair} className={`flex items-center justify-between px-5 py-4 ${i < forex.length - 1 ? 'border-b border-border' : ''} hover:bg-surface-container transition-colors`}>
              <span className="text-white font-headline font-medium text-sm">{fx.pair}</span>
              <div className="flex items-center gap-4">
                <span className="text-zinc-300 font-headline text-sm">{fx.rate}</span>
                <span className={`text-xs font-bold font-headline ${fx.up ? 'text-lime' : 'text-red-400'}`}>{fx.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Pulse */}
      <div>
        <h2 className="text-[11px] text-zinc-500 uppercase tracking-widest font-headline font-bold mb-4">Market Pulse</h2>
        <div className="space-y-3">
          {news.map((item, i) => (
            <div key={i} className="p-4 bg-[#1A1A1A] border border-border rounded-xl hover:border-zinc-700 transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-body leading-relaxed group-hover:text-white transition-colors">{item.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] bg-lime/10 text-lime px-2 py-0.5 rounded font-headline font-bold uppercase">{item.tag}</span>
                    <span className="text-[10px] text-zinc-600 font-body">{item.time}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-zinc-700 group-hover:text-zinc-400 transition-colors text-base mt-1 shrink-0">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SECURITY VIEW
   ════════════════════════════════════════════════════ */
function SecurityView() {
  const features = [
    { icon: 'verified_user', title: 'Two-Factor Authentication', desc: 'TOTP via Google Authenticator', status: 'Enabled', statusColor: 'text-lime' },
    { icon: 'fingerprint', title: 'Biometric Login', desc: 'Face ID configured on 2 devices', status: 'Active', statusColor: 'text-lime' },
    { icon: 'key', title: 'Hardware Security Key', desc: 'Available for Premium & Business tiers', status: 'Not Configured', statusColor: 'text-zinc-500' },
    { icon: 'shield', title: 'Fraud Monitoring', desc: 'ML-powered transaction analysis active', status: 'Real-Time', statusColor: 'text-lime' },
  ]
  const sessions = [
    { device: 'MacBook Pro', browser: 'Chrome', location: 'Lahore, PK', time: '2 minutes ago', current: true },
    { device: 'iPhone 15', browser: 'Vault App', location: 'Lahore, PK', time: '3 hours ago', current: false },
    { device: 'Windows 11', browser: 'Edge', location: 'Islamabad, PK', time: '2 days ago', current: false },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-white font-bold mb-1">Account Security</h1>
        <p className="text-zinc-500 text-sm font-body">Manage authentication and monitor account access</p>
      </div>

      {/* Security Score */}
      <div className="p-6 bg-[#1A1A1A] border border-lime/20 rounded-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-lime/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-6 relative">
          <div className="w-20 h-20 rounded-full border-[3px] border-lime flex items-center justify-center relative">
            <span className="font-headline text-2xl font-bold text-lime">92</span>
            <div className="absolute -bottom-1 bg-[#1A1A1A] px-1">
              <span className="text-[8px] text-zinc-500 font-headline uppercase">Score</span>
            </div>
          </div>
          <div>
            <p className="text-white font-headline font-bold text-lg">Security Score: Excellent</p>
            <p className="text-zinc-500 text-sm font-body mt-1">Your account exceeds industry-standard security benchmarks</p>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <div key={f.title} className="p-5 bg-[#1A1A1A] border border-border rounded-xl hover:border-zinc-700 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lime text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                <p className="font-headline font-bold text-white text-sm">{f.title}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest font-headline ${f.statusColor}`}>{f.status}</span>
            </div>
            <p className="text-xs text-zinc-500 font-body ml-8">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Active Sessions */}
      <div>
        <h2 className="text-[11px] text-zinc-500 uppercase tracking-widest font-headline font-bold mb-4">Recent Login Activity</h2>
        <div className="bg-[#1A1A1A] border border-border rounded-xl overflow-hidden">
          {sessions.map((s, i) => (
            <div key={i} className={`flex items-center justify-between px-5 py-4 ${i < sessions.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-500 text-lg">devices</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-headline font-medium text-sm">{s.device} — {s.browser}</p>
                    {s.current && <span className="text-[9px] bg-lime/10 text-lime px-2 py-0.5 rounded font-headline font-bold uppercase">Current</span>}
                  </div>
                  <p className="text-xs text-zinc-500 font-body mt-0.5">{s.location}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-600 font-body">{s.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Encryption Banner */}
      <div className="p-5 bg-lime/5 border border-lime/20 rounded-xl flex items-center gap-4">
        <span className="material-symbols-outlined text-lime text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        <div>
          <p className="text-white font-headline font-bold text-sm">End-to-End Encryption Active</p>
          <p className="text-xs text-zinc-400 font-body mt-0.5">AES-256 at rest • TLS 1.3 in transit • Zero-knowledge architecture</p>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   ASSETS VIEW
   ════════════════════════════════════════════════════ */
function AssetsView() {
  const accounts = [
    { name: 'Premium Checking', number: '•••• 4821', balance: '$47,293.18', icon: 'account_balance', type: 'USD' },
    { name: 'High-Yield Savings', number: '•••• 7734', balance: '$128,450.00', icon: 'savings', type: 'USD' },
    { name: 'Investment Portfolio', number: '•••• 1156', balance: '$312,600.42', icon: 'trending_up', type: 'USD' },
    { name: 'Euro Account', number: '•••• 9012', balance: '€18,204.33', icon: 'euro', type: 'EUR' },
  ]
  const transactions = [
    { name: 'Apple Inc.', category: 'Subscription', amount: '-$14.99', time: 'Today, 2:31 PM', icon: 'phone_iphone', negative: true },
    { name: 'Salary Deposit', category: 'Income', amount: '+$8,500.00', time: 'Today, 9:00 AM', icon: 'payments', negative: false },
    { name: 'AWS Services', category: 'Cloud Infrastructure', amount: '-$247.83', time: 'Yesterday', icon: 'cloud', negative: true },
    { name: 'International Transfer', category: 'Wire Transfer', amount: '-$3,200.00', time: 'Apr 19', icon: 'send', negative: true },
    { name: 'Dividend — AAPL', category: 'Investment Return', amount: '+$142.50', time: 'Apr 18', icon: 'trending_up', negative: false },
  ]
  const allocation = [
    { label: 'Equities', pct: 58, color: 'bg-lime' },
    { label: 'Fixed Income', pct: 22, color: 'bg-emerald-400' },
    { label: 'Cash', pct: 12, color: 'bg-zinc-400' },
    { label: 'Alternatives', pct: 8, color: 'bg-amber-400' },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
      <div>
        <h1 className="font-headline text-2xl text-white font-bold mb-1">Vault Assets</h1>
        <p className="text-zinc-500 text-sm font-body">Your consolidated financial overview</p>
      </div>

      {/* Net Worth Hero */}
      <div className="p-6 bg-[#1A1A1A] border border-border rounded-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-lime/5 rounded-full blur-3xl"></div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-headline font-bold mb-2">Total Net Worth</p>
        <p className="font-headline text-4xl sm:text-5xl text-white font-bold tracking-tight relative">$506,547<span className="text-zinc-500">.93</span></p>
        <div className="flex items-center gap-2 mt-3">
          <span className="material-symbols-outlined text-lime text-base" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          <span className="text-lime text-xs font-headline font-bold">+2.4% this month</span>
          <span className="text-zinc-600 text-xs font-body">• +$11,842.17</span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((a) => (
          <div key={a.number} className="p-5 bg-[#1A1A1A] border border-border rounded-xl hover:border-zinc-700 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-zinc-500 group-hover:text-lime transition-colors text-lg">{a.icon}</span>
                <div>
                  <p className="font-headline font-bold text-white text-sm">{a.name}</p>
                  <p className="text-[11px] text-zinc-600 font-body mt-0.5">{a.number}</p>
                </div>
              </div>
              <span className="text-[9px] bg-surface-container text-zinc-400 px-2 py-0.5 rounded font-headline font-bold uppercase">{a.type}</span>
            </div>
            <p className="font-headline text-xl text-white font-bold ml-8">{a.balance}</p>
          </div>
        ))}
      </div>

      {/* Portfolio Allocation */}
      <div>
        <h2 className="text-[11px] text-zinc-500 uppercase tracking-widest font-headline font-bold mb-4">Portfolio Allocation</h2>
        <div className="p-5 bg-[#1A1A1A] border border-border rounded-xl">
          <div className="flex rounded-full overflow-hidden h-2 mb-5">
            {allocation.map((a) => (
              <div key={a.label} className={`${a.color} transition-all`} style={{ width: `${a.pct}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allocation.map((a) => (
              <div key={a.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${a.color} shrink-0`} />
                <span className="text-xs text-zinc-400 font-body">{a.label}</span>
                <span className="text-xs text-zinc-300 font-headline font-bold ml-auto">{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-[11px] text-zinc-500 uppercase tracking-widest font-headline font-bold mb-4">Recent Transactions</h2>
        <div className="bg-[#1A1A1A] border border-border rounded-xl overflow-hidden">
          {transactions.map((tx, i) => (
            <div key={i} className={`flex items-center justify-between px-5 py-4 ${i < transactions.length - 1 ? 'border-b border-border' : ''} hover:bg-surface-container transition-colors`}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-zinc-400 text-base">{tx.icon}</span>
                </div>
                <div>
                  <p className="text-white font-headline font-medium text-sm">{tx.name}</p>
                  <p className="text-[11px] text-zinc-500 font-body">{tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-headline font-bold text-sm ${tx.negative ? 'text-zinc-300' : 'text-lime'}`}>{tx.amount}</p>
                <p className="text-[10px] text-zinc-600 font-body">{tx.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formBody = new URLSearchParams()
    formBody.append('username', email)
    formBody.append('password', password)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      })
      const data = await res.json()
      if (res.ok && data.access_token) {
        onLogin(data.access_token)
      } else {
        setError(data.detail || 'Invalid credentials')
      }
    } catch {
      setError('Connection to authentication server failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-body flex items-center justify-center relative overflow-hidden">


      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-[#1A1A1A] border border-border mb-4">
            <img src="/logo.png" alt="Vault" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Vault Login</h1>
          <p className="text-zinc-500 text-sm mt-2">Secure access for authorized personnel</p>
        </div>

        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0F0F0F] border border-border focus:border-lime/50 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-700 transition-colors"
                placeholder="staff@vault.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0F0F0F] border border-border focus:border-lime/50 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-700 transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-sm">warning</span>
                <p className="text-xs text-red-400 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-black font-headline font-bold py-3 rounded-lg hover:bg-[#a3db00] transition-colors active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                  Authenticating...
                </>
              ) : (
                'Access Terminal'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-2 text-[10px] uppercase text-zinc-500 tracking-widest font-bold">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            E2E Encrypted Session
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('vault_token'))
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState('terminal')
  const [activePopover, setActivePopover] = useState(null)
  const [rightPanelTab, setRightPanelTab] = useState('sources')
  const textareaRef = useRef(null)
  const chatEndRef = useRef(null)

  const latestReferences = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((item) => item.role === 'assistant')
    return lastAssistant?.references || []
  }, [messages])

  const currentConfidence = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((item) => item.role === 'assistant' && typeof item.confidence === 'number')
    return lastAssistant?.confidence ?? null
  }, [messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const autoResize = (el) => {
    if (!el) return
    el.style.height = 'auto'
    const lh = Number.parseInt(window.getComputedStyle(el).lineHeight, 10) || 24
    const max = lh * MAX_TEXTAREA_ROWS
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }

  const sendMessage = async () => {
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question }),
      })
      if (res.status === 401) {
        setToken(null)
        localStorage.removeItem('vault_token')
        return
      }
      const data = await res.json()
      const errorDetail = data.error ? `\n\n⚠️ ${data.error}` : ''
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer + errorDetail, confidence: data.confidence ?? 0, references: data.references || [] },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Terminal offline. Unable to reach host.', confidence: 0, references: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Right-Panel confidence
  let confLabel = 'Standing By'
  let confColor = 'bg-zinc-800'
  let confWidth = '0%'
  if (currentConfidence !== null) {
    if (currentConfidence > 0.85) { confLabel = 'High'; confColor = 'bg-lime'; confWidth = `${(currentConfidence * 100).toFixed(0)}%` }
    else if (currentConfidence >= 0.6) { confLabel = 'Medium'; confColor = 'bg-amber-400'; confWidth = `${(currentConfidence * 100).toFixed(0)}%` }
    else { confLabel = 'Low'; confColor = 'bg-red-500'; confWidth = `${(currentConfidence * 100).toFixed(0)}%` }
  }

  const navItems = [
    { id: 'terminal', label: 'AI Terminal', icon: 'terminal', filled: true },
    { id: 'market', label: 'Market Insights', icon: 'insights', filled: false },
    { id: 'security', label: 'Security', icon: 'verified_user', filled: false },
    { id: 'assets', label: 'Assets', icon: 'account_balance_wallet', filled: false },
  ]

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('vault_token')
  }

  if (!token) {
    return <LoginScreen onLogin={(t) => { setToken(t); localStorage.setItem('vault_token', t) }} />
  }

  const togglePopover = (name) => setActivePopover(prev => prev === name ? null : name)

  return (
    <div className="bg-[#0e0e0e] text-on-surface font-body overflow-hidden">
      {/* ── Top Navigation ── */}
      <header className="fixed top-0 w-full flex justify-between items-center px-8 z-50 bg-[#0e0e0e]/80 backdrop-blur-xl h-16 border-b border-border font-headline tracking-tight">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Vault Logo" className="w-8 h-8 object-contain" />
          <div className="text-2xl font-bold text-lime">Vault</div>
        </div>
        <div className="flex items-center gap-6">
          {/* Demo Mode Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-lime/5 border border-lime/20 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></div>
            <span className="text-[10px] text-lime font-headline font-bold uppercase tracking-wider">Demo Environment</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 relative">
            <button onClick={() => togglePopover('notifications')} className="material-symbols-outlined hover:text-white transition-colors relative">
              notifications
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border border-[#0e0e0e]"></span>
            </button>
            <button onClick={() => togglePopover('settings')} className="material-symbols-outlined hover:text-white transition-colors">settings</button>
            <button onClick={() => togglePopover('profile')} className="material-symbols-outlined text-lime" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</button>

            {activePopover === 'notifications' && (
              <div className="absolute top-10 right-16 w-64 bg-[#1A1A1A] border border-border shadow-2xl rounded-xl p-4 z-50">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Recent Alerts</h4>
                <div className="space-y-3">
                  <div className="text-xs text-white border-l-2 border-red-500 pl-2">🚨 Failed 2FA bypass attempt from IP 192.168.1.5 blocked.</div>
                  <div className="text-xs text-zinc-400 border-l-2 border-lime pl-2">✅ Vault distributed ledger synced across 3 global regions.</div>
                </div>
              </div>
            )}
            {activePopover === 'settings' && (
              <div className="absolute top-10 right-8 w-48 bg-[#1A1A1A] border border-border shadow-2xl rounded-xl p-4 z-50">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Terminal Settings</h4>
                <div className="space-y-2">
                  <button className="block w-full text-left text-xs text-zinc-300 hover:text-white font-medium">API Keys Configurations</button>
                  <button className="block w-full text-left text-xs text-zinc-300 hover:text-white font-medium">Audit Log Retention</button>
                </div>
              </div>
            )}
            {activePopover === 'profile' && (
              <div className="absolute top-10 right-0 w-56 bg-[#1A1A1A] border border-border shadow-2xl rounded-xl p-4 z-50">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                  <span className="material-symbols-outlined text-lime text-2xl">shield_person</span>
                  <div>
                    <div className="text-sm font-bold text-white">Administrator</div>
                    <div className="text-[10px] text-lime uppercase tracking-widest font-bold">Level 4 Clearance</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 mb-3 font-mono">Last login: Today, 14:32:01 UTC</div>
                <button onClick={handleLogout} className="w-full border border-red-500/30 text-red-400 rounded bg-red-500/5 text-xs font-bold uppercase tracking-wider py-2 hover:bg-red-500/10 transition-colors">Emergency Terminate</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16 relative">

        {/* ── Left Sidebar ── */}
        <aside className="hidden md:flex fixed left-0 top-16 w-64 h-[calc(100vh-64px)] flex-col pt-4 bg-[#0e0e0e] border-r border-border font-headline text-sm font-medium z-40">

          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer group transition-all rounded-lg ${activeView === item.id
                  ? 'text-lime bg-lime/10 border-l-4 border-lime'
                  : 'text-zinc-500 hover:bg-surface-container hover:text-white'
                  }`}
                onClick={() => setActiveView(item.id)}
              >
                <span
                  className={`material-symbols-outlined shrink-0 ${activeView === item.id ? '' : 'group-hover:text-white'}`}
                  style={activeView === item.id && item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                >{item.icon}</span>
                <span className="text-left whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </nav>
          <div className="p-6 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-lg bg-surface-container text-zinc-400 hover:text-white hover:bg-[#1f1f1f] transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Secure Logout
            </button>
          </div>
        </aside>

        {/* ── Main Canvas ── */}
        {activeView === 'terminal' ? (
          <main className="flex-1 ml-0 md:ml-64 lg:mr-80 flex flex-col relative bg-[#0F0F0F] h-full">
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-6">

              {/* Empty State Welcome */}
              {messages.length === 0 && !loading && (
                <div className="max-w-3xl mx-auto pt-10 text-center">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-[#1A1A1A] border border-border mb-6">
                    <span className="material-symbols-outlined text-lime text-4xl">terminal</span>
                  </div>
                  <h1 className="font-headline text-4xl text-white mb-2 font-bold tracking-tight">Welcome to Vault AI Terminal</h1>
                  <p className="text-zinc-500 max-w-md mx-auto mb-10 font-body">Your high-fidelity interface for global compliance, asset auditing, and security insights.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <button
                      onClick={() => { setInput('What are the transfer limits?'); setTimeout(() => textareaRef.current?.focus(), 50) }}
                      className="p-6 bg-[#1A1A1A] border border-border rounded-xl hover:border-lime/50 transition-all group text-left"
                    >
                      <span className="material-symbols-outlined text-zinc-500 group-hover:text-lime mb-2 text-xl transition-colors">account_balance</span>
                      <p className="font-headline font-bold text-on-surface mb-1">Check transfer limits</p>
                      <p className="text-xs text-zinc-600 font-body">Review cross-border regulatory caps</p>
                    </button>
                    <button
                      onClick={() => { setInput('How does 2FA work?'); setTimeout(() => textareaRef.current?.focus(), 50) }}
                      className="p-6 bg-[#1A1A1A] border border-border rounded-xl hover:border-lime/50 transition-all group text-left"
                    >
                      <span className="material-symbols-outlined text-zinc-500 group-hover:text-lime mb-2 text-xl transition-colors">security</span>
                      <p className="font-headline font-bold text-on-surface mb-1">Audit compliance logs</p>
                      <p className="text-xs text-zinc-600 font-body">Access real-time security telemetry</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg, i) => {
                if (msg.role === 'user') {
                  return (
                    <div key={`m-${i}`} className="max-w-3xl mx-auto flex justify-end">
                      <div className="max-w-[85%] p-4 border border-border rounded-2xl rounded-tr-none text-zinc-400 bg-transparent font-body text-[15px] leading-relaxed">
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={`m-${i}`} className="max-w-3xl mx-auto">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="p-6 bg-[#1A1A1A] border border-border rounded-2xl rounded-tl-none neon-border accent-glow relative">
                          <div className="absolute -top-3 left-0 bg-lime text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-headline">AI Insight</div>
                          <TypewriterMarkdown
                            content={msg.content}
                            messageId={`msg-${i}`}
                            onType={() => chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })}
                          />
                          <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                            <div className="flex gap-2">
                              {msg.confidence > 0 ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 font-headline tracking-wide uppercase
                                  ${msg.confidence > 0.85 ? 'bg-lime/10 text-lime border-lime/20' :
                                    msg.confidence > 0.6 ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                                      'bg-red-400/10 text-red-400 border-red-400/20'}
                                `}>
                                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {msg.confidence > 0.6 ? 'verified' : 'warning'}
                                  </span>
                                  {(msg.confidence * 100).toFixed(1)}% CERTAINTY
                                </span>
                              ) : (
                                <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-1 font-headline uppercase">System Message</span>
                              )}
                            </div>
                            {msg.confidence > 0 && <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-headline font-bold">Source verified</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Loading Animation */}
              {loading && (
                <div className="max-w-3xl mx-auto flex gap-4 items-start">
                  <div className="w-8 h-8 rounded bg-[#1A1A1A] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lime animate-pulse font-bold">query_stats</span>
                  </div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-2 w-48 bg-border rounded animate-pulse"></div>
                    <div className="h-2 w-full bg-surface-container rounded animate-pulse"></div>
                    <div className="h-2 w-32 bg-surface-container rounded animate-pulse"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Floating Input */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-10 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F] to-transparent pointer-events-none">
              <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-lime/0 group-focus-within:bg-lime/5 blur-xl transition-all rounded-full pointer-events-none"></div>
                  <div className="relative flex items-center bg-[#1A1A1A] border border-border focus-within:border-lime/50 rounded-2xl px-4 py-2 transition-all shadow-2xl">
                    <button className="text-zinc-500 hover:text-white transition-colors shrink-0 p-2">
                      <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => { setInput(e.target.value); autoResize(textareaRef.current) }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      rows={1}
                      placeholder="Inquire terminal for audit details..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder-zinc-600 px-3 py-3 font-body resize-none"
                    />
                    <div className="flex items-center gap-3 shrink-0">
                      <button className="text-zinc-500 hover:text-lime transition-colors p-2 hidden sm:block">
                        <span className="material-symbols-outlined">mic</span>
                      </button>
                      <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-lime text-zinc-950 w-11 h-11 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : activeView === 'market' ? (
          <main className="flex-1 ml-0 md:ml-64 lg:mr-80 flex flex-col bg-[#0F0F0F] h-full">
            <MarketInsightsView />
          </main>
        ) : activeView === 'security' ? (
          <main className="flex-1 ml-0 md:ml-64 lg:mr-80 flex flex-col bg-[#0F0F0F] h-full">
            <SecurityView />
          </main>
        ) : activeView === 'assets' ? (
          <main className="flex-1 ml-0 md:ml-64 lg:mr-80 flex flex-col bg-[#0F0F0F] h-full">
            <AssetsView />
          </main>
        ) : null}

        {/* ── Right Sidebar ── */}
        <aside className="hidden lg:flex flex-col fixed right-0 top-16 w-80 h-[calc(100vh-64px)] p-6 bg-[#0e0e0e] border-l border-border font-headline z-40 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-1 font-bold">Summary</h2>
            <h3 className="text-white font-medium text-[15px]">Compliance & Sources</h3>
          </div>

          <div className="space-y-6 flex-1">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#1c1b1b] mb-4">
              <button
                onClick={() => setRightPanelTab('sources')}
                className={`${rightPanelTab === 'sources' ? 'text-white border-b border-lime pb-2 text-[11px] uppercase tracking-widest font-bold' : 'text-zinc-600 pb-2 text-[11px] uppercase tracking-widest hover:text-zinc-300 transition-opacity font-bold'}`}
              >
                Document Sources
              </button>
              <button
                onClick={() => setRightPanelTab('logs')}
                className={`${rightPanelTab === 'logs' ? 'text-white border-b border-lime pb-2 text-[11px] uppercase tracking-widest font-bold' : 'text-zinc-600 pb-2 text-[11px] uppercase tracking-widest hover:text-zinc-300 transition-opacity font-bold'}`}
              >
                Compliance Logs
              </button>
            </div>

            {/* Reference Cards */}
            {rightPanelTab === 'sources' ? (
              latestReferences.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-zinc-800 text-3xl mb-3 block">folder_open</span>
                  <p className="text-xs text-zinc-600 font-body">No sources referenced in current session.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestReferences.map((ref, idx) => {
                    const extMatch = ref.source.match(/\.([a-z0-9]+)$/i)
                    const ext = extMatch ? extMatch[1].toUpperCase() : 'DOC'
                    return (
                      <div key={idx} className="p-4 bg-[#1A1A1A] border border-border rounded-xl relative group cursor-pointer hover:border-zinc-700 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[10px] bg-surface-container text-lime px-2 py-0.5 rounded font-bold uppercase tracking-tighter">[{idx + 1}] {ext}</span>
                          <span className="material-symbols-outlined text-zinc-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {ext === 'PDF' ? 'picture_as_pdf' : 'description'}
                          </span>
                        </div>
                        <p className="font-headline font-bold text-sm text-white mb-1 truncate">{normalizeSource(ref.source)}</p>
                        <p className="text-[11px] text-zinc-500 line-clamp-3 font-body leading-relaxed">"{ref.snippet}"</p>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="space-y-2 max-h-64 pr-1">
                {[
                  `[${new Date().toISOString().substring(11, 19)}] INIT LLAMA-3.1-8B-INSTANT`,
                  `[${new Date().toISOString().substring(11, 19)}] V-STORE CONNECTED: CHROMA 0.5.5`,
                  `[${new Date().toISOString().substring(11, 19)}] PII PURGE CHECK: PASS`,
                  `[${new Date().toISOString().substring(11, 19)}] QUERY CACHE HIT: FALSE`,
                  `[${new Date().toISOString().substring(11, 19)}] SOC2 AUDIT LOCK ENABLED`,
                  `[${new Date().toISOString().substring(11, 19)}] E2E ENCRYPTION HANDSHAKE VERIFIED`
                ].map((log, i) => (
                  <div key={i} className="font-mono text-[10px] text-zinc-400 bg-surface-container px-3 py-2 rounded-lg border border-border shadow-inner">
                    <span className="text-lime">{log.split(']')[0]}]</span>{log.split(']')[1]}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            {/* Audit Confidence */}
            <div className="pt-6 border-t border-[#1c1b1b]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase text-zinc-500 tracking-widest font-bold">Audit Confidence</span>
                <span className={`text-[10px] font-bold ${currentConfidence === null || currentConfidence < 0.6 ? 'text-zinc-500' : 'text-lime'}`}>{confLabel}</span>
              </div>
              <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full ${confColor} transition-all duration-1000 ease-in-out`}
                  style={{ width: confWidth, boxShadow: currentConfidence > 0.85 ? '0 0 8px rgba(189,255,0,0.5)' : 'none' }}
                />
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
