'use client'

import * as React from 'react'
import {
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Pause,
  Play,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FastForward,
  User,
  Building,
  Mail,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ListOrdered,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { campaigns as initialCampaigns, dialerContacts as initialQueue } from '@/lib/mock-data'

export default function PowerDialerPage() {
  const [campaigns, setCampaigns] = React.useState(initialCampaigns)
  const [selectedCampaignId, setSelectedCampaignId] = React.useState(initialCampaigns[0].id)
  const [queue, setQueue] = React.useState(initialQueue)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [callState, setCallState] = React.useState<'idle' | 'calling' | 'connected' | 'ended'>('connected')
  const [seconds, setSeconds] = React.useState(142)
  const [isMuted, setIsMuted] = React.useState(false)
  const [isOnHold, setIsOnHold] = React.useState(false)
  const [disposition, setDisposition] = React.useState('interested')
  const [callNotes, setCallNotes] = React.useState('Customer requested custom enterprise quote with 25 seats.')
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0]
  const currentContact = queue[currentIndex] || queue[0]

  // Timer simulation
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (callState === 'connected' && !isOnHold) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callState, isOnHold])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setCallState('ended')
  }

  const handleSaveAndNext = () => {
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      const nextIdx = (currentIndex + 1) % queue.length
      setCurrentIndex(nextIdx)
      setCallState('connected')
      setSeconds(0)
      setCallNotes('')
      setDisposition('interested')
    }, 800)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Power Dialer Workbench"
        subheading="High-velocity outbound calling engine with integrated CRM logging and local presence"
        badge="Progressive Engine"
      >
        <div className="flex items-center gap-3">
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
        </div>
      </PageHeader>

      {/* Campaign Progress Ribbon */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-border/80 bg-card/60 p-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">Calls Finished</span>
          <p className="font-display text-xl font-bold">{activeCampaign.callsCompleted} / {activeCampaign.contactCount}</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">Connected</span>
          <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeCampaign.connected}</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">Conversion Rate</span>
          <p className="font-display text-xl font-bold text-brand-primary">{activeCampaign.conversionRate}%</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">Caller ID</span>
          <p className="font-mono text-sm font-semibold">{activeCampaign.callerId}</p>
        </div>
      </div>

      {/* 3-Column Dialer Workbench */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Column 1: Queue (3 cols) */}
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
                    setCurrentIndex(idx)
                    setCallState('connected')
                    setSeconds(0)
                  }}
                  className={`w-full text-left rounded-xl p-3 text-xs transition-colors flex items-center justify-between ${
                    isCurrent
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{contact.name}</p>
                    <p className={`text-[11px] truncate ${isCurrent ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {contact.company}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="size-2 rounded-full bg-white animate-ping shrink-0" />
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Column 2: Live Call Stage (5 cols) */}
        <Card className="lg:col-span-5 border-border/80 bg-gradient-to-b from-card to-card/70 flex flex-col justify-between overflow-hidden">
          <div className="p-6 text-center space-y-4">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{callState === 'connected' ? (isOnHold ? 'CALL ON HOLD' : 'CONNECTED IN AUDIO') : 'CALL ENDED'}</span>
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

            {/* Live Audio Visualizer Animation */}
            <div className="flex h-12 items-center justify-center gap-1.5 py-2">
              {[24, 38, 56, 32, 48, 64, 42, 28, 50, 68, 35, 20].map((h, i) => (
                <span
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    callState === 'connected' && !isOnHold
                      ? 'bg-brand-primary animate-pulse'
                      : 'bg-muted h-2'
                  }`}
                  style={{
                    height: callState === 'connected' && !isOnHold ? `${h}%` : '6px',
                    animationDelay: `${i * 75}ms`,
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
              {formatTimer(seconds)}
            </div>
          </div>

          {/* Call Stage Controls */}
          <div className="border-t border-border/80 bg-muted/20 p-5">
            <div className="flex items-center justify-center gap-4">
              {/* Mute Button */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`flex size-12 items-center justify-center rounded-2xl border transition-colors ${
                  isMuted
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                    : 'border-border/80 bg-card text-muted-foreground hover:text-foreground'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>

              {/* Hold Button */}
              <button
                type="button"
                onClick={() => setIsOnHold(!isOnHold)}
                className={`flex size-12 items-center justify-center rounded-2xl border transition-colors ${
                  isOnHold
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                    : 'border-border/80 bg-card text-muted-foreground hover:text-foreground'
                }`}
                title={isOnHold ? 'Resume' : 'Hold'}
              >
                <Pause className="size-5" />
              </button>

              {/* Hangup Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="flex size-14 items-center justify-center rounded-3xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition-transform active:scale-95"
                title="Hang up call"
              >
                <PhoneOff className="size-6" />
              </button>
            </div>
          </div>
        </Card>

        {/* Column 3: Disposition & CRM Notes (4 cols) */}
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
                {[
                  { id: 'interested', label: 'Demo Booked' },
                  { id: 'callback', label: 'Call Back' },
                  { id: 'voicemail', label: 'Left Voicemail' },
                  { id: 'not-interested', label: 'Not Interested' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDisposition(d.id)}
                    className={`rounded-xl border p-2 text-xs font-semibold transition-colors ${
                      disposition === d.id
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20'
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
                placeholder="Log discussion takeaways, next steps, or specific objections..."
                className="mt-1.5 rounded-xl text-xs bg-muted/40"
              />
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Logged to CRM! Loading next contact...</span>
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t border-border/80 bg-muted/20">
            <Button
              onClick={handleSaveAndNext}
              className="w-full gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20"
            >
              <FastForward className="size-4" />
              Save Disposition & Next Lead
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
