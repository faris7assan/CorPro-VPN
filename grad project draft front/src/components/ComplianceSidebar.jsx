import React from 'react'
import { Shield, ShieldCheck, ShieldX, Monitor, HardDrive, Lock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

export default function ComplianceSidebar({ isVisible, results, isScanning, onRetry }) {
  if (!isVisible && !isScanning) return null

  const checks = [
    {
      id: 'os',
      label: 'Windows Version',
      icon: Monitor,
      pass: results?.os?.pass,
      detail: results?.os?.label || 'Checking build...',
      requirement: 'Windows 10 or 11 required'
    },
    {
      id: 'firewall',
      label: 'Firewall',
      icon: Lock,
      pass: results?.firewall?.pass,
      detail: results?.firewall?.pass ? 'All profiles active' : 'Firewall is disabled',
      requirement: 'Network firewall must be enabled'
    },
    {
      id: 'defender',
      label: 'Windows Defender',
      icon: Shield,
      pass: results?.defender?.pass,
      detail: results?.defender?.pass ? 'Active protection' : 'Defender is disabled',
      requirement: 'Real-time protection required'
    },
    {
      id: 'disk',
      label: 'System Storage',
      icon: HardDrive,
      pass: results?.disk?.pass,
      detail: results?.disk?.freeGb !== undefined ? `${results.disk.freeGb} GB available` : 'Checking space...',
      requirement: 'Minimum 2 GB free space'
    }
  ]

  const allPass = results?.overall

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-[#060818]/95 backdrop-blur-xl border-l border-white/10 z-40 transform transition-transform duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isVisible || isScanning ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <ShieldCheck size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Compliance Scan</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Zero-Trust Security</p>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {checks.map((check) => {
            const Icon = check.icon
            const isDone = results && !isScanning
            const isPassing = check.pass

            return (
              <div key={check.id} className={`p-4 rounded-2xl border transition-all duration-300 ${isScanning ? 'bg-white/5 border-white/5 animate-pulse' : isPassing ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isScanning ? 'bg-slate-800' : isPassing ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    <Icon size={18} className={isScanning ? 'text-slate-500' : isPassing ? 'text-emerald-400' : 'text-red-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{check.label}</p>
                      {isScanning ? (
                        <Loader2 size={12} className="text-cyan-500 animate-spin" />
                      ) : isPassing ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                    </div>
                    <p className={`text-[10px] mt-1 line-clamp-1 ${isScanning ? 'text-slate-500' : isPassing ? 'text-emerald-300/70' : 'text-red-300/70'}`}>
                      {isScanning ? 'Scanning...' : check.detail}
                    </p>
                    {!isPassing && !isScanning && (
                      <p className="text-[9px] mt-1.5 text-red-500/60 leading-tight">
                        {check.requirement}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!isScanning && results && !allPass && (
          <div className="mt-8 space-y-3">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <AlertTriangle size={16} className="text-amber-400 shrink-0" />
              <p className="text-[10px] text-amber-300 leading-normal">
                Your device is <span className="font-bold">non-compliant</span>. Access to the VPN gateway is restricted until all security requirements are met.
              </p>
            </div>
            <button
              onClick={onRetry}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
            >
              Scan Again
            </button>
          </div>
        )}

        {isScanning && (
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-500 animate-pulse font-medium">Querying System Config...</p>
          </div>
        )}
      </div>
    </div>
  )
}
