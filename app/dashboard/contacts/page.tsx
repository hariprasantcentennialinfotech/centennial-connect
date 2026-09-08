'use client'

import * as React from 'react'
import {
  Users,
  Search,
  Plus,
  Download,
  Phone,
  Mail,
  Building,
  MoreVertical,
  CheckCircle2,
  Tag,
  Filter,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { contacts as initialContacts } from '@/lib/mock-data'
import type { Contact, ContactStatus } from '@/lib/types'

export default function ContactsPage() {
  const [contactsList, setContactsList] = React.useState<Contact[]>(initialContacts)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [newContact, setNewContact] = React.useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    status: 'lead' as ContactStatus,
    tags: 'sales, outbound',
  })
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  const filtered = contactsList.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault()
    const item: Contact = {
      id: `c_${Date.now()}`,
      name: newContact.name,
      company: newContact.company,
      phone: newContact.phone,
      email: newContact.email,
      status: newContact.status,
      tags: newContact.tags.split(',').map((t) => t.trim()).filter(Boolean),
      lastContacted: 'Just now',
    }
    setContactsList([item, ...contactsList])
    setIsAddModalOpen(false)
    setToastMsg(`Added contact "${item.name}"!`)
    setTimeout(() => setToastMsg(null), 3500)
    setNewContact({
      name: '',
      company: '',
      phone: '',
      email: '',
      status: 'lead',
      tags: 'sales, outbound',
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Contacts & Leads"
        subheading="Central directory for outbound campaigns, customer intelligence, and conversation logs"
        badge="CRM Directory"
      >
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setToastMsg('Exporting contacts CSV...')
              setTimeout(() => setToastMsg(null), 2500)
            }}
            className="gap-1.5 rounded-xl border-border/80 text-xs"
          >
            <Download className="size-3.5" />
            Export
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20"
          >
            <Plus className="size-4" />
            Add Contact
          </Button>
        </div>
      </PageHeader>

      {/* Toast */}
      {toastMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/80 bg-card/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or phone..."
              className="h-9 pl-9 text-xs rounded-xl bg-muted/40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="customer">Customer</option>
              <option value="do-not-call">Do Not Call</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 px-5">Contact Name</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 font-bold text-brand-primary text-xs">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">{c.company}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-foreground">{c.phone}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{c.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        c.status === 'customer'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : c.status === 'lead'
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : c.status === 'do-not-call'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs text-brand-primary hover:bg-brand-primary/10"
                    >
                      <Phone className="size-3.5" />
                      Dial
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Contact Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add New Contact</DialogTitle>
            <DialogDescription className="text-xs">
              Save lead details directly into Centennial Connect directory and database
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input
                required
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="e.g. Elena Rostova"
                className="mt-1 h-9 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company</label>
                <Input
                  required
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  placeholder="e.g. Apex Global"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Status</label>
                <select
                  value={newContact.status}
                  onChange={(e) =>
                    setNewContact({ ...newContact, status: e.target.value as ContactStatus })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                <Input
                  required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+1 (555) 012-3456"
                  className="mt-1 h-9 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <Input
                  required
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="elena@apex.io"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tags (comma separated)</label>
              <Input
                value={newContact.tags}
                onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                placeholder="inbound, enterprise, priority"
                className="mt-1 h-9 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Create Contact Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
