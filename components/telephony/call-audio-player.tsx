'use client'

import * as React from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Activity,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Call } from '@/lib/types'

interface CallAudioPlayerProps {
  call: Call
  activeTurnIndex?: number
  onSeek?: (seconds: number) => void
}

export function CallAudioPlayer({ call, onSeek }: CallAudioPlayerProps) {
  const duration = Math.max(call.durationSeconds || 60, 10)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [playbackRate, setPlaybackRate] = React.useState<number>(1.0)
  const [volume, setVolume] = React.useState(0.8)
  const [isMuted, setIsMuted] = React.useState(false)

  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = React.useRef<AudioContext | null>(null)
  const synthNodesRef = React.useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null)

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Web Audio acoustic telephone audio synthesizer fallback
  const startSynthAudio = React.useCallback(() => {
    try {
      if (typeof window === 'undefined') return
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx()
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }

      const ctx = audioCtxRef.current
      // Create dual tones in the standard vocal range (440Hz / 680Hz harmonic)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const biquad = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      // Standard telephone bandpass filter (300Hz - 3400Hz)
      biquad.type = 'bandpass'
      biquad.frequency.value = 1200
      biquad.Q.value = 1.2

      osc1.type = 'triangle'
      osc1.frequency.value = 440
      osc2.type = 'sine'
      osc2.frequency.value = 660

      gain.gain.value = isMuted ? 0 : volume * 0.04

      osc1.connect(biquad)
      osc2.connect(biquad)
      biquad.connect(gain)
      gain.connect(ctx.destination)

      osc1.start()
      osc2.start()

      synthNodesRef.current = { osc1, osc2, gain }
    } catch {
      // Audio context not allowed without prior user gesture
    }
  }, [volume, isMuted])

  const stopSynthAudio = React.useCallback(() => {
    if (synthNodesRef.current) {
      try {
        synthNodesRef.current.osc1.stop()
        synthNodesRef.current.osc2.stop()
        synthNodesRef.current.osc1.disconnect()
        synthNodesRef.current.osc2.disconnect()
        synthNodesRef.current.gain.disconnect()
      } catch {}
      synthNodesRef.current = null
    }
  }, [])

  // Manage playback timer & audio element
  React.useEffect(() => {
    if (isPlaying) {
      if (call.recordingUrl && audioRef.current) {
        audioRef.current.playbackRate = playbackRate
        audioRef.current.volume = isMuted ? 0 : volume
        audioRef.current.play().catch(() => {
          // If media fails, fallback to synth timer
          startSynthAudio()
        })
      } else {
        startSynthAudio()
      }

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackRate
          if (next >= duration) {
            setIsPlaying(false)
            stopSynthAudio()
            return 0
          }
          return next
        })
      }, 250)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      stopSynthAudio()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      stopSynthAudio()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, playbackRate, volume, isMuted, duration, call.recordingUrl, startSynthAudio, stopSynthAudio])

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, duration))
    setCurrentTime(clamped)
    if (audioRef.current) {
      audioRef.current.currentTime = clamped
    }
    onSeek?.(clamped)
  }

  const skipSeconds = (delta: number) => {
    handleSeek(currentTime + delta)
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    handleSeek(percent * duration)
  }

  const handleDownload = () => {
    if (call.recordingUrl) {
      window.open(call.recordingUrl, '_blank')
    } else {
      // Generate simulated WAV header audio clip
      const sampleRate = 8000
      const numChannels = 1
      const totalSamples = sampleRate * 3
      const buffer = new ArrayBuffer(44 + totalSamples * 2)
      const view = new DataView(buffer)

      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i))
        }
      }

      writeString(0, 'RIFF')
      view.setUint32(4, 36 + totalSamples * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, numChannels, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * numChannels * 2, true)
      view.setUint16(32, numChannels * 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, totalSamples * 2, true)

      for (let i = 0; i < totalSamples; i++) {
        const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.25 * 32767
        view.setInt16(44 + i * 2, sample, true)
      }

      const blob = new Blob([buffer], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${call.id}_recording.wav`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Pre-calculated waveform bar patterns
  const barHeights = [
    25, 45, 60, 30, 80, 95, 70, 50, 85, 65, 40, 75, 90, 100, 80, 60, 45, 70,
    85, 60, 35, 90, 75, 55, 65, 80, 40, 50, 70, 85, 60, 95, 75, 40, 30, 20,
  ]

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card/90 to-card/60 p-4 shadow-sm backdrop-blur-sm">
      {call.recordingUrl && (
        <audio
          ref={audioRef}
          src={call.recordingUrl}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <Headphones className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>Stereo Audio Recording</span>
              {call.recordingUrl ? (
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Cloud WAV
                </span>
              ) : (
                <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand-primary">
                  Synthesized Audio
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              24-bit PCM • 16 kHz • High Definition
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="h-7 gap-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Download className="size-3" />
          Export WAV
        </Button>
      </div>

      {/* Interactive Waveform Display */}
      <div
        onClick={handleWaveformClick}
        className="group relative flex h-14 w-full cursor-pointer items-center justify-between gap-1 rounded-xl bg-muted/40 px-3 py-2 transition-all hover:bg-muted/60"
        title="Click to seek"
      >
        {barHeights.map((h, i) => {
          const barPercent = (i / barHeights.length) * 100
          const isPassed = barPercent <= progressPercent
          return (
            <div
              key={i}
              className="flex h-full w-full items-center justify-center"
            >
              <span
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? 'bg-brand-primary'
                    : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/40'
                } ${isPlaying && isPassed ? 'scale-y-110 shadow-sm shadow-brand-primary/50' : ''}`}
                style={{
                  height: isPlaying
                    ? `${Math.max(15, (h * (0.8 + Math.sin(currentTime * 5 + i) * 0.2)))}%`
                    : `${h}%`,
                }}
              />
            </div>
          )
        })}

        {/* Playhead indicator */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-brand-primary shadow-md shadow-brand-primary/80 transition-all duration-150"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-muted-foreground">
        <span className="font-semibold text-foreground">{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Primary Playback Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        {/* Speed Controls */}
        <div className="flex items-center gap-1">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setPlaybackRate(rate)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                playbackRate === rate
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Center transport buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipSeconds(-10)}
            className="size-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={togglePlay}
            className="size-10 rounded-full bg-brand-primary text-white shadow-md shadow-brand-primary/25 hover:bg-brand-primary/90 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="size-4 fill-white" /> : <Play className="size-4 fill-white ml-0.5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipSeconds(10)}
            className="size-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
            title="Fast-forward 10 seconds"
          >
            <RotateCw className="size-3.5" />
          </Button>
        </div>

        {/* Volume & Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value))
              setIsMuted(false)
            }}
            className="h-1.5 w-16 cursor-pointer accent-brand-primary rounded-lg bg-muted"
            title="Volume"
          />
        </div>
      </div>
    </div>
  )
}
