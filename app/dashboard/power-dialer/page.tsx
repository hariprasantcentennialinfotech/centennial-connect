'use client'

import * as React from 'react'
import {
  PhoneCall,
  PhoneOff,
  Pause,
  Play,
  Mic,
  MicOff,
  FastForward,
  CheckCircle2,
  ListOrdered,
  PlusCircle,
  RefreshCcw,
  Loader2,
  Radio,
  Target,
  BarChart3,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useTelephony } from '@/components/telephony/telephony-context'
import {
  startCampaignAction,
  pauseCampaignAction,
  dialNextContactAction,
  logCallOutcomeAction,
} from '@/app/actions/dialer'
import { campaigns as initialCampaigns, dialerContacts as initialQueue } from '@/lib/mock-data'

type Disposition = 'interested' | 'callback' | 'voicemail' | 'not-interested' | 'no-answer' | 'busy'

const DISPOSITIONS: { id: Disposition; label: string; color: string }[] = [
  { id: 'interested', label: '✅ Demo Booked', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' },
  { id: 'callback', label: '📅 Call Back', color: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' },
  { id: 'voicemail', label: '📬 Left Voicemail', color: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20' },
  { id: 'not-interested', label: '🚫 Not Interested', color: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20' },
  { id: 'no-answer', label: '📵 No Answer', color: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' },
  { id: 'busy', label: '🔔 Busy Signal', color: 'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20' },
]

export default function PowerDialerPage() {
  const telephony = useTelephony()

  // Campaign & queue state
  const [campaigns, setCampaigns] = React.useState(initialCampaigns)
  const [selectedCampaignId, setSelectedCampaignId] = React.useState(initialCampaigns[0].id)
  const [queue, setQueue] = React.useState(initialQueue)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  // Disposition & notes state
  const [disposition, setDisposition] = React.useState<Disposition>('interested')
  const [callNotes, setCallNotes] = React.useState('')
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  // Action loading states
  const [isCampaignLoading, setIsCampaignLoading] = React.useState(false)
  const [isDialing, setIsDialing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0]
  const currentContact = queue[currentIndex] || queue[0]
  const isCallLive = telephony.isCallActive || telephony.callState === 'connecting'

  // Sync webrtc call state back to local — when call ends, mark ready for disposition
  const prevCallActive = React.useRef(false)
  React.useEffect(() => {
    if (prevCallActive.current && !telephony.isCallActive && telephony.callState === 'idle') {
      // call ended externally (via overlay hangup) — nothing extra needed
    }
    prevCallActive.current = telephony.isCallActive
  }, [telephony.isCallActive, telephony.callState])

  // ─── Campaign Actions ───────────────────────────────────────────────────────
  const handleToggleCampaign = async () => {
    setIsCampaignLoading(true)
    setActionError(null)
    try {
      if (activeCampaign.status === 'active') {
        await pauseCampaignAction(activeCampaign.id)
        setCampaigns((prev) =>
          prev.map((c) => (c.id === activeCampaign.id ? { ...c, status: 'paused' as const } : c))
        )
      } else {
        await startCampaignAction(activeCampaign.id)
        setCampaigns((prev) =>
          prev.map((c) => (c.id === activeCampaign.id ? { ...c, status: 'active' as const } : c))
        )
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Campaign action failed')
    } finally {
      setIsCampaignLoading(false)
    }
  }

  // ─── Dial Next Lead (WebRTC + Server Action) ────────────────────────────────
  const handleDial = async () => {
    if (isCallLive) return
    setIsDialing(true)
    setActionError(null)
    try {
      // Fire the telephony provider action (records call in MongoDB)
      const result = await dialNextContactAction({
        campaignId: activeCampaign.id,
        contactId: currentContact.id,
        fromNumber: activeCampaign.callerId,
      })
      if ('error' in result) {
        setActionError(result.error as string)
        return
      }
      // Also trigger in-browser WebRTC so call overlay opens
      await telephony.startCall(currentContact.phone, currentContact.name)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Dial failed')
    } finally {
      setIsDialing(false)
    }
  }

  // ─── Save Disposition & Advance to Next Lead ───────────────────────────────
  const handleSaveAndNext = async () => {
    setIsSaving(true)
    setActionError(null)
    try {
      // Hang up if still live
      if (telephony.isCallActive) telephony.endCall()

      // Log call outcome in MongoDB
      if (telephony.callId) {
        await logCallOutcomeAction({
          callId: telephony.callId,
          status: disposition,
          durationSeconds: telephony.callDuration,
          notes: callNotes,
        })
      }

      // Update local campaign stats optimistically
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === activeCampaign.id
            ? {
                ...c,
                callsCompleted: c.callsCompleted + 1,
                callsRemaining: Math.max(0, c.callsRemaining - 1),
                connected:
                  disposition === 'interested' || disposition === 'callback'
                    ? c.connected + 1
                    : c.connected,
              }
            : c
        )
      )

      setSavedSuccess(true)
      setTimeout(() => {
        setSavedSuccess(false)
        const nextIdx = (currentIndex + 1) % queue.length
        setCurrentIndex(nextIdx)
        setCallNotes('')
        setDisposition('interested')
      }, 900)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const campaignProgress = activeCampaign.callsCompleted / activeCampaign.contactCount

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Power Dialer Workbench"
        subheading="High-velocity outbound calling engine with integrated CRM logging and local presence"
        badge="Progressive Engine"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Campaign:</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.dialingMode})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleCampaign}
            disabled={isCampaignLoading}
            className="gap-1.5 rounded-xl"
          >
            {isCampaignLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : activeCampaign.status === 'active' ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {activeCampaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
          </Button>
        </div>
      </PageHeader>

      {/* Error Banner */}
      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          ⚠️ {actionError}
        </div>
      )}

      {/* Campaign Progress Ribbon */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <span className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <BarChart3 className="size-3" /> Calls Done
            </span>
            <p className="font-display text-xl font-bold mt-0.5">
              {activeCampaign.callsCompleted} / {activeCampaign.contactCount}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Radio className="size-3" /> Connected
            </span>
            <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCampaign.connected}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Target className="size-3" /> Conversion
            </span>
            <p className="font-display text-xl font-bold text-brand-primary mt-0.5">{activeCampaign.conversionRate}%</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Remaining
            </span>
            <p className="font-display text-xl font-bold mt-0.5">{activeCampaign.callsRemaining}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Status</span>
            <div className="mt-1">
              <Badge
                variant="outline"
                className={
                  activeCampaign.status === 'active'
                    ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : 'text-amber-600 border-amber-500/30 bg-amber-500/10'
                }
              >
                {activeCampaign.status === 'active' ? '● Active' : '⏸ Paused'}
              </Badge>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-700"
            style={{ width: `${campaignProgress * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">{Math.round(campaignProgress * 100)}% of campaign completed · Caller ID: <span className="font-mono">{activeCampaign.callerId}</span></p>
      </div>

      {/* 3-Column Dialer Workbench */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Column 1: Queue */}
        <Card className="lg:col-span-3 border-border/80 bg-card/60">
          <CardHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ListOrdered className="size-4" />
              Dialing Queue
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">{queue.length} Leads</Badge>
          </CardHeader>
          <CardContent className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {queue.map((contact, idx) => {
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => {
                    if (!isCallLive) {
                      setCurrentIndex(idx)
                      setCallNotes('')
                      setDisposition('interested')
                    }
                  }}
                  disabled={isCallLive}
                  className={`w-full text-left rounded-xl p-3 text-xs transition-colors flex items-center justify-between ${
                    isCurrent
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'hover:bg-muted/60 text-foreground disabled:opacity-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{contact.name}</p>
                    <p className={`text-[11px] truncate ${isCurrent ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {contact.company}
                    </p>
                    <p className={`text-[10px] font-mono truncate ${isCurrent ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                      {contact.phone}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className={`size-2 rounded-full shrink-0 ${isCallLive ? 'bg-white animate-ping' : 'bg-white/60'}`} />
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Column 2: Live Call Stage */}
        <Card className="lg:col-span-5 border-border/80 bg-gradient-to-b from-card to-card/70 flex flex-col justify-between overflow-hidden">
          <div className="p-6 text-center space-y-4">
            {/* Status Pill */}
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
              isCallLive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
                : telephony.callState === 'idle'
                  ? 'bg-muted text-muted-foreground ring-border'
                  : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
            }`}>
              <span className={`size-2 rounded-full ${
                isCallLive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
              }`} />
              <span>
                {telephony.callState === 'connecting' ? 'CONNECTING…' :
                 telephony.callState === 'ringing' ? 'RINGING…' :
                 telephony.callState === 'connected' ? (telephony.isOnHold ? 'ON HOLD' : 'CONNECTED IN AUDIO') :
                 'READY TO DIAL'}
              </span>
            </div>

            {/* Contact Large Avatar & Name */}
            <div className="space-y-1">
              <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-brand-primary/10 text-brand-primary ring-2 ring-brand-primary/20 text-2xl font-bold font-display">
                {currentContact.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <h2 className="text-xl font-bold font-display text-foreground">{currentContact.name}</h2>
              <p className="text-xs text-muted-foreground">{currentContact.company}</p>
              <p className="font-mono text-xs text-brand-primary font-semibold">{currentContact.phone}</p>
            </div>

            {/* Live Audio Visualizer */}
            <div className="flex h-12 items-center justify-center gap-1.5 py-2">
              {[24, 38, 56, 32, 48, 64, 42, 28, 50, 68, 35, 20].map((h, i) => (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isCallLive && !telephony.isOnHold
                      ? 'bg-brand-primary animate-pulse'
                      : 'bg-muted'
                  }`}
                  style={{
                    height: isCallLive && !telephony.isOnHold ? `${h}%` : '6px',
                    animationDelay: `${i * 75}ms`,
                  }}
                />
              ))}
            </div>

            {/* Timer — from telephony context when live, else 00:00 */}
            <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
              {isCallLive ? telephony.formattedDuration : '00:00'}
            </div>
          </div>

          {/* Call Stage Controls */}
          <div className="border-t border-border/80 bg-muted/20 p-5">
            <div className="flex items-center justify-center gap-4">
              {/* Mute — delegates to telephony context */}
              <button
                type="button"
                onClick={() => telephony.toggleMute()}
                disabled={!isCallLive}
                className={`flex size-12 items-center justify-center rounded-2xl border transition-colors disabled:opacity-30 ${
                  telephony.isMuted
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                    : 'border-border/80 bg-card text-muted-foreground hover:text-foreground'
                }`}
                title={telephony.isMuted ? 'Unmute' : 'Mute'}
              >
                {telephony.isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>

              {/* Hold */}
              <button
                type="button"
                onClick={() => telephony.toggleHold()}
                disabled={!isCallLive}
                className={`flex size-12 items-center justify-center rounded-2xl border transition-colors disabled:opacity-30 ${
                  telephony.isOnHold
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                    : 'border-border/80 bg-card text-muted-foreground hover:text-foreground'
                }`}
                title={telephony.isOnHold ? 'Resume' : 'Hold'}
              >
                <Pause className="size-5" />
              </button>

              {/* Dial / Hangup */}
              {isCallLive ? (
                <button
                  type="button"
                  onClick={() => telephony.endCall()}
                  className="flex size-14 items-center justify-center rounded-3xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition-transform active:scale-95"
                  title="Hang up call"
                >
                  <PhoneOff className="size-6" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDial}
                  disabled={isDialing || activeCampaign.status === 'paused'}
                  className="flex size-14 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-transform active:scale-95 disabled:opacity-50"
                  title="Dial this lead"
                >
                  {isDialing ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <PhoneCall className="size-6" />
                  )}
                </button>
              )}
            </div>
            {activeCampaign.status === 'paused' && !isCallLive && (
              <p className="text-center text-[11px] text-amber-600 mt-3">Campaign is paused — resume to dial</p>
            )}
          </div>
        </Card>

        {/* Column 3: Disposition & CRM Notes */}
        <Card className="lg:col-span-4 border-border/80 bg-card/60 flex flex-col justify-between">
          <CardHeader className="p-4 border-b border-border/70">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Call Disposition & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-1">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Outcome</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {DISPOSITIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDisposition(d.id)}
                    className={`rounded-xl border p-2 text-xs font-semibold transition-colors ${
                      disposition === d.id
                        ? `${d.color} ring-1`
                        : 'border-border/80 bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Call Notes & Follow-up</label>
              <Textarea
                rows={5}
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Log discussion takeaways, next steps, objections..."
                className="mt-1.5 rounded-xl text-xs bg-muted/40"
              />
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Logged to CRM! Loading next contact…</span>
              </div>
            )}

            {/* Quick stats for this contact */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Contact Info</p>
              <div className="space-y-1 text-xs">
                <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{currentContact.email}</span></p>
                <p><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="text-[10px] ml-1">{currentContact.status}</Badge></p>
                {currentContact.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-muted-foreground">Tags:</span>
                    {currentContact.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <div className="p-4 border-t border-border/80 bg-muted/20 space-y-2">
            <Button
              onClick={handleSaveAndNext}
              disabled={isSaving || isCallLive}
              className="w-full gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FastForward className="size-4" />
              )}
              Save Disposition & Next Lead
            </Button>
            {isCallLive && (
              <p className="text-center text-[11px] text-muted-foreground">Hang up the call first to log & advance</p>
            )}
          </div>
        </Card>
      </div>

      {/* Campaign Summary Cards */}
      <div>
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="size-4" /> All Campaigns
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {campaigns.map((c) => {
            const progress = c.callsCompleted / c.contactCount
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCampaignId(c.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  c.id === selectedCampaignId
                    ? 'border-brand-primary/40 bg-brand-primary/5 ring-1 ring-brand-primary/20'
                    : 'border-border/80 bg-card/60 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ml-2 ${
                      c.status === 'active'
                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-amber-600 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    {c.status}
                  </Badge>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-brand-primary"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{c.callsCompleted}/{c.contactCount} calls</span>
                  <span>{c.conversionRate}% CVR</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
