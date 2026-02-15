"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import PageHero from '@/components/shared/PageHero'

export default function AdminCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', slug: '', description: '' })
  const [coverInput, setCoverInput] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/courses', { cache: 'no-store' })
    const data = await res.json()
    setCourses(data.courses || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createCourse() {
    if (!form.title || !form.slug) return
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ title: '', slug: '', description: '' })
      await load()
    }
  }

  async function deleteCourse(id: string) {
    const url = `/api/admin/courses?id=${id}`
    await fetch(url, { method: 'DELETE' })
    await load()
  }

  async function togglePublish(courseId: string, publish: boolean) {
    const payload = { id: courseId, status: publish ? 'PUBLISHED' : 'DRAFT' }
    await fetch('/api/admin/courses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await load()
  }

  async function uploadCourseCover(courseId: string) {
    if (!coverInput && !coverFile) return
    setUploadBusy(true)
    try {
  const body: any = {}
      if (coverFile) {
        const data = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(String(fr.result || ''))
          fr.onerror = e => reject(e)
          fr.readAsDataURL(coverFile)
        })
        body.data = data
      } else if (coverInput) {
        body.url = coverInput
      }
      const res = await fetch(`/api/admin/courses/${courseId}/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        console.error('Cover upload failed')
      } else {
        setCoverInput('')
        setCoverFile(null)
        await load()
      }
    } finally {
      setUploadBusy(false)
    }
  }

  async function removeCourseCover(courseId: string) {
    setUploadBusy(true)
    try {
      await fetch(`/api/admin/courses/${courseId}/cover`, { method: 'DELETE' })
      await load()
    } finally {
      setUploadBusy(false)
    }
  }

  async function addModule(courseId: string, title: string) {
    if (!title) return
    await fetch(`/api/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    await load()
  }

  function ModuleForm({ onSubmit }: { onSubmit: (title: string) => void }) {
    const [title, setTitle] = useState('')
    return (
      <div className="flex gap-2">
        <Input placeholder="New module title" value={title} onChange={e => setTitle(e.target.value)} />
        <Button size="sm" onClick={() => { onSubmit(title); setTitle('') }}>Add</Button>
      </div>
    )
  }

  function AssetForm({ onSubmit }: { onSubmit: (title: string, publicId: string) => void }) {
    const [title, setTitle] = useState('')
    const [publicId, setPublicId] = useState('')
    return (
      <div className="flex gap-2">
        <Input placeholder="Asset title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Cloudinary publicId" value={publicId} onChange={e => setPublicId(e.target.value)} />
        <Button size="sm" onClick={() => { onSubmit(title, publicId); setTitle(''); setPublicId('') }}>Add</Button>
      </div>
    )
  }

  // New AssetFormWithUpload supports local file selection and base64 upload
  function AssetFormWithUpload({ onSubmit }: { onSubmit: (title: string, publicId?: string, data?: string) => void }) {
    const [title, setTitle] = useState('')
    const [publicId, setPublicId] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [busy, setBusy] = useState(false)

    async function handleAdd() {
      if (!title) return
      if (file) {
        setBusy(true)
        const data = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(String(fr.result || ''))
          fr.onerror = (e) => reject(e)
          fr.readAsDataURL(file)
        })
        await onSubmit(title, undefined, data)
        setFile(null)
        setTitle('')
        setBusy(false)
        return
      }
      await onSubmit(title, publicId || undefined, undefined)
      setTitle('')
      setPublicId('')
    }

    return (
      <div className="flex gap-2 items-center">
        <Input placeholder="Asset title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Cloudinary publicId (optional)" value={publicId} onChange={e => setPublicId(e.target.value)} />
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
        <Button size="sm" onClick={handleAdd} disabled={busy}>{busy ? 'Uploading...' : 'Add'}</Button>
      </div>
    )
  }

  async function addAsset(courseId: string, moduleId: string, title: string, publicId?: string, data?: string) {
    if (!moduleId || !title) return
    const payload: any = { title }
    if (publicId) payload.publicId = publicId
    if (data) payload.data = data
    await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    await load()
  }

  async function deleteModule(courseId: string, id: string) {
    await fetch(`/api/admin/courses/${courseId}/modules?id=${id}`, { method: 'DELETE' })
    await load()
  }

  // Sortable module item
  function SortableModule({ module, onDelete, children }: { module: any, onDelete: () => void, children?: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id })
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
    }
    return (
      <div ref={setNodeRef} style={style} className="rounded border p-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="cursor-grab p-1 text-muted-foreground hover:text-foreground" aria-label="Drag" {...attributes} {...listeners}>
              <GripVertical className="size-4" />
            </button>
            <div className="font-medium">{module.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        badge="admin"
        title="Courses Management"
        subtitle="Create and manage course structure, modules, and assets."
        imageSrc="/images/hero.png"
        overlayOpacity={0.35}
        actions={<Button variant="outline" onClick={() => history.back()}>Back</Button>}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Create Course</CardTitle>
            <CardDescription>Basic metadata for a new course. You can add modules and assets after creating.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input placeholder="slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="flex justify-end">
              <Button onClick={createCourse}>Create</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : courses.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <CardDescription>/{c.slug}</CardDescription>
                  {c.coverImage && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Cover:</span>{' '}
                      <span className="text-xs font-mono break-all">{c.coverImage}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{(c.level || 'BEGINNER').toLowerCase()}</Badge>
                  <Badge variant={c.published ? 'default' : 'outline'}>{(c.status || 'DRAFT').toLowerCase()}</Badge>
                  {c.published ? (
                    <Button size="sm" onClick={() => togglePublish(c.id, false)}>Unpublish</Button>
                  ) : (
                    <Button size="sm" onClick={() => togglePublish(c.id, true)}>Publish</Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => deleteCourse(c.id)}>Delete</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  {/* Cover upload section */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Course Cover</div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <Input placeholder="Image URL (https://...)" value={coverInput} onChange={e => setCoverInput(e.target.value)} className="flex-1" />
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files ? e.target.files[0] : null)} />
                        <Button size="sm" variant="secondary" onClick={() => { setCoverInput(''); setCoverFile(null) }}>Clear</Button>
                        <Button size="sm" onClick={() => uploadCourseCover(c.id)} disabled={uploadBusy}>{uploadBusy ? 'Uploading…' : 'Save Cover'}</Button>
                        {c.coverImage && (
                          <Button size="sm" variant="destructive" onClick={() => removeCourseCover(c.id)} disabled={uploadBusy}>{uploadBusy ? '…' : 'Remove'}</Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Provide either a direct image URL or select a file. We store the Cloudinary public ID after upload.</p>
                  </div>
                <ModuleForm onSubmit={(title) => addModule(c.id, title)} />
                <DndContext collisionDetection={closestCenter} onDragEnd={async (event: DragEndEvent) => {
                  const { active, over } = event
                  if (!over || active.id === over.id) return
                  const modules = c.modules || []
                  const oldIndex = modules.findIndex((m: any) => m.id === active.id)
                  const newIndex = modules.findIndex((m: any) => m.id === over.id)
                  if (oldIndex === -1 || newIndex === -1) return
                  const newOrder = arrayMove(modules, oldIndex, newIndex)
                  // Optimistic UI
                  setCourses(prev => prev.map(pc => pc.id === c.id ? { ...pc, modules: newOrder } : pc))
                  // Persist batch reorder
                  await fetch(`/api/admin/courses/${c.id}/modules`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reorder: newOrder.map((m: any, idx: number) => ({ id: m.id, order: idx })) }),
                  })
                  // Reload to confirm
                  await load()
                }}>
                  <SortableContext items={(c.modules || []).map((m: any) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {(c.modules || []).map((m: any) => (
                        <SortableModule key={m.id} module={m} onDelete={() => deleteModule(c.id, m.id)}>
                            <div className="mt-3 space-y-2">
                                <AssetFormWithUpload onSubmit={(title, publicId, data) => addAsset(c.id, m.id, title, publicId, data)} />
                                <div className="text-xs text-muted-foreground">{(m.assets || []).length} assets</div>

                                {/* Asset list with reorder */}
                                <div className="mt-2">
                                  <DndContext collisionDetection={closestCenter} onDragEnd={async (ev) => {
                                    const { active, over } = ev as any
                                    if (!over || active.id === over.id) return
                                    const assets = m.assets || []
                                    const oldIndex = assets.findIndex((a: any) => a.id === active.id)
                                    const newIndex = assets.findIndex((a: any) => a.id === over.id)
                                    if (oldIndex === -1 || newIndex === -1) return
                                    const newOrder = arrayMove(assets, oldIndex, newIndex)
                                    // Optimistic
                                    setCourses(prev => prev.map(pc => pc.id === c.id ? ({ ...pc, modules: pc.modules.map((mod: any) => mod.id === m.id ? ({ ...mod, assets: newOrder }) : mod) }) : pc))
                                    // Persist
                                    await fetch(`/api/admin/courses/${c.id}/modules/${m.id}/assets`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ reorder: newOrder.map((a: any, idx: number) => ({ id: a.id, order: idx })) }),
                                    })
                                    await load()
                                  }}>
                                    <SortableContext items={(m.assets || []).map((a: any) => a.id)} strategy={verticalListSortingStrategy}>
                                      <div className="space-y-2 mt-2">
                                        {(m.assets || []).map((a: any) => (
                                          <div key={a.id} className="flex items-center justify-between rounded border p-2 bg-card">
                                            <div className="flex items-center gap-2">
                                              <GripVertical className="size-4 text-muted-foreground" />
                                              <div className="text-sm">{a.title}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {/* Use Cloudinary inline flag with a friendly filename to encourage inline open */}
                                              {(() => {
                                                const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                                                const publicId = String(a.publicId || '').replace(/\.pdf$/i, '')
                                                if (!cloud) return <span className="text-xs text-muted-foreground">No cloud</span>
                                                // For raw PDFs, Cloudinary serves correct Content-Type. "fl_inline" is allowed as a flag
                                                // BUT adding a colon + filename to the flag (fl_inline:filename) is invalid and causes HTTP 400.
                                                // Use plain inline flag, and provide a separate download link if desired.
                                                const downloadName = (a.title ? a.title : 'document').replace(/\s+/g, '_') + '.pdf'
                                                // Use our proxy to enforce inline headers and friendly filenames reliably
                                                const inlineHref = `/api/pdf?publicId=${encodeURIComponent(publicId)}&filename=${encodeURIComponent(downloadName)}&dl=0`
                                                const downloadHref = `/api/pdf?publicId=${encodeURIComponent(publicId)}&filename=${encodeURIComponent(downloadName)}&dl=1`
                                                return (
                                                  <div className="flex items-center gap-2">
                                                    <a href={inlineHref} target="_blank" rel="noreferrer" className="text-xs text-primary">Open</a>
                                                    <a href={downloadHref} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground">Download</a>
                                                  </div>
                                                )
                                              })()}
                                              <Button variant="outline" size="sm" onClick={async () => { await fetch(`/api/admin/courses/${c.id}/modules/${m.id}/assets?id=${a.id}`, { method: 'DELETE' }); await load() }}>Delete</Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
                                </div>
                            </div>
                        </SortableModule>
                      ))}
                      {(c.modules || []).length === 0 && (
                        <div className="text-sm text-muted-foreground">No modules yet.</div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          ))}
          {!loading && courses.length === 0 && (
            <div className="text-sm text-muted-foreground">No courses yet.</div>
          )}
        </div>
      </main>
    </div>
  )
}
