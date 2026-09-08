'use client'

import * as React from 'react'
import {
  Bot,
  Sparkles,
  Phone,
  Mic,
  Play,
  Save,
  CheckCircle2,
  TrendingUp,
  Clock,
  Settings,
  MessageSquare,
  Volume2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { voiceAgents, sampleConversation } from '@/lib/mock-data'
import { saveVoiceAgentAction, updateAgentStatusAction } from '@/app/actions/voice-agents'
import { useTelephony } from '@/hooks/use-webrtc-call'
import type { VoiceAgent } from '@/lib/types'

export default function VoiceAgentPage() {
  const [agent, setAgent] = React.useState<VoiceAgent>(voiceAgents[0])
  const [activeTab, setActiveTab] = React.useState<'config' | 'preview'>('config')
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveToast, setSaveToast] = React.useState<{ text: string; isError?: boolean } | null>(null)
  const [isTestCallOpen, setIsTestCallOpen] = React.useState(false)
  const [playingTurnIndex, setPlayingTurnIndex] = React.useState<number | null>(null)

  const telephony = useTelephony()

  // Load agent data from API on mount
  React.useEffect(() => {
    fetch('/api/voice-agent')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.agent) {
          setAgent(data.agent)
        }
      })
      .catch((err) => {
        console.warn('Fallback to initial agent:', err)
      })
  }, [])

  const showToast = (text: string, isError = false) => {
    setSaveToast({ text, isError })
    setTimeout(() => setSaveToast(null), 4000)
  }

  // Save Agent Configuration
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await saveVoiceAgentAction(agent)
      if (res && 'agent' in res && res.agent) {
        setAgent(res.agent as VoiceAgent)
        showToast('Agent persona and instructions saved successfully!')
      } else {
        showToast((res as { error?: string })?.error || 'Failed to save agent.', true)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error saving agent.', true)
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle Active/Paused Status
  const toggleStatus = async () => {
    const nextStatus = agent.status === 'active' ? 'paused' : 'active'
    try {
      setAgent((prev) => ({ ...prev, status: nextStatus }))
      await updateAgentStatusAction(agent.id, nextStatus)
      showToast(`Agent status updated to ${nextStatus}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Status update failed', true)
    }
  }

  // Start Live WebRTC In-Browser Test Call with the Agent
  const handleStartWebRTCCall = () => {
    setIsTestCallOpen(false)
    telephony.startCall(agent.phoneNumber, `${agent.name} (AI Concierge)`)
    showToast(`Connecting in-browser call to ${agent.name}...`)
  }

  // Play dialogue turn using browser speech synthesis
  const speakTurn = (text: string, index: number, isAgent: boolean) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = isAgent ? 1.15 : 0.95

    // Attempt to pick an appropriate English voice if available
    const voices = window.speechSynthesis.getVoices()
    if (isAgent) {
      const female = voices.find((v) => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha'))
      if (female) utterance.voice = female
    }

    setPlayingTurnIndex(index)
    utterance.onend = () => setPlayingTurnIndex(null)
    utterance.onerror = () => setPlayingTurnIndex(null)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="AI Voice Agent Studio"
        subheading="Configure autonomous conversational AI agents for inbound qualification and outbound follow-up"
        badge="Autonomous Voice AI"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={toggleStatus}
            className={`gap-2 rounded-xl border text-xs font-semibold ${
              agent.status === 'active'
                ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                : 'border-amber-500/30 text-amber-600 bg-amber-500/10'
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                agent.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {agent.status === 'active' ? 'Agent Active' : 'Agent Paused'}
          </Button>

          {/* Test Call Trigger */}
          <Button
            onClick={() => setIsTestCallOpen(true)}
            className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20"
          >
            <PhoneCall className="size-4" />
            Live WebRTC Call
          </Button>
        </div>
      </PageHeader>

      {/* Toast Notification */}
      {saveToast && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold animate-in fade-in duration-200 ${
            saveToast.isError
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {saveToast.isError ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" />
          )}
          <span>{saveToast.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Calls Handled"
          value={agent.callVolume}
          delta={18.4}
          icon={<Bot className="size-5" />}
          description="Inbound + Outbound"
        />
        <StatCard
          label="Resolution Rate"
          value={`${agent.successRate}%`}
          delta={5.2}
          icon={<CheckCircle2 className="size-5" />}
          sparklineData={[79, 81, 84, 83, 85, 87, 88]}
          sparklineColor="var(--chart-2)"
        />
        <StatCard
          label="Avg Call Duration"
          value={`${Math.floor(agent.avgDurationSeconds / 60)}m ${agent.avgDurationSeconds % 60}s`}
          icon={<Clock className="size-5" />}
          description="Autonomous dialogue"
        />
        <StatCard
          label="Response Latency"
          value="420ms"
          delta={-14}
          trend="down"
          icon={<Sparkles className="size-5" />}
          description="Ultra-low latency speech"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/70 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition-colors ${
            activeTab === 'config'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="size-4" />
          Agent Persona & Prompts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition-colors ${
            activeTab === 'preview'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="size-4" />
          Live Transcript & Speech Simulation
        </button>
      </div>

      {/* Tab 1: Configuration Form */}
      {activeTab === 'config' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Identity & Greeting */}
            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Identity & Welcome Script</CardTitle>
                <CardDescription className="text-xs">
                  Define the voice agent persona and opening hook
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Agent Name</label>
                    <Input
                      value={agent.name}
                      onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                      className="mt-1.5 h-9 rounded-xl text-xs bg-muted/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Assigned Number</label>
                    <Input
                      value={agent.phoneNumber}
                      onChange={(e) => setAgent({ ...agent, phoneNumber: e.target.value })}
                      className="mt-1.5 h-9 rounded-xl text-xs font-mono bg-muted/40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Initial Greeting</label>
                  <Textarea
                    rows={2}
                    value={agent.greeting}
                    onChange={(e) => setAgent({ ...agent, greeting: e.target.value })}
                    className="mt-1.5 rounded-xl text-xs bg-muted/40"
                    required
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Spoken immediately when a customer answers or connects.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Instructions */}
            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Prompt Instructions & Objective</CardTitle>
                <CardDescription className="text-xs">
                  Guide conversational boundaries and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Primary Objective</label>
                  <Input
                    value={agent.objective}
                    onChange={(e) => setAgent({ ...agent, objective: e.target.value })}
                    className="mt-1.5 h-9 rounded-xl text-xs bg-muted/40"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    System Instructions & Behavior
                  </label>
                  <Textarea
                    rows={4}
                    value={agent.instructions}
                    onChange={(e) => setAgent({ ...agent, instructions: e.target.value })}
                    className="mt-1.5 rounded-xl text-xs font-mono bg-muted/40"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Business Knowledge & Context
                  </label>
                  <Textarea
                    rows={3}
                    value={agent.businessContext}
                    onChange={(e) => setAgent({ ...agent, businessContext: e.target.value })}
                    className="mt-1.5 rounded-xl text-xs bg-muted/40"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {isSaving ? 'Saving Changes...' : 'Save Agent Persona'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Voice & Speech Engine Settings */}
          <div className="space-y-6">
            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Voice Model & Accent</CardTitle>
                <CardDescription className="text-xs">Ultra-realistic neural speech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Voice Model</label>
                  <select
                    value={agent.voice}
                    onChange={(e) => setAgent({ ...agent, voice: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="Aria (Warm, Female)">Aria (Warm, Natural Female)</option>
                    <option value="Nova (Neutral, Female)">Nova (Neutral, Conversational Female)</option>
                    <option value="Atlas (Deep, Male)">Atlas (Deep, Authoritative Male)</option>
                    <option value="Rowan (Calm, Male)">Rowan (Calm, Friendly Male)</option>
                    <option value="Sage (Bright, Neutral)">Sage (Bright, Dynamic Neutral)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Language</label>
                  <select
                    value={agent.language}
                    onChange={(e) => setAgent({ ...agent, language: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand-primary"
                  >
                    <option value="English (US)">English (United States)</option>
                    <option value="English (UK)">English (United Kingdom)</option>
                    <option value="Spanish (ES)">Spanish (Spain / LatAm)</option>
                    <option value="German (DE)">German (Germany)</option>
                    <option value="French (FR)">French (France)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Operating Hours</label>
                  <Input
                    value={agent.workingHours}
                    onChange={(e) => setAgent({ ...agent, workingHours: e.target.value })}
                    className="mt-1.5 h-9 rounded-xl text-xs bg-muted/40"
                  />
                </div>

                <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-brand-primary">
                    <ShieldCheck className="size-4" />
                    <span>Live Call Transfer Rule</span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
                    If caller requests human rep or mentions billing disputes, transfer immediately to Sales Queue (+1 415 555-0100).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      )}

      {/* Tab 2: Simulation & Transcript */}
      {activeTab === 'preview' && (
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/70">
            <div>
              <CardTitle className="text-base font-bold">Live Conversation Transcript</CardTitle>
              <CardDescription className="text-xs">
                Real-time dialogue stream with instant audio speech playback
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartWebRTCCall}
                className="gap-1.5 rounded-xl text-xs text-brand-primary border-brand-primary/30"
              >
                <PhoneCall className="size-3.5" />
                Live WebRTC Call
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-w-2xl mx-auto">
              {sampleConversation.map((turn, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs ${
                    turn.speaker === 'agent' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {turn.speaker === 'agent' && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-md rounded-2xl p-4 leading-relaxed relative group ${
                      turn.speaker === 'agent'
                        ? 'bg-card border border-border/80 text-foreground shadow-sm'
                        : 'bg-brand-primary text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                      <span className="font-bold uppercase tracking-wider">
                        {turn.speaker === 'agent' ? agent.name : 'Customer (Inbound)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>00:{10 * (i + 1)}</span>
                        {/* Audio Speak Button */}
                        <button
                          type="button"
                          onClick={() => speakTurn(turn.text, i, turn.speaker === 'agent')}
                          title="Listen to synthesized voice"
                          className="hover:text-primary transition-colors p-0.5 rounded"
                        >
                          <Volume2 className={`size-3.5 ${playingTurnIndex === i ? 'text-brand-primary animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <p>{turn.text}</p>
                  </div>

                  {turn.speaker === 'customer' && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground font-bold">
                      C
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Call Modal */}
      <Dialog open={isTestCallOpen} onOpenChange={setIsTestCallOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Test AI Agent Call</DialogTitle>
            <DialogDescription className="text-xs">
              Connect to {agent.name} directly via your browser microphone using in-browser WebRTC.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Bot className="size-4 text-brand-primary" />
                <span>{agent.name} • {agent.voice}</span>
              </div>
              <p className="mt-1 text-muted-foreground text-[11px]">
                Greeting: &quot;{agent.greeting}&quot;
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleStartWebRTCCall}
                className="w-full gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 h-11"
              >
                <PhoneCall className="size-4" />
                Start In-Browser WebRTC Call
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                No phone line needed. Uses your device microphone and browser audio.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
