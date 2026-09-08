'use client'

import * as React from 'react'
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  Phone,
  PhoneCall,
  PhoneOff,
  Mail,
  Building,
  CheckCircle2,
  Tag,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Clock,
  FileSpreadsheet,
  Check,
  UserCheck,
  AlertCircle,
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
import { Textarea } from '@/components/ui/textarea'
import { contacts as initialContacts } from '@/lib/mock-data'
import {
  getContactsAction,
  createContactAction,
  updateContactAction,
  deleteContactAction,
  importContactsAction,
} from '@/app/actions/contacts'
import { useTelephony } from '@/hooks/use-webrtc-call'
import type { Contact, ContactStatus } from '@/lib/types'

export default function ContactsPage() {
  const [contactsList, setContactsList] = React.useState<Contact[]>(initialContacts)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [isLoading, setIsLoading] = React.useState(false)
  const [lastSynced, setLastSynced] = React.useState('Just now')
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false)
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null)

  // Form states
  const [contactForm, setContactForm] = React.useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    status: 'lead' as ContactStatus,
    tags: 'sales, outbound',
    notes: '',
  })

  // Bulk import state
  const [importText, setImportText] = React.useState('')
  const [isImporting, setIsImporting] = React.useState(false)

  const telephony = useTelephony()

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Fetch contacts from Server Action
  const fetchContacts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getContactsAction()
      if (res.success && res.contacts && res.contacts.length > 0) {
        setContactsList(res.contacts)
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch {
      // Keep existing list on failure
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Filtered contacts
  const filtered = contactsList.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  // Create Contact Handler
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tagsArray = contactForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await createContactAction({
        name: contactForm.name,
        company: contactForm.company,
        phone: contactForm.phone,
        email: contactForm.email,
        status: contactForm.status,
        tags: tagsArray,
        notes: contactForm.notes,
      })

      if (res.success && res.contact) {
        setContactsList((prev) => [res.contact, ...prev])
        showToast(`Contact "${res.contact.name}" created successfully!`)
      } else {
        // Optimistic fallback
        const item: Contact = {
          id: `c_${Date.now()}`,
          name: contactForm.name,
          company: contactForm.company,
          phone: contactForm.phone,
          email: contactForm.email,
          status: contactForm.status,
          tags: tagsArray,
          notes: contactForm.notes,
          lastContacted: null,
        }
        setContactsList((prev) => [item, ...prev])
        showToast(`Contact "${item.name}" added!`)
      }

      setIsAddModalOpen(false)
      setContactForm({
        name: '',
        company: '',
        phone: '',
        email: '',
        status: 'lead',
        tags: 'sales, outbound',
        notes: '',
      })
    } catch (err) {
      showToast('Failed to create contact.')
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact)
    setContactForm({
      name: contact.name,
      company: contact.company || '',
      phone: contact.phone,
      email: contact.email || '',
      status: contact.status,
      tags: contact.tags.join(', '),
      notes: contact.notes || '',
    })
    setIsEditModalOpen(true)
  }

  // Update Contact Handler
  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContact) return

    try {
      const tagsArray = contactForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await updateContactAction({
        id: editingContact.id,
        name: contactForm.name,
        company: contactForm.company,
        phone: contactForm.phone,
        email: contactForm.email,
        status: contactForm.status,
        tags: tagsArray,
        notes: contactForm.notes,
      })

      if (res.success && res.contact) {
        setContactsList((prev) =>
          prev.map((c) => (c.id === editingContact.id ? res.contact : c))
        )
        showToast(`Updated "${res.contact.name}"`)
      } else {
        setContactsList((prev) =>
          prev.map((c) =>
            c.id === editingContact.id
              ? {
                  ...c,
                  name: contactForm.name,
                  company: contactForm.company,
                  phone: contactForm.phone,
                  email: contactForm.email,
                  status: contactForm.status,
                  tags: tagsArray,
                  notes: contactForm.notes,
                }
              : c
          )
        )
        showToast(`Updated "${contactForm.name}"`)
      }

      setIsEditModalOpen(false)
      setEditingContact(null)
    } catch {
      showToast('Failed to update contact.')
    }
  }

  // Delete Contact Handler
  const handleDeleteContact = async (contactId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete contact "${name}"?`)) return
    try {
      await deleteContactAction(contactId)
      setContactsList((prev) => prev.filter((c) => c.id !== contactId))
      showToast(`Deleted contact "${name}"`)
    } catch {
      showToast('Failed to delete contact.')
    }
  }

  // Bulk Import Handler
  const handleBulkImport = async () => {
    if (!importText.trim()) return
    setIsImporting(true)

    try {
      // Parse CSV or JSON lines
      const lines = importText.trim().split('\n')
      const parsedContacts: Array<{
        name: string
        phone: string
        email?: string
        company?: string
        status?: ContactStatus
        tags?: string[]
      }> = []

      // Check if header row exists
      const firstLine = lines[0].toLowerCase()
      const hasHeader = firstLine.includes('name') && firstLine.includes('phone')
      const dataLines = hasHeader ? lines.slice(1) : lines

      for (const line of dataLines) {
        const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''))
        if (parts.length >= 2) {
          const name = parts[0]
          const phone = parts[1]
          const email = parts[2] || ''
          const company = parts[3] || ''
          const status = (['lead', 'active', 'customer', 'do-not-call'].includes(parts[4])
            ? parts[4]
            : 'lead') as ContactStatus
          const tags = parts[5] ? parts[5].split(';').map((t) => t.trim()) : ['imported']

          if (name && phone) {
            parsedContacts.push({ name, phone, email, company, status, tags })
          }
        }
      }

      if (parsedContacts.length === 0) {
        showToast('No valid contact lines found. Format: Name, Phone, Email, Company, Status, Tags')
        setIsImporting(false)
        return
      }

      const res = await importContactsAction(parsedContacts)
      if (res.success) {
        showToast(`Successfully imported ${res.importedCount} contacts!`)
        fetchContacts()
        setIsImportModalOpen(false)
        setImportText('')
      } else {
        showToast('Bulk import encountered an error.')
      }
    } catch {
      showToast('Failed to parse and import contacts.')
    } finally {
      setIsImporting(false)
    }
  }

  // Load Demo CSV Data for testing
  const handleLoadDemoCsv = () => {
    setImportText(
      `Name, Phone, Email, Company, Status, Tags\n` +
      `Marcus Vance, +1 (415) 555-0199, marcus@vancecap.com, Vance Capital, lead, enterprise;fintech\n` +
      `Clara Moreau, +33 1 42 68 55 00, clara@lumiere.fr, Lumière Media, active, outbound;media\n` +
      `Kenji Sato, +81 3 5555 0142, kenji@neo-tokyo.jp, Neo Tokyo Labs, customer, ai;pilot\n` +
      `Sarah Jenkins, +1 (212) 555-0188, sjenkins@veritas.law, Veritas Legal, lead, legal;urgent`
    )
  }

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Contact ID', 'Name', 'Company', 'Phone', 'Email', 'Status', 'Tags', 'Last Contacted']
    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.company}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.status}"`,
      `"${c.tags.join('; ')}"`,
      `"${c.lastContacted || 'Never'}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `centennial-connect-contacts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${filtered.length} contacts to CSV.`)
  }

  // Metric counts
  const totalCount = contactsList.length
  const leadCount = contactsList.filter((c) => c.status === 'lead').length
  const customerCount = contactsList.filter((c) => c.status === 'customer' || c.status === 'active').length
  const dncCount = contactsList.filter((c) => c.status === 'do-not-call').length

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Contacts & Leads"
        subheading="Central directory for outbound campaigns, customer intelligence, and conversation logs"
        badge="CRM Directory"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={isLoading}
            className="gap-1.5 rounded-xl border-border/80 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 rounded-xl border-border/80 text-xs"
          >
            <Upload className="size-3.5" />
            Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 rounded-xl border-border/80 text-xs"
          >
            <Download className="size-3.5" />
            Export
          </Button>

          <Button
            onClick={() => {
              setContactForm({
                name: '',
                company: '',
                phone: '',
                email: '',
                status: 'lead',
                tags: 'sales, outbound',
                notes: '',
              })
              setIsAddModalOpen(true)
            }}
            className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20 text-xs"
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

      {/* Active Softphone Call Banner */}
      {telephony.isCallActive && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-primary/40 bg-gradient-to-r from-brand-primary/15 via-brand-primary/10 to-transparent p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/30">
                <PhoneCall className="size-5 animate-bounce" />
                <span className="absolute -top-1 -right-1 size-3 animate-ping rounded-full bg-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                    In-Browser Call Active
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] uppercase font-mono">
                    {telephony.callState}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{telephony.contactName || 'Connected Party'}</span>
                  <span className="font-mono text-xs text-muted-foreground">{telephony.remoteNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-xs font-bold text-foreground">
                <Clock className="size-3.5 text-brand-primary" />
                {telephony.formattedDuration}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={telephony.endCall}
                className="gap-1.5 rounded-xl text-xs"
              >
                <PhoneOff className="size-3.5" />
                End Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Directory</span>
            <Users className="size-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{totalCount}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Synchronized with MongoDB</div>
        </Card>

        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Qualified Leads</span>
            <UserCheck className="size-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{leadCount}</div>
          <div className="mt-1 text-[11px] text-brand-primary font-medium">Ready for power dialer</div>
        </Card>

        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Active Customers</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{customerCount}</div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {totalCount > 0 ? Math.round((customerCount / totalCount) * 100) : 0}% customer conversion
          </div>
        </Card>

        <Card className="border-border/80 bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Do Not Call</span>
            <AlertCircle className="size-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{dncCount}</div>
          <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">Auto-suppressed from dialer</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/80 bg-card/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, phone, or tag..."
              className="h-9 pl-9 text-xs rounded-xl bg-muted/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Synced: {lastSynced}
            </span>
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold"
              >
                <option value="all">All Statuses ({totalCount})</option>
                <option value="lead">Leads ({leadCount})</option>
                <option value="active">Active</option>
                <option value="customer">Customers</option>
                <option value="do-not-call">Do Not Call ({dncCount})</option>
              </select>
            </div>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-muted-foreground/40" />
                      <p className="font-semibold text-foreground">No contacts found</p>
                      <p className="text-xs">Adjust your search filter or import new leads</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 font-bold text-brand-primary text-xs">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{c.name}</div>
                          {c.lastContacted && (
                            <span className="text-[10px] text-muted-foreground">
                              Contacted {c.lastContacted}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-medium">{c.company || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">{c.phone}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{c.email || '—'}</td>
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
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Dial via WebRTC Softphone */}
                        <Button
                          size="sm"
                          onClick={() => telephony.startCall(c.phone, c.name)}
                          disabled={c.status === 'do-not-call'}
                          className={`h-8 gap-1 rounded-lg text-xs font-semibold ${
                            c.status === 'do-not-call'
                              ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                          }`}
                          title={c.status === 'do-not-call' ? 'Contact marked Do-Not-Call' : `Dial ${c.name}`}
                        >
                          <Phone className="size-3.5" />
                          Dial
                        </Button>

                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(c)}
                          className="size-8 rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit contact"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteContact(c.id, c.name)}
                          className="size-8 rounded-lg p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete contact"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
              Save lead details directly into Centennial Connect directory and MongoDB
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <Input
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="e.g. Elena Rostova"
                className="mt-1 h-9 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company</label>
                <Input
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder="e.g. Apex Global"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Status</label>
                <select
                  value={contactForm.status}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, status: e.target.value as ContactStatus })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium"
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="customer">Customer</option>
                  <option value="qualified">Qualified</option>
                  <option value="contacted">Contacted</option>
                  <option value="do-not-call">Do Not Call</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
                <Input
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+1 (555) 012-3456"
                  className="mt-1 h-9 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="elena@apex.io"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tags (comma separated)</label>
              <Input
                value={contactForm.tags}
                onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                placeholder="inbound, enterprise, priority"
                className="mt-1 h-9 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Notes</label>
              <Textarea
                rows={2}
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                placeholder="Relevant account context or conversation history..."
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-semibold"
              >
                Create Contact Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Contact Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update contact information and sync changes with MongoDB
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateContact} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
              <Input
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="mt-1 h-9 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company</label>
                <Input
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Status</label>
                <select
                  value={contactForm.status}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, status: e.target.value as ContactStatus })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium"
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="customer">Customer</option>
                  <option value="qualified">Qualified</option>
                  <option value="contacted">Contacted</option>
                  <option value="do-not-call">Do Not Call</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
                <Input
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="mt-1 h-9 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tags (comma separated)</label>
              <Input
                value={contactForm.tags}
                onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                className="mt-1 h-9 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Notes</label>
              <Textarea
                rows={2}
                value={contactForm.notes}
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-semibold"
              >
                Save Contact Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-brand-primary" />
              <span>Bulk Import Contacts (CSV)</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Paste CSV records or load a sample batch to import leads into your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Format: Name, Phone, Email, Company, Status, Tags
              </span>
              <button
                type="button"
                onClick={handleLoadDemoCsv}
                className="text-[11px] font-semibold text-brand-primary hover:underline"
              >
                Load Sample Leads
              </button>
            </div>

            <Textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Elena Rostova, +14155550123, elena@apex.io, Apex Global, lead, priority&#10;James Holden, +12065550188, james@roci.org, Roci Logistics, active, enterprise"
              className="font-mono text-[11px] rounded-xl"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-muted-foreground">
                {importText.trim() ? `${importText.trim().split('\n').length} row(s) ready` : 'No data pasted'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkImport}
                  disabled={!importText.trim() || isImporting}
                  className="gap-1.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-semibold"
                >
                  <Upload className="size-3.5" />
                  {isImporting ? 'Importing...' : 'Start Import'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
