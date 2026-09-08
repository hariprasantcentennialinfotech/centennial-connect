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
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { voiceAgents, sampleConversation } from '@/lib/mock-data'
import type { VoiceAgent } from '@/lib/types'

export default function VoiceAgentPage() {
  const [agent, setAgent] = React.useState<VoiceAgent>(voiceAgents[0])
  const [activeTab, setActiveTab] = React.useState<'config' | 'preview' | 'analytics'>('config')
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [simulating, setSimulating] = React.useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 800)
  }

  const toggleStatus = () => {
    setAgent((prev) => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active',
    }))
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

          <Button
            onClick={() => {
              setActiveTab('preview')
              setSimulating(true)
              setTimeout(() => setSimulating(false), 2000)
            }}
            className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20"
          >
            <Play className="size-4" />
            Test Conversation
          </Button>
        </div>
      </PageHeader>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>Agent configuration and instructions saved successfully to MongoDB!</span>
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
          Live Transcript & Simulation
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
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Assigned Number</label>
                    <Input
                      value={agent.phoneNumber}
                      onChange={(e) => setAgent({ ...agent, phoneNumber: e.target.value })}
                      className="mt-1.5 h-9 rounded-xl text-xs font-mono bg-muted/40"
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
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    <Save className="size-4" />
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
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Aria (Warm, Female)">Aria (Warm, Natural Female)</option>
                    <option value="Liam (Energetic, Male)">Liam (Energetic, Professional Male)</option>
                    <option value="Sophia (Calm, Executive)">Sophia (Calm, Executive Female)</option>
                    <option value="Marcus (Authoritative, Deep)">Marcus (Authoritative, Deep Male)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Language</label>
                  <select
                    value={agent.language}
                    onChange={(e) => setAgent({ ...agent, language: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="English (US)">English (United States)</option>
                    <option value="English (UK)">English (United Kingdom)</option>
                    <option value="Spanish (ES)">Spanish (Spain / LatAm)</option>
                    <option value="German (DE)">German (Germany)</option>
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
                Real-time speech-to-text dialogue stream with latency markers
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSimulating(true)
                setTimeout(() => setSimulating(false), 1500)
              }}
              className="gap-1.5 rounded-xl text-xs"
            >
              <RefreshCw className={`size-3.5 ${simulating ? 'animate-spin' : ''}`} />
              Replay Audio
            </Button>
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
                    className={`max-w-md rounded-2xl p-4 leading-relaxed ${
                      turn.speaker === 'agent'
                        ? 'bg-card border border-border/80 text-foreground shadow-sm'
                        : 'bg-brand-primary text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                      <span className="font-bold uppercase tracking-wider">
                        {turn.speaker === 'agent' ? 'Aria (AI)' : 'Prospect (Inbound)'}
                      </span>
                      <span>00:{10 * (i + 1)}</span>
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
    </div>
  )
}
