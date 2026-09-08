/**
 * In-browser Web Audio API tone generator for WebRTC calling.
 * Generates realistic ringing, DTMF keypad tones, and call-termination cues without external mp3s.
 */

// DTMF standard frequency table
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
}

class TelephonyAudioFeedback {
  private ctx: AudioContext | null = null
  private ringbackInterval: NodeJS.Timeout | null = null
  private isRinging = false

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Plays standard DTMF dual-tone when user taps a keypad digit.
   */
  playDTMF(key: string, durationMs = 160): void {
    const ctx = this.getContext()
    if (!ctx) return

    const freqs = DTMF_FREQUENCIES[key]
    if (!freqs) return

    try {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.frequency.value = freqs[0]
      osc2.frequency.value = freqs[1]

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start()
      osc2.start()

      setTimeout(() => {
        try {
          osc1.stop()
          osc2.stop()
          osc1.disconnect()
          osc2.disconnect()
        } catch {}
      }, durationMs)
    } catch {}
  }

  /**
   * Starts a realistic ringback tone cycle (2s ring, 4s silence).
   */
  startRingback(): void {
    if (this.isRinging) return
    this.isRinging = true

    const playRingBurst = () => {
      if (!this.isRinging) return
      const ctx = this.getContext()
      if (!ctx) return

      try {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()

        osc1.frequency.value = 440 // A4
        osc2.frequency.value = 480 // B4-ish

        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.setValueAtTime(0.08, ctx.currentTime + 1.8)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0)

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)

        osc1.start()
        osc2.start()

        setTimeout(() => {
          try {
            osc1.stop()
            osc2.stop()
            osc1.disconnect()
            osc2.disconnect()
          } catch {}
        }, 2000)
      } catch {}
    }

    playRingBurst()
    this.ringbackInterval = setInterval(playRingBurst, 4000)
  }

  /**
   * Stops the ringback tone.
   */
  stopRingback(): void {
    this.isRinging = false
    if (this.ringbackInterval) {
      clearInterval(this.ringbackInterval)
      this.ringbackInterval = null
    }
  }

  /**
   * Plays a quick dual-frequency call end/hangup beep.
   */
  playCallEnd(): void {
    this.stopRingback()
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.setValueAtTime(480, ctx.currentTime)
      osc.frequency.setValueAtTime(320, ctx.currentTime + 0.15)

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch {}
  }
}

export const telephonyAudio = new TelephonyAudioFeedback()
