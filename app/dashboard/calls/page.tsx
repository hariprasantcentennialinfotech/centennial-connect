'use client'

import * as React from 'react'
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Bot,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  Volume2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { calls as initialCalls } from '@/lib/mock-data'
import type { Call, CallType, CallStatus } from '@/lib/types'

export default function CallsPage() {
  const [callsList, setCallsList] = React.useState<Call[]>(initialCalls)
  const [activeTypeFilter, setActiveTypeFilter] = React.useState<'all' | 'inbound' | 'outbound' | 'ai' | 'missed'>('all')
  const [search, setSearch] = React.useState('')
  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false)

  const filtered = callsList.filter((call) => {
    if (activeTypeFilter === 'missed' && call.status !== 'missed') return false
    if (activeTypeFilter !== 'all' && activeTypeFilter !== 'missed' && call.type !== activeTypeFilter) return false

    const matchSearch =
      call.contactName.toLowerCase().includes(search.toLowerCase()) ||
      call.phone.includes(search) ||
      call.agent.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const formatDuration = (sec: number) => {
    if (sec === 0) return '0s'
    const mins = Math.floor(sec / 60)
    const rem = sec % 60
    return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Call History & Recordings"
        subheading="Search and review inbound, outbound, and AI-handled voice interactions"
        badge="Call Records"
      >
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
          <Download className="size-3.5" />
          Export Call Logs
        </Button>
      </PageHeader>

      {/* Tabs and Search Bar */}
      <Card className="p-4 border-border/80 bg-card/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/80 bg-muted/30 p-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Calls' },
              { id: 'inbound', label: 'Inbound' },
              { id: 'outbound', label: 'Outbound' },
              { id: 'ai', label: 'AI Voice' },
              { id: 'missed', label: 'Missed' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTypeFilter(tab.id as typeof activeTypeFilter)}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  activeTypeFilter === tab.id
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contact, phone or agent..."
              className="h-9 pl-9 text-xs rounded-xl bg-muted/40"
            />
          </div>
        </div>
      </Card>

      {/* Calls Table */}
      <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 px-5">Contact / Target</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Assigned Agent</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((call) => (
                <tr key={call.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-foreground">{call.contactName}</div>
                    <span className="font-mono text-[10px] text-muted-foreground">{call.phone}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        call.type === 'ai'
                          ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20'
                          : call.type === 'inbound'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      }`}
                    >
                      {call.type === 'ai' && <Bot className="size-3" />}
                      {call.type === 'inbound' && <PhoneIncoming className="size-3" />}
                      {call.type === 'outbound' && <PhoneOutgoing className="size-3" />}
                      {call.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">{call.agent}</td>
                  <td className="py-4 px-4 font-mono font-medium">{formatDuration(call.durationSeconds)}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        call.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : call.status === 'missed'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {call.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-4 px-5 text-right">
                    {call.durationSeconds > 0 ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCall(call)}
                        className="h-8 gap-1.5 text-xs text-brand-primary hover:bg-brand-primary/10"
                      >
                        <Volume2 className="size-3.5" />
                        Listen
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audio Playback Modal */}
      <Dialog open={Boolean(selectedCall)} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Call Audio & Transcript</DialogTitle>
            <DialogDescription className="text-xs">
              Interaction between {selectedCall?.contactName} and {selectedCall?.agent}
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-4 py-3">
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-foreground font-mono">{selectedCall.phone}</span>
                  <span className="text-muted-foreground">{formatDuration(selectedCall.durationSeconds)}</span>
                </div>

                {/* Simulated Waveform */}
                <div className="flex items-center justify-center gap-1 h-12 py-2">
                  {[20, 45, 75, 30, 90, 60, 40, 85, 55, 35, 70, 95, 45, 25, 60, 80].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-full transition-all ${
                        isPlayingAudio ? 'bg-brand-primary animate-pulse' : 'bg-muted-foreground/40'
                      }`}
                      style={{ height: `${isPlayingAudio ? h : 20}%` }}
                    />
                  ))}
                </div>

                {/* Play controls */}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="gap-2 rounded-xl bg-brand-primary text-white"
                  >
                    {isPlayingAudio ? <Pause className="size-4" /> : <Play className="size-4" />}
                    {isPlayingAudio ? 'Pause Audio' : 'Play Recording'}
                  </Button>
                </div>
              </div>

              {selectedCall.notes && (
                <div className="rounded-xl border border-border/80 bg-card p-3 text-xs">
                  <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                    <FileText className="size-3.5 text-brand-primary" />
                    Agent Notes
                  </p>
                  <p className="text-muted-foreground leading-relaxed">{selectedCall.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
