'use client'

import * as React from 'react'
import {
  Hash,
  Plus,
  Search,
  Phone,
  PhoneForwarded,
  Globe,
  Check,
  Shield,
  SlidersHorizontal,
  MoreVertical,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { phoneNumbers as initialNumbers, searchableNumbers } from '@/lib/mock-data'
import type { PhoneNumber } from '@/lib/types'

export default function VirtualNumbersPage() {
  const [numbers, setNumbers] = React.useState<PhoneNumber[]>(initialNumbers)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false)
  const [selectedCountry, setSelectedCountry] = React.useState('US')
  const [selectedType, setSelectedType] = React.useState('all')
  const [provisioningId, setProvisioningId] = React.useState<string | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  // Filter existing numbers
  const filteredNumbers = numbers.filter(
    (n) =>
      n.formatted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter available numbers in modal
  const availableToBuy = searchableNumbers.filter((n) => {
    if (selectedCountry !== 'all' && n.countryCode !== selectedCountry) return false
    if (selectedType !== 'all' && n.type !== selectedType) return false
    return true
  })

  const handlePurchase = (item: PhoneNumber) => {
    setProvisioningId(item.id)
    setTimeout(() => {
      const newlyAdded: PhoneNumber = {
        ...item,
        status: 'active',
        assignedTo: 'Sales Team',
      }
      setNumbers((prev) => [newlyAdded, ...prev])
      setProvisioningId(null)
      setIsSearchModalOpen(false)
      setSuccessToast(`Successfully provisioned ${item.formatted}!`)
      setTimeout(() => setSuccessToast(null), 4000)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Virtual Phone Numbers"
        subheading="Provision and route clean, high-reputation business numbers worldwide"
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

      {/* Success Banner */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 border-border/80 bg-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Numbers</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <Hash className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold">{numbers.length}</p>
          <span className="text-[11px] text-muted-foreground">Across 3 geographic regions</span>
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
          <span className="text-[11px] text-muted-foreground">Flat per-number fee</span>
        </Card>

        <Card className="p-5 border-border/80 bg-card/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Reputation Score</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            99.2%
          </p>
          <span className="text-[11px] text-muted-foreground">Zero spam flag reports</span>
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
          <span className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{filteredNumbers.length}</strong> numbers
          </span>
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
                <th className="py-3.5 px-4">Price</th>
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
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-brand-primary">
                      Route
                    </Button>
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
              Search clean inventory across local and toll-free pools with instant activation
            </DialogDescription>
          </DialogHeader>

          {/* Search Filters */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="US">United States (+1)</option>
                <option value="GB">United Kingdom (+44)</option>
                <option value="all">All Countries</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="all">All Types</option>
                <option value="local">Local</option>
                <option value="toll-free">Toll-Free</option>
              </select>
            </div>
          </div>

          {/* Results List */}
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {availableToBuy.map((item) => (
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
                    {provisioningId === item.id ? 'Provisioning...' : 'Get Number'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
