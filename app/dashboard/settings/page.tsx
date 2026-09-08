'use client'

import * as React from 'react'
import {
  User,
  Building,
  Users,
  Shield,
  CreditCard,
  Phone,
  Database,
  Key,
  CheckCircle2,
  Save,
  Plus,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { teamMembers as initialTeam } from '@/lib/mock-data'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<
    'profile' | 'team' | 'database' | 'telephony' | 'billing'
  >('profile')

  const [profile, setProfile] = React.useState({
    name: 'Alex Morgan',
    email: 'alex@northwind.co',
    company: 'Northwind Sales Co.',
    timezone: 'America/Los_Angeles (PT)',
  })

  const [team, setTeam] = React.useState(initialTeam)
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState('agent')
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessToast('Account preferences saved successfully!')
    setTimeout(() => setSuccessToast(null), 3000)
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    const newMember = {
      id: `tm_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as any,
      status: 'invited' as const,
      lastActive: '—',
    }
    setTeam([...team, newMember])
    setInviteEmail('')
    setSuccessToast(`Invitation sent to ${inviteEmail}!`)
    setTimeout(() => setSuccessToast(null), 3500)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Platform Settings"
        subheading="Manage account preferences, team workspace, database connections, and telephony routing"
        badge="Enterprise Controls"
      />

      {/* Success Notification */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex flex-wrap border-b border-border/70 text-sm font-semibold gap-1">
        {[
          { id: 'profile', label: 'Organization & Profile', icon: User },
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'database', label: 'Database & Atlas', icon: Database },
          { id: 'telephony', label: 'Telephony & Rules', icon: Phone },
          { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
                isActive
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">Company Profile</CardTitle>
              <CardDescription className="text-xs">
                Visible to team members and in exported call reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Admin Name</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 h-9 rounded-xl text-xs bg-muted/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1 h-9 rounded-xl text-xs bg-muted/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                  <Input
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="mt-1 h-9 rounded-xl text-xs bg-muted/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
                  <Input
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="mt-1 h-9 rounded-xl text-xs bg-muted/40"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90"
                >
                  <Save className="size-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Tab: Team Members */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Invite Form */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">Invite Teammate</CardTitle>
              <CardDescription className="text-xs">
                Grant reps and supervisors access to your calling workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                <Input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="h-9 flex-1 rounded-xl text-xs bg-muted/40"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
                >
                  <option value="agent">Agent / Rep</option>
                  <option value="admin">Administrator</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button
                  type="submit"
                  className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90"
                >
                  <Plus className="size-4" />
                  Invite
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card className="overflow-hidden border-border/80 bg-card/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-5">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/40">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-foreground">{m.name}</div>
                      <span className="text-[11px] text-muted-foreground">{m.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold capitalize text-brand-primary">{m.role}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          m.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-muted-foreground">{m.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Tab: Database Connection */}
      {activeTab === 'database' && (
        <div className="max-w-3xl space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Database className="size-5 text-emerald-500" />
                    MongoDB Atlas Database Connection
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Database credentials and cloud persistence settings
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Atlas Configured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Database User
                  </span>
                  <span className="font-mono text-foreground font-semibold">
                    hariprasantcentennialinfotech_db_user
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Target Database
                  </span>
                  <span className="font-mono text-foreground font-semibold">centennial_connect</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Persistence Mode
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Active (MongoDB Collections + In-Memory Fallback)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Atlas Connection String (.env)
                </label>
                <Input
                  readOnly
                  value="mongodb+srv://hariprasantcentennialinfotech_db_user:••••••••••••@cluster0.mongodb.net/centennial_connect"
                  className="font-mono text-xs bg-muted/40 h-9 rounded-xl"
                />
                <p className="text-[11px] text-muted-foreground">
                  Credentials loaded securely from <code className="text-brand-primary">.env</code>.
                  Collections automatically seeded with contacts, call logs, virtual numbers, and AI agent prompts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Telephony & Rules */}
      {activeTab === 'telephony' && (
        <div className="max-w-2xl space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">Calling & Audio Rules</CardTitle>
              <CardDescription className="text-xs">
                Configure default caller IDs, call recording retention, and voicemail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Default Outbound Caller ID</label>
                <select className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs">
                  <option>+1 (415) 555-0100 (Sales Team - Local US)</option>
                  <option>+1 (800) 555-0111 (Support Line - Toll Free)</option>
                  <option>+44 20 7946 0000 (EMEA Team - London)</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/80 p-3 bg-muted/20">
                <div>
                  <p className="font-semibold text-foreground">Automatic Call Recording</p>
                  <p className="text-[11px] text-muted-foreground">Record all outbound dialer and inbound agent calls</p>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-brand-primary" />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/80 p-3 bg-muted/20">
                <div>
                  <p className="font-semibold text-foreground">AI Voice Transcription</p>
                  <p className="text-[11px] text-muted-foreground">Real-time STT indexing for searchable conversation logs</p>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-brand-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Billing */}
      {activeTab === 'billing' && (
        <div className="max-w-2xl space-y-6">
          <Card className="border-brand-primary/30 bg-gradient-to-b from-brand-primary/10 via-card to-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-brand-primary text-white">Growth Plan</Badge>
                <h3 className="mt-2 font-display text-2xl font-bold">$149 / month</h3>
                <p className="text-xs text-muted-foreground">Renews on Oct 8, 2026</p>
              </div>
              <Button variant="outline" className="rounded-xl border-border/80">
                Change Plan
              </Button>
            </div>

            <div className="mt-6 space-y-3 text-xs border-t border-border/60 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Virtual Numbers Active</span>
                <span className="font-semibold text-foreground">4 / 25 lines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Voice Agent Minutes</span>
                <span className="font-semibold text-foreground">3,600 / 10,000 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Power Dialer Minutes</span>
                <span className="font-semibold text-foreground">8,420 / 20,000 min</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
