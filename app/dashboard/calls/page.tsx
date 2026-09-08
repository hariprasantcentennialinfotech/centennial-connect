'use client'

import * as React from 'react'
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Phone,
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
  RefreshCw,
  Trash2,
  Sparkles,
  PhoneOff,
  User,
  MessageSquare,
  BarChart2,
  Check,
  Save,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { calls as initialCalls } from '@/lib/mock-data'
import { getCallsAction, updateCallNotesAction, deleteCallAction } from '@/app/actions/calls'
import { useTelephony } from '@/hooks/use-webrtc-call'
import { CallAudioPlayer } from '@/components/telephony/call-audio-player'
import type { Call, CallType, CallStatus, CallSentiment } from '@/lib/types'

export default function CallsPage() {
  const [callsList, setCallsList] = React.useState<Call[]>(initialCalls)
  const [activeTypeFilter, setActiveTypeFilter] = React.useState<'all' | 'inbound' | 'outbound' | 'ai' | 'missed'>('all')
  const [search, setSearch] = React.useState('')
  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null)
  const [modalTab, setModalTab] = React.useState<'audio' | 'intelligence'>('audio')
  const [editedNotes, setEditedNotes] = React.useState('')
  const [isSavingNotes, setIsSavingNotes] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [lastSynced, setLastSynced] = React.useState('Just now')

  const telephony = useTelephony()

  // Fetch calls from Server Action
  const fetchCalls = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getCallsAction()
      if (res.success && res.calls && res.calls.length > 0) {
        setCallsList(res.calls)
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch {
      // Fallback silently to current state
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  // Sync list when WebRTC call finishes
  React.useEffect(() => {
    if (telephony.callState === 'disconnected') {
      const timeout = setTimeout(() => {
        fetchCalls()
      }, 1800)
      return () => clearTimeout(timeout)
    }
  }, [telephony.callState, fetchCalls])

  // When a call is selected, initialize notes
  React.useEffect(() => {
    if (selectedCall) {
      setEditedNotes(selectedCall.notes || '')
      setSaveSuccess(false)
    }
  }, [selectedCall])

  const filtered = callsList.filter((call) => {
    if (activeTypeFilter === 'missed' && call.status !== 'missed') return false
    if (activeTypeFilter !== 'all' && activeTypeFilter !== 'missed' && call.type !== activeTypeFilter) return false

    const q = search.toLowerCase()
    const matchSearch =
      call.contactName.toLowerCase().includes(q) ||
      call.phone.includes(search) ||
      call.agent.toLowerCase().includes(q) ||
      (call.notes && call.notes.toLowerCase().includes(q))
    return matchSearch
  })

  const formatDuration = (sec: number) => {
    if (sec === 0) return '0s'
    const mins = Math.floor(sec / 60)
    const rem = sec % 60
    return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`
  }

  // Handle saving notes
  const handleSaveNotes = async () => {
    if (!selectedCall) return
    setIsSavingNotes(true)
    try {
      const res = await updateCallNotesAction({
        callId: selectedCall.id,
        notes: editedNotes,
      })
      if (res.success) {
        setSaveSuccess(true)
        setCallsList((prev) =>
          prev.map((c) => (c.id === selectedCall.id ? { ...c, notes: editedNotes } : c))
        )
        setSelectedCall((prev) => (prev ? { ...prev, notes: editedNotes } : null))
        setTimeout(() => setSaveSuccess(false), 2500)
      }
    } catch {
      // Handle error
    } finally {
      setIsSavingNotes(false)
    }
  }

  // Handle call deletion
  const handleDeleteCall = async (callId: string) => {
    if (!confirm('Are you sure you want to delete this call log?')) return
    try {
      await deleteCallAction(callId)
      setCallsList((prev) => prev.filter((c) => c.id !== callId))
      if (selectedCall?.id === callId) setSelectedCall(null)
    } catch {}
  }

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Call ID', 'Contact Name', 'Phone', 'Type', 'Agent', 'Status', 'Duration (s)', 'Timestamp', 'Sentiment', 'Notes']
    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${c.contactName}"`,
      `"${c.phone}"`,
      `"${c.type}"`,
      `"${c.agent}"`,
      `"${c.status}"`,
      c.durationSeconds,
      `"${c.timestamp}"`,
      `"${c.sentiment || 'neutral'}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `centennial-connect-calls-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // KPI Calculations
  const totalCalls = callsList.length
  const completedCalls = callsList.filter((c) => c.status === 'completed').length
  const aiCalls = callsList.filter((c) => c.type === 'ai').length
  const totalSeconds = callsList.reduce((acc, c) => acc + (c.durationSeconds || 0), 0)
  const avgDurationSeconds = totalCalls > 0 ? Math.round(totalSeconds / totalCalls) : 0

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Call History & Recordings"
        subheading="Live telephony logs, dual-track recordings, and AI call sentiment analysis"
        badge="Call Records"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCalls}
            disabled={isLoading}
            className="gap-1.5 rounded-xl text-xs"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 rounded-xl text-xs"
          >
            <Download className="size-3.5" />
            Export Call Logs
          </Button>
        </div>
      </PageHeader>

      {/* Active Softphone Call Banner */}
      {telephony.isCallActive && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-primary/40 bg-gradient-to-r from-brand-primary/15 via-brand-primary/10 to-transparent p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/30">
                <PhoneCall className="size-5 animate-bounce" />
                <span className="absolute -top-1 -right-1 size-3 animate-ping rounded-full bg-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                    Active Softphone Call
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] uppercase font-mono">
                    {telephony.callState}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{telephony.contactName || 'Connected Party'}</span>
                  <span className="font-mono text-xs text-muted-foreground">{telephony.remoteNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-xs font-bold text-foreground">
                <Clock className="size-3.5 text-brand-primary" />
                {telephony.formattedDuration}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={telephony.endCall}
                className="gap-1.5 rounded-xl text-xs"
              >
                <PhoneOff className="size-3.5" />
                End Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Telephony Metrics Ribbon */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Calls</span>
            <PhoneCall className="size-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{totalCalls}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Across all phone channels</div>
        </Card>

        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Completed</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{completedCalls}</div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0}% completion rate
          </div>
        </Card>

        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI Handled</span>
            <Bot className="size-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{aiCalls}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {totalCalls > 0 ? Math.round((aiCalls / totalCalls) * 100) : 0}% autonomous voice
          </div>
        </Card>

        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Duration</span>
            <Clock className="size-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
            {formatDuration(avgDurationSeconds)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Total {Math.round(totalSeconds / 60)} call minutes
          </div>
        </Card>
      </div>

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

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Synced: {lastSynced}
            </span>
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
                <th className="py-3.5 px-4">Sentiment</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PhoneCall className="size-8 text-muted-foreground/40" />
                      <p className="font-semibold text-foreground">No call records found</p>
                      <p className="text-xs">Adjust your search terms or filter selection</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((call) => (
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
                            : call.status === 'voicemail'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          call.sentiment === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : call.sentiment === 'negative'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            call.sentiment === 'positive'
                              ? 'bg-emerald-500'
                              : call.sentiment === 'negative'
                              ? 'bg-rose-500'
                              : 'bg-muted-foreground'
                          }`}
                        />
                        {call.sentiment || 'neutral'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Dial / Call Back */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => telephony.startCall(call.phone, call.contactName)}
                          className="size-8 rounded-lg p-0 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                          title={`Call ${call.contactName} via Softphone`}
                        >
                          <Phone className="size-3.5" />
                        </Button>

                        {/* Review / Audio */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCall(call)}
                          className="h-8 gap-1 rounded-lg text-xs text-brand-primary hover:bg-brand-primary/10"
                        >
                          <Volume2 className="size-3.5" />
                          Review
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCall(call.id)}
                          className="size-8 rounded-lg p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete record"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Call Intelligence & Audio Playback Modal */}
      <Dialog open={Boolean(selectedCall)} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCall && (
            <div className="space-y-4 py-1">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <span>{selectedCall.contactName}</span>
                      <span className="font-mono text-xs font-normal text-muted-foreground">
                        ({selectedCall.phone})
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      Interacted with <span className="font-medium text-foreground">{selectedCall.agent}</span> on{' '}
                      {new Date(selectedCall.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at {new Date(selectedCall.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </DialogDescription>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      selectedCall.type === 'ai'
                        ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20'
                        : selectedCall.type === 'inbound'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-violet-500/10 text-violet-600'
                    }`}
                  >
                    {selectedCall.type === 'ai' && <Bot className="size-3" />}
                    {selectedCall.type}
                  </span>
                </div>
              </DialogHeader>

              {/* Tab navigation */}
              <Tabs value={modalTab} onValueChange={(v) => setModalTab(v as 'audio' | 'intelligence')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="audio" className="text-xs gap-1.5">
                    <Volume2 className="size-3.5" />
                    Recording & Transcript
                  </TabsTrigger>
                  <TabsTrigger value="intelligence" className="text-xs gap-1.5">
                    <Sparkles className="size-3.5 text-brand-primary" />
                    AI Intelligence & Notes
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: Recording & Transcript */}
                <TabsContent value="audio" className="space-y-4 pt-3">
                  {/* Interactive Audio Player */}
                  <CallAudioPlayer call={selectedCall} />

                  {/* Transcript Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-brand-primary" />
                      Conversation Transcript
                    </h4>

                    {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                      <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs">
                        {selectedCall.transcript.map((turn, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-3 ${
                              turn.speaker === 'agent' ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            {turn.speaker === 'agent' && (
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary text-[10px] font-bold">
                                {selectedCall.type === 'ai' ? <Bot className="size-3.5" /> : 'AG'}
                              </div>
                            )}

                            <div
                              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                                turn.speaker === 'agent'
                                  ? 'bg-card border border-border/80 text-foreground'
                                  : 'bg-brand-primary text-white'
                              }`}
                            >
                              <div className="mb-1 text-[10px] font-semibold opacity-70">
                                {turn.speaker === 'agent' ? selectedCall.agent : selectedCall.contactName}
                              </div>
                              <p className="leading-relaxed">{turn.text}</p>
                            </div>

                            {turn.speaker !== 'agent' && (
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground text-[10px] font-bold">
                                <User className="size-3.5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        No audio transcript recorded for this call.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: AI Intelligence & Notes */}
                <TabsContent value="intelligence" className="space-y-4 pt-3">
                  {/* AI Summary Card */}
                  <div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-brand-primary" />
                        AI Executive Summary
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          selectedCall.sentiment === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : selectedCall.sentiment === 'negative'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {selectedCall.sentiment || 'neutral'} Sentiment
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {selectedCall.summary ||
                        'Call completed successfully. No critical escalation flags raised. Routine account interaction.'}
                    </p>
                  </div>

                  {/* Call Diagnostics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-border/70 bg-card p-2.5 text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Direction</span>
                      <p className="text-xs font-bold capitalize mt-0.5 text-foreground">{selectedCall.direction || selectedCall.type}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card p-2.5 text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Duration</span>
                      <p className="text-xs font-bold font-mono mt-0.5 text-foreground">{formatDuration(selectedCall.durationSeconds)}</p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card p-2.5 text-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Call Status</span>
                      <p className="text-xs font-bold capitalize mt-0.5 text-foreground">{selectedCall.status}</p>
                    </div>
                  </div>

                  {/* Editable Agent Notes */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-brand-primary" />
                        Agent Call Notes & Disposition
                      </label>
                      {saveSuccess && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <Check className="size-3" />
                          Saved to MongoDB
                        </span>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add or update notes for this call..."
                      className="text-xs rounded-xl bg-card"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="gap-1.5 rounded-xl bg-brand-primary text-white text-xs"
                      >
                        <Save className="size-3.5" />
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
