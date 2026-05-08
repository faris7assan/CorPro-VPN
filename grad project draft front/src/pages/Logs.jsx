import { useState, useEffect, useRef } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import LogEntry from '../components/LogEntry'
import { AUTH_API } from '../lib/api'

const TABS = ['All', 'Info', 'Warning', 'Error', 'Success']

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const currentUser = JSON.parse(localStorage.getItem('vpn_user') || '{}')
      if (!currentUser.email) return

      const res = await fetch(`${AUTH_API}/audit-logs?callerEmail=${encodeURIComponent(currentUser.email)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch logs')

      const mappedLogs = data.map(entry => {
        return {
          id: entry.id,
          level: entry.level,
          message: entry.message,
          time: new Date(entry.time).toLocaleString(),
        }
      })
      setLogs(mappedLogs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Auto-scroll to bottom on first load
  useEffect(() => {
    if (logs.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs.length])

  const filtered = filter === 'All'
    ? logs
    : logs.filter(l => l.level === filter.toLowerCase())

  const counts = {
    info:    logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error:   logs.filter(l => l.level === 'error').length,
    success: logs.filter(l => l.level === 'success').length,
  }

  return (
    <div className="h-full flex flex-col px-8 py-8">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
            <p className="text-sm text-slate-500 mt-0.5">{logs.length} entries · Backend System Logs</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm
                text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/8"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm
                text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
            >
              <Trash2 size={14} />
              Clear View
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-4 flex-shrink-0">
          {[
            { label: 'Info',    count: counts.info,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
            { label: 'Success', count: counts.success, color: 'text-neon-green', bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
            { label: 'Warning', count: counts.warning, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            { label: 'Error',   count: counts.error,   color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl px-4 py-3`}>
              <div className={`text-xl font-bold font-mono ${color}`}>{count}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4 flex-shrink-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200
                ${filter === t
                  ? 'bg-cyan-500/20 text-neon-cyan border border-cyan-500/25'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Log Feed */}
        <div className="flex-1 overflow-y-auto glass-card p-3 font-mono">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 mb-3 pb-3 border-b border-white/5">
            <span className="text-xs text-slate-600">STATIC VIEW</span>
            <span className="ml-auto text-xs text-slate-700">{filtered.length} entries shown</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
              Loading logs from Supabase...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
              No {filter.toLowerCase()} entries
            </div>
          ) : (
            filtered.map((log, i) => <LogEntry key={log.id} log={log} index={i} />)
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
