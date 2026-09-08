'use client'

import * as React from 'react'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Grid,
  Volume2,
  AlertCircle,
  X,
} from 'lucide-react'
import { useTelephony } from './telephony-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

export function CallOverlay() {
  const {
    callState,
    isCallActive,
    formattedDuration,
    isMuted,
    isOnHold,
    remoteNumber,
    contactName,
    provider,
    error,
    endCall,
    toggleMute,
    toggleHold,
    sendDTMF,
  } = useTelephony()

  const [showKeypad, setShowKeypad] = React.useState(false)

  if (callState === 'idle') return null

  const getStatusBadge = () => {
    switch (callState) {
      case 'connecting':
        return <Badge variant="neutral" className="animate-pulse">Connecting...</Badge>
      case 'ringing':
        return <Badge variant="info" className="animate-pulse">Ringing...</Badge>
      case 'connected':
        return isOnHold ? (
          <Badge variant="amber">On Hold</Badge>
        ) : (
          <Badge variant="success" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live {formattedDuration}
          </Badge>
        )
      case 'disconnected':
        return <Badge variant="destructive">Call Ended</Badge>
      case 'failed':
        return <Badge variant="destructive">Call Failed</Badge>
      default:
        return <Badge variant="neutral">{callState}</Badge>
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* DTMF Keypad Drawer */}
      {showKeypad && callState === 'connected' && (
        <div className="mb-2 w-72 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keypad (DTMF)</span>
            <button
              onClick={() => setShowKeypad(false)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {KEYPAD_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => sendDTMF(k)}
                className="flex h-12 items-center justify-center rounded-xl border border-border/50 bg-secondary/40 text-lg font-bold text-foreground transition-all active:scale-95 active:bg-primary/20 hover:border-primary/40 hover:bg-secondary"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Call Bar Card */}
      <div className="relative flex w-80 flex-col overflow-hidden rounded-2xl border border-border/90 bg-card/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        {/* Glow accent */}
        <div className={`absolute -top-12 -right-12 size-32 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
          callState === 'connected' ? 'bg-emerald-500/15' : 'bg-primary/15'
        }`} />

        {/* Top bar: Contact info & status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-bold text-foreground">{contactName}</h4>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                {provider}
              </span>
            </div>
            <p className="truncate text-xs font-mono text-muted-foreground mt-0.5">{remoteNumber}</p>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Visual Audio Waveform Animation when connected */}
        {callState === 'connected' && !isOnHold && (
          <div className="my-3 flex items-center justify-center gap-1 h-5">
            {[40, 75, 100, 60, 85, 30, 90, 50, 70, 45].map((height, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full bg-emerald-500/80 transition-all duration-300"
                style={{
                  height: `${isMuted ? 4 : Math.max(4, (height * (idx % 2 === 0 ? 0.9 : 0.6)))}%`,
                  animation: !isMuted ? `pulse 1.2s ease-in-out infinite alternate ${idx * 0.1}s` : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Error notice if present */}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Controls Action Row */}
        {isCallActive && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-1">
              {/* Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                disabled={callState !== 'connected'}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`flex size-9 items-center justify-center rounded-xl border transition-all ${
                  isMuted
                    ? 'border-destructive/50 bg-destructive/15 text-destructive hover:bg-destructive/25'
                    : 'border-border/80 bg-secondary/50 text-foreground hover:bg-secondary hover:text-foreground'
                } disabled:opacity-40`}
              >
                {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              {/* Hold Button */}
              <button
                type="button"
                onClick={toggleHold}
                disabled={callState !== 'connected'}
                title={isOnHold ? 'Resume call' : 'Hold call'}
                className={`flex size-9 items-center justify-center rounded-xl border transition-all ${
                  isOnHold
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-500 hover:bg-amber-500/25'
                    : 'border-border/80 bg-secondary/50 text-foreground hover:bg-secondary hover:text-foreground'
                } disabled:opacity-40`}
              >
                {isOnHold ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>

              {/* Keypad Button */}
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                disabled={callState !== 'connected'}
                title="Dial keypad"
                className={`flex size-9 items-center justify-center rounded-xl border transition-all ${
                  showKeypad
                    ? 'border-primary/50 bg-primary/15 text-primary hover:bg-primary/25'
                    : 'border-border/80 bg-secondary/50 text-foreground hover:bg-secondary hover:text-foreground'
                } disabled:opacity-40`}
              >
                <Grid className="size-4" />
              </button>
            </div>

            {/* Hangup Button */}
            <button
              type="button"
              onClick={endCall}
              title="Hang up call"
              className="flex h-9 items-center gap-1.5 rounded-xl bg-destructive px-3.5 text-xs font-semibold text-destructive-foreground shadow-lg shadow-destructive/25 transition-all hover:bg-destructive/90 active:scale-95"
            >
              <PhoneOff className="size-4" />
              <span>End</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
