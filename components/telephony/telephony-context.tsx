'use client'

import * as React from 'react'
import { telephonyAudio } from '@/lib/webrtc/audio'
import { logCallOutcomeAction } from '@/app/actions/dialer'
import type { WebRTCCallState, TelephonyProviderType } from '@/lib/types'

export interface TelephonyContextValue {
  callState: WebRTCCallState
  isCallActive: boolean
  callDuration: number
  formattedDuration: string
  isMuted: boolean
  isOnHold: boolean
  remoteNumber: string
  contactName: string
  callId: string | null
  provider: TelephonyProviderType
  error: string | null
  startCall: (number: string, contactName?: string) => Promise<void>
  endCall: () => void
  toggleMute: () => void
  toggleHold: () => void
  sendDTMF: (digit: string) => void
}

const TelephonyContext = React.createContext<TelephonyContextValue | null>(null)

export function TelephonyProvider({ children }: { children: React.ReactNode }) {
  const [callState, setCallState] = React.useState<WebRTCCallState>('idle')
  const [remoteNumber, setRemoteNumber] = React.useState('')
  const [contactName, setContactName] = React.useState('')
  const [callId, setCallId] = React.useState<string | null>(null)
  const [provider, setProvider] = React.useState<TelephonyProviderType>('mock')
  const [isMuted, setIsMuted] = React.useState(false)
  const [isOnHold, setIsOnHold] = React.useState(false)
  const [callDuration, setCallDuration] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  const mediaStreamRef = React.useRef<MediaStream | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const connectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Call duration timer
  React.useEffect(() => {
    if (callState === 'connected' && !isOnHold) {
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callState, isOnHold])

  const formatSeconds = (secs: number): string => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  const startCall = React.useCallback(async (number: string, name?: string) => {
    try {
      setError(null)
      setRemoteNumber(number)
      setContactName(name || 'Direct Dial')
      setCallState('connecting')
      setCallDuration(0)
      setIsMuted(false)
      setIsOnHold(false)

      const cid = `call_${Date.now()}`
      setCallId(cid)

      // 1. Acquire browser microphone
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaStreamRef.current = stream
        } catch {
          console.warn('Microphone permission not granted; running in simulated audio mode.')
        }
      }

      // 2. Fetch WebRTC token
      const res = await fetch('/api/telephony/token')
      if (res.ok) {
        const data = await res.json()
        if (data.provider) setProvider(data.provider)
      }

      // 3. Start Ringing state & audio
      setCallState('ringing')
      telephonyAudio.startRingback()

      // 4. Connect call (in mock/demo simulates remote party pickup in 2.2 seconds)
      connectTimeoutRef.current = setTimeout(() => {
        telephonyAudio.stopRingback()
        setCallState('connected')
      }, 2200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setCallState('failed')
      telephonyAudio.stopRingback()
    }
  }, [])

  const endCall = React.useCallback(() => {
    telephonyAudio.stopRingback()
    telephonyAudio.playCallEnd()

    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    if (callId) {
      logCallOutcomeAction({
        callId,
        status: callDuration > 0 ? 'completed' : 'no-answer',
        durationSeconds: callDuration,
        notes: 'Call ended via in-browser WebRTC softphone.',
      }).catch(() => {})
    }

    setCallState('disconnected')
    setTimeout(() => {
      setCallState('idle')
      setCallDuration(0)
      setRemoteNumber('')
      setContactName('')
      setCallId(null)
    }, 1500)
  }, [callId, callDuration])

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next
        })
      }
      return next
    })
  }, [])

  const toggleHold = React.useCallback(() => {
    setIsOnHold((prev) => {
      const next = !prev
      if (next) {
        telephonyAudio.playDTMF('5', 80)
      }
      return next
    })
  }, [])

  const sendDTMF = React.useCallback((digit: string) => {
    telephonyAudio.playDTMF(digit)
  }, [])

  const isCallActive = callState !== 'idle' && callState !== 'disconnected'

  const value: TelephonyContextValue = {
    callState,
    isCallActive,
    callDuration,
    formattedDuration: formatSeconds(callDuration),
    isMuted,
    isOnHold,
    remoteNumber,
    contactName,
    callId,
    provider,
    error,
    startCall,
    endCall,
    toggleMute,
    toggleHold,
    sendDTMF,
  }

  return <TelephonyContext.Provider value={value}>{children}</TelephonyContext.Provider>
}

export function useTelephony() {
  const context = React.useContext(TelephonyContext)
  if (!context) {
    throw new Error('useTelephony must be used within a TelephonyProvider')
  }
  return context
}
