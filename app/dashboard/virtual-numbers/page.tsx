'use client'

import * as React from 'react'
import {
  Hash,
  Plus,
  Search,
  Phone,
  Shield,
  Sparkles,
  CheckCircle2,
  Trash2,
  UserCheck,
  PhoneCall,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { phoneNumbers as initialNumbers } from '@/lib/mock-data'
import {
  searchNumbersAction,
  purchaseNumberAction,
  releaseNumberAction,
  assignNumberAction,
} from '@/app/actions/numbers'
import { useTelephony } from '@/hooks/use-webrtc-call'
import type { PhoneNumber } from '@/lib/types'

export default function VirtualNumbersPage() {
  const [numbers, setNumbers] = React.useState<PhoneNumber[]>(initialNumbers)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false)
  const [selectedCountry, setSelectedCountry] = React.useState('US')
  const [selectedType, setSelectedType] = React.useState('local')
  const [availableNumbers, setAvailableNumbers] = React.useState<PhoneNumber[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [provisioningId, setProvisioningId] = React.useState<string | null>(null)
  const [releasingId, setReleasingId] = React.useState<string | null>(null)
  const [toastMessage, setToastMessage] = React.useState<{ text: string; isError?: boolean } | null>(null)
  const [assigningNumber, setAssigningNumber] = React.useState<PhoneNumber | null>(null)
  const [targetAssignment, setTargetAssignment] = React.useState('')

  const telephony = useTelephony()

  // Load numbers on mount
  const loadNumbers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/numbers')
      if (res.ok) {
        const data = await res.json()
        if (data.numbers && data.numbers.length > 0) {
          setNumbers(data.numbers)
        }
      }
    } catch {
      // fallback to initial
    }
  }, [])

  React.useEffect(() => {
    loadNumbers()
  }, [loadNumbers])

  // Search available inventory when modal opens or filter changes
  const handleInventorySearch = React.useCallback(async () => {
    setIsSearching(true)
    try {
      const res = await searchNumbersAction({
        countryCode: selectedCountry,
        type: selectedType === 'all' ? undefined : (selectedType as 'local' | 'toll-free'),
      })
      if (res && 'numbers' in res && res.numbers) {
        setAvailableNumbers(res.numbers)
      }
    } catch (err) {
      console.warn('Inventory search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }, [selectedCountry, selectedType])

  React.useEffect(() => {
    if (isSearchModalOpen) {
      handleInventorySearch()
    }
  }, [isSearchModalOpen, handleInventorySearch])

  // Filter local state by query
  const filteredNumbers = numbers.filter(
    (n) =>
      n.formatted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Provision number handler
  const handlePurchase = async (item: PhoneNumber) => {
    setProvisioningId(item.id)
    try {
      const res = await purchaseNumberAction({
        numberId: item.id,
        phoneNumber: item.e164,
        friendlyName: item.formatted,
      })
      if (res && 'number' in res && res.number) {
        setNumbers((prev) => [res.number as PhoneNumber, ...prev])
        setIsSearchModalOpen(false)
        showToast(`Successfully provisioned ${item.formatted}!`)
      } else {
        showToast((res as { error?: string })?.error || 'Provisioning failed', true)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Provisioning failed', true)
    } finally {
      setProvisioningId(null)
    }
  }

  // Release number handler
  const handleRelease = async (id: string, formatted: string) => {
    if (!confirm(`Are you sure you want to release ${formatted}? This cannot be undone.`)) return
    setReleasingId(id)
    try {
      const res = await releaseNumberAction(id)
      if (res && 'success' in res) {
        setNumbers((prev) => prev.filter((n) => n.id !== id))
        showToast(`Released number ${formatted}`)
      } else {
        showToast((res as { error?: string })?.error || 'Release failed', true)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Release failed', true)
    } finally {
      setReleasingId(null)
    }
  }

  // Assign number handler
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningNumber || !targetAssignment) return
    try {
      const res = await assignNumberAction({
        numberId: assigningNumber.id,
        assignedTo: targetAssignment,
      })
      if (res && 'success' in res) {
        setNumbers((prev) =>
          prev.map((n) => (n.id === assigningNumber.id ? { ...n, assignedTo: targetAssignment } : n))
        )
        showToast(`Assigned ${assigningNumber.formatted} to ${targetAssignment}`)
        setAssigningNumber(null)
        setTargetAssignment('')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Assignment failed', true)
    }
  }

  // In-browser WebRTC Test Call
  const handleTestCall = (num: PhoneNumber) => {
    telephony.startCall(num.formatted, `Test Call (${num.assignedTo || 'Unassigned'})`)
    showToast(`Initiating in-browser call to ${num.formatted}...`)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Virtual Phone Numbers"
        subheading="Provision, route, and test clean business numbers worldwide"
        badge="Global Telephony"
      >
        <Button
          onClick={() => setIsSearchModalOpen(true)}
          className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20"
        >
          <Plus className="size-4" />
          Get New Number
        </Button>
      </PageHeader>

      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold animate-in fade-in duration-200 ${
            toastMessage.isError
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 border-border/80 bg-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Numbers</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Hash className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{numbers.length}</p>
          <span className="text-[11px] text-muted-foreground">Provisioned in organization</span>
        </Card>

        <Card className="p-5 border-border/80 bg-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Cost</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Shield className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">
            ${numbers.reduce((acc, curr) => acc + curr.monthlyPrice, 0)}/mo
          </p>
          <span className="text-[11px] text-muted-foreground">Flat subscription rate</span>
        </Card>

        <Card className="p-5 border-border/80 bg-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Reputation Score</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            99.4%
          </p>
          <span className="text-[11px] text-muted-foreground">Clean spam reputation index</span>
        </Card>
      </div>

      {/* Numbers Table Card */}
      <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by number, region or team..."
              className="h-9 pl-9 text-xs rounded-xl bg-muted/40"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadNumbers}
              className="h-8 text-xs gap-1.5 rounded-lg"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{filteredNumbers.length}</strong> numbers
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 px-5">Phone Number</th>
                <th className="py-3.5 px-4">Region / Country</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Assigned Target</th>
                <th className="py-3.5 px-4">Capabilities</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Rate</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredNumbers.map((num) => (
                <tr key={num.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-foreground font-mono">{num.formatted}</div>
                    <span className="text-[10px] text-muted-foreground">{num.e164}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-foreground">{num.region}</div>
                    <span className="text-[10px] text-muted-foreground">{num.country}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="text-[10px] font-semibold capitalize">
                      {num.type}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-foreground">
                      {num.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {num.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase font-bold text-muted-foreground"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        num.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {num.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-foreground">${num.monthlyPrice}/mo</td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* WebRTC In-Browser Test Call */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestCall(num)}
                        title="Start WebRTC call to this number"
                        className="h-8 gap-1.5 px-2.5 text-xs text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10"
                      >
                        <PhoneCall className="size-3.5 text-brand-primary" />
                        <span>Call</span>
                      </Button>

                      {/* Assign Target Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAssigningNumber(num)
                          setTargetAssignment(num.assignedTo || '')
                        }}
                        title="Assign to agent or team"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <UserCheck className="size-3.5" />
                      </Button>

                      {/* Release Number Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={releasingId === num.id}
                        onClick={() => handleRelease(num.id, num.formatted)}
                        title="Release this phone number"
                        className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        {releasingId === num.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Provision Number Dialog */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Acquire New Virtual Number</DialogTitle>
            <DialogDescription className="text-xs">
              Search available inventory across local and toll-free pools with instant activation
            </DialogDescription>
          </DialogHeader>

          {/* Search Filters */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand-primary"
              >
                <option value="US">United States (+1)</option>
                <option value="GB">United Kingdom (+44)</option>
                <option value="AU">Australia (+61)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand-primary"
              >
                <option value="local">Local</option>
                <option value="toll-free">Toll-Free</option>
                <option value="all">All Types</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-brand-primary" />
                <span>Searching telephony carrier inventory...</span>
              </div>
            ) : availableNumbers.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No phone numbers found matching your criteria. Try adjusting the filters.
              </div>
            ) : (
              availableNumbers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 hover:border-brand-primary/40 transition-colors"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">{item.formatted}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.region}, {item.country} •{' '}
                      <span className="capitalize">{item.type}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground">${item.monthlyPrice}/mo</span>
                    <Button
                      size="sm"
                      disabled={provisioningId === item.id}
                      onClick={() => handlePurchase(item)}
                      className="h-8 rounded-lg bg-brand-primary text-xs font-semibold text-white hover:bg-brand-primary/90"
                    >
                      {provisioningId === item.id ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          <span>Provisioning...</span>
                        </>
                      ) : (
                        'Get Number'
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Target Dialog */}
      <Dialog open={Boolean(assigningNumber)} onOpenChange={(open) => !open && setAssigningNumber(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Assign Phone Number</DialogTitle>
            <DialogDescription className="text-xs">
              Assign {assigningNumber?.formatted} to an agent, department, or AI concierge.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Target Name</label>
              <Input
                value={targetAssignment}
                onChange={(e) => setTargetAssignment(e.target.value)}
                placeholder="e.g. Sales Team, Aria (AI Concierge), Priya Nair"
                className="mt-1 text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssigningNumber(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-brand-primary text-white">
                Save Assignment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
