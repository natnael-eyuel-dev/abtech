"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'

type FAQ = { question: string; answer: string }

export default function AdminContactPage() {
  const router = useRouter()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [drafts, setDrafts] = useState<FAQ[]>([])
  const [open, setOpen] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/contact/faqs')
        if (!res.ok) return
        const json = await res.json()
        setFaqs(Array.isArray(json.faqs) ? json.faqs : [])
      } catch {}
    })()
  }, [])

  const validate = (item: FAQ) => {
    if (!item.question?.trim()) return 'Question is required'
    if (!item.answer?.trim()) return 'Answer is required'
    return ''
  }

  async function saveItem(index: number, item: FAQ) {
    const err = validate(item)
    if (err) { toast.error(err); return }
    try {
      setLoading(true)
      const res = await fetch('/api/admin/contact/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, item })
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Saved')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  async function saveDraft(draftIndex: number, item: FAQ) {
    const err = validate(item)
    if (err) { toast.error(err); return }
    try {
      setLoading(true)
      const res = await fetch('/api/admin/contact/faqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, op: 'add' })
      })
      if (!res.ok) throw new Error('Failed to add')
      setFaqs((arr) => [item, ...arr])
      setDrafts((arr) => arr.filter((_, i) => i !== draftIndex))
      toast.success('Added')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  async function deleteItem(index: number) {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/contact/faqs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      })
      if (!res.ok) throw new Error('Failed to delete')
      setFaqs((arr) => arr.filter((_, i) => i !== index))
      toast.success('Deleted')
    } catch (e: any) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="Contact / FAQs"
        subtitle="Manage Frequently Asked Questions shown on the public Contact page."
        badge="Admin"
        actions={<Button variant="outline" onClick={() => router.back()}>Back</Button>}
      />
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>FAQs</CardTitle>
              <Badge variant="secondary">contactFaqs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((item, idx) => {
                const number = idx + 1
                return (
                  <div key={idx} className="border rounded-2xl p-4 mb-4 shadow-sm">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen((prev) => {
                        const next = new Set(prev);
                        if (next.has(idx)) next.delete(idx);
                        else next.add(idx);
                        return next;
                      })}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="min-w-8 justify-center">#{number}</Badge>
                        <span className="font-medium">{item.question || 'Untitled'}</span>
                      </div>
                      {open.has(idx) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    {open.has(idx) && (
                      <>
                        <div className="grid grid-cols-1 gap-3 mt-4">
                          <Input placeholder="Question" required value={item.question} onChange={(e)=> setFaqs((arr)=> arr.map((t,i)=> i===idx? { ...t, question: e.target.value }: t))} />
                          <Textarea placeholder="Answer" required value={item.answer} onChange={(e)=> setFaqs((arr)=> arr.map((t,i)=> i===idx? { ...t, answer: e.target.value }: t))} />
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button variant="outline" disabled={loading} onClick={async ()=>{ await deleteItem(idx) }}>Remove</Button>
                          <Button disabled={loading} onClick={()=> saveItem(idx, faqs[idx])}>{loading? 'Saving...': 'Save'}</Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {drafts.map((item, idx) => (
                <div key={`draft-${idx}`} className="border rounded-2xl p-4 mb-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="min-w-12 justify-center">Draft</Badge>
                    </div>
                    <Input placeholder="Question" required value={item.question} onChange={(e)=> setDrafts((arr)=> arr.map((t,i)=> i===idx? { ...t, question: e.target.value }: t))} />
                    <Textarea placeholder="Answer" required value={item.answer} onChange={(e)=> setDrafts((arr)=> arr.map((t,i)=> i===idx? { ...t, answer: e.target.value }: t))} />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" onClick={()=> setDrafts((arr)=> arr.filter((_,i)=> i!==idx))}><X className="h-4 w-4 mr-1"/>Cancel</Button>
                    <Button disabled={loading} onClick={()=> saveDraft(idx, drafts[idx])}>{loading? 'Saving...': 'Add'}</Button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={()=> setDrafts((arr)=> [...arr, { question: '', answer: '' }])}>Add FAQ</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
