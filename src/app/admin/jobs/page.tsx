"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
 import { toast } from '@/hooks/use-toast'

 type Job = { id: string; title: string; company: string; location: string; type: string; description: string; applyUrl: string; contactEmail?: string | null; tags?: string | null; source: 'ABTECH' | 'EXTERNAL'; active: boolean; featured: boolean; compensationType?: string | null; salaryMin?: number | null; salaryMax?: number | null; currency?: string | null; remoteType?: string | null; experienceLevel?: string | null; allowSiteApply?: boolean }
 type Submission = { id: string; title: string; company: string; location: string; type: string; description: string; applyUrl: string; contactEmail: string; tags?: string | null; status: 'PENDING' | 'APPROVED' | 'REJECTED' }
 type Application = { id: string; name: string; email: string; phone?: string | null; linkedin?: string | null; portfolio?: string | null; resumeUrl?: string | null; coverLetter?: string | null; status: 'SUBMITTED' | 'REVIEWED' | 'REJECTED' | 'HIRED' }

export default function AdminJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [subs, setSubs] = useState<Submission[]>([])
  const [appsByJob, setAppsByJob] = useState<Record<string, Application[]>>({})
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<Partial<Job>[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      const [jr, sr] = await Promise.all([
        fetch('/api/admin/jobs'),
        fetch('/api/admin/jobs/submissions'),
      ])
      if (jr.ok) {
        const j = await jr.json()
        setJobs(j.jobs || [])
      }
      if (sr.ok) {
        const s = await sr.json()
        setSubs(s.submissions || [])
      }
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  async function loadApplications(jobId: string) {
    try {
      const r = await fetch(`/api/admin/jobs/applications?jobId=${jobId}`)
      if (!r.ok) return
      const j = await r.json()
      setAppsByJob((m) => ({ ...m, [jobId]: j.applications || [] }))
    } catch (e) {
      console.error('Load applications error', e)
    }
  }

  function JobRow({ job, idx }: { job: Job, idx: number }) {
    const isOpen = open.has(job.id)
    const [form, setForm] = useState<Job>(job)

    // Sync when switching rows by id
    useEffect(() => { setForm(job) }, [job.id])

    const patchForm = (patch: Partial<Job>) => setForm((f) => ({ ...f, ...patch }))

    return (
      <div className="border rounded-2xl p-4 mb-4 shadow-sm">
        {/* Header (clickable to toggle) */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpen(p => { const n = new Set(p); if (n.has(job.id)) { n.delete(job.id) } else { n.add(job.id); if (!appsByJob[job.id]) { loadApplications(job.id) } } return n })}
        >
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="min-w-8 justify-center">#{idx + 1}</Badge>
              <span className="font-medium">{form.title} <span className="text-muted-foreground">— {form.company}</span></span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{form.location} • {form.type?.replace('_',' ')}</div>
          </div>
          <div className="shrink-0 text-muted-foreground">
            {isOpen ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-3">Title</Label>
                <Input value={form.title} onChange={(e)=> patchForm({ title: e.target.value })} />
              </div>
              <div>
                <Label className="mb-3">Company</Label>
                <Input value={form.company} onChange={(e)=> patchForm({ company: e.target.value })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-3">Location</Label>
                <Input value={form.location} onChange={(e)=> patchForm({ location: e.target.value })} />
              </div>
              <div>
                <Label className="mb-3">Type</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.type as any} onChange={(e)=> patchForm({ type: e.target.value })}>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="TEMPORARY">Temporary</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="mb-3">Apply URL</Label>
                <Input value={form.applyUrl} onChange={(e)=> patchForm({ applyUrl: e.target.value })} />
              </div>
              <div>
                <Label className="mb-3">Contact Email</Label>
                <Input value={form.contactEmail || ''} onChange={(e)=> patchForm({ contactEmail: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="mb-3">Tags</Label>
              <Input value={form.tags || ''} onChange={(e)=> patchForm({ tags: e.target.value })} />
            </div>

            <div>
              <Label className="mb-3">Description</Label>
              <Textarea className="min-h-[120px]" value={form.description} onChange={(e)=> patchForm({ description: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="mb-3">Source</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.source} onChange={(e)=> patchForm({ source: e.target.value as any })}>
                  <option value="ABTECH">AB TECH</option>
                  <option value="EXTERNAL">EXTERNAL</option>
                </select>
              </div>
              <div>
                <Label className="mb-3">Allow Site Apply</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={String(form.allowSiteApply ?? true)} onChange={(e)=> patchForm({ allowSiteApply: e.target.value === 'true' })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <Label className="mb-3">Featured</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={String(form.featured)} onChange={(e)=> patchForm({ featured: e.target.value === 'true' })}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="mb-3">Active</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={String(form.active)} onChange={(e)=> patchForm({ active: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <Label className="mb-3">Compensation</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.compensationType || ''} onChange={(e)=> patchForm({ compensationType: e.target.value })}>
                  <option value="">Select…</option>
                  <option value="SALARY">Salary</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="STIPEND">Stipend</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
              </div>
              <div>
                <Label className="mb-3">Currency</Label>
                <Input value={form.currency || ''} onChange={(e)=> patchForm({ currency: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="mb-3">Salary Min</Label>
                <Input type="number" value={form.salaryMin ?? ''} onChange={(e)=> patchForm({ salaryMin: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label className="mb-3">Salary Max</Label>
                <Input type="number" value={form.salaryMax ?? ''} onChange={(e)=> patchForm({ salaryMax: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <Label className="mb-3">Work Mode</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.remoteType || ''} onChange={(e)=> patchForm({ remoteType: e.target.value })}>
                  <option value="">Select…</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label className="mb-3">Experience Level</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.experienceLevel || ''} onChange={(e)=> patchForm({ experienceLevel: e.target.value })}>
                  <option value="">Select…</option>
                  <option value="INTERN">Intern</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={async ()=>{ try{ setLoading(true); const r=await fetch('/api/admin/jobs',{ method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: job.id })}); if(!r.ok) throw new Error('Delete failed'); setJobs(arr=> arr.filter(j=> j.id!==job.id)); toast({ title:'Removed' }) } catch(e:any){ toast({ title:'Delete failed', description:e.message, variant:'destructive' }) } finally{ setLoading(false) } }}>Remove</Button>
              <Button onClick={async ()=>{ try{ setLoading(true); const r=await fetch('/api/admin/jobs',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)}); if(!r.ok) throw new Error('Save failed'); setJobs(arr=> arr.map(j=> j.id===job.id? { ...form }: j)); toast({ title:'Saved' }) } catch(e:any){ toast({ title:'Save failed', description:e.message, variant:'destructive' }) } finally{ setLoading(false) } }}>Save</Button>
            </div>

            {/* Applications */}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Applications</h4>
                <Badge variant="outline">{appsByJob[job.id]?.length || 0}</Badge>
              </div>
              <div className="space-y-3">
                {(appsByJob[job.id] || []).map((a) => (
                  <div key={a.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-medium">{a.name} <span className="text-muted-foreground">• {a.email}</span></div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                          {a.phone && <span>📞 {a.phone}</span>}
                          {a.linkedin && <a className="underline" href={a.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                          {a.portfolio && <a className="underline" href={a.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
                          {a.resumeUrl && <a className="underline" href={a.resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select className="h-9 rounded-md border bg-background px-2 text-sm" value={a.status} onChange={async (e)=>{
                          try{ const r=await fetch('/api/admin/jobs/applications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id: a.id, status: e.target.value})}); if(!r.ok) throw new Error('Update failed'); await loadApplications(job.id); toast({ title:'Updated' }) }catch(err:any){ toast({ title:'Update failed', description: err.message, variant:'destructive' }) }
                        }}>
                          <option value="SUBMITTED">Submitted</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="HIRED">Hired</option>
                        </select>
                        <Button size="sm" variant="outline" onClick={async ()=>{ try{ const r=await fetch('/api/admin/jobs/applications',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id: a.id})}); if(!r.ok) throw new Error('Delete failed'); await loadApplications(job.id); toast({ title:'Deleted' }) }catch(err:any){ toast({ title:'Delete failed', description: err.message, variant:'destructive' }) } }}>Remove</Button>
                      </div>
                    </div>
                    {a.coverLetter && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{a.coverLetter}</p>}
                  </div>
                ))}
                {(appsByJob[job.id] || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="Jobs"
        subtitle="Manage job postings and review submissions."
        badge="Admin"
        actions={<Button variant="outline" onClick={()=> router.back()}>Back</Button>}
      />
      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        {/* Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Postings</CardTitle>
              <Badge variant="secondary">jobs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {jobs.map((job, idx) => (
                <JobRow key={job.id} job={job} idx={idx} />
              ))}
              {drafts.map((d, idx) => (
                <div key={`draft-${idx}`} className="border rounded-2xl p-4 mb-4 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-3">Title</Label>
                      <Input value={d.title || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, title: e.target.value }: t))} />
                    </div>
                    <div>
                      <Label className="mb-3">Company</Label>
                      <Input value={d.company || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, company: e.target.value }: t))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <Label className="mb-3">Location</Label>
                      <Input value={d.location || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, location: e.target.value }: t))} />
                    </div>
                    <div>
                      <Label className="mb-3">Type</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={d.type as any || 'FULL_TIME'} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, type: e.target.value as any }: t))}>
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="FREELANCE">Freelance</option>
                        <option value="TEMPORARY">Temporary</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <Label className="mb-3">Apply URL</Label>
                      <Input value={d.applyUrl || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, applyUrl: e.target.value }: t))} />
                    </div>
                    <div>
                      <Label className="mb-3">Contact Email</Label>
                      <Input value={d.contactEmail || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, contactEmail: e.target.value }: t))} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label className="mb-3">Tags</Label>
                    <Input value={d.tags || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, tags: e.target.value }: t))} />
                  </div>
                  <div className="mt-3">
                    <Label className="mb-3">Description</Label>
                    <Textarea className="min-h-[120px]" value={d.description || ''} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, description: e.target.value }: t))} />
                  </div>
                  {/* let's make the down/left arrow have space from right border - currently the arrow is touching border of the box*/}
                  <div className="grid md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <Label className="mb-3">Source</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={d.source as any || 'ABTECH'} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, source: e.target.value as any }: t))}>
                        <option value="ABTECH">AB TECH</option>
                        <option value="EXTERNAL">EXTERNAL</option>
                      </select>
                    </div>
                    <div>
                      <Label className="mb-3">Featured</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={String(d.featured || false)} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, featured: e.target.value === 'true' }: t))}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    <div>
                      <Label className="mb-3">Active</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={String(d.active ?? true)} onChange={(e)=> setDrafts(arr=> arr.map((t,i)=> i===idx? { ...t, active: e.target.value === 'true' }: t))}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" onClick={()=> setDrafts(arr=> arr.filter((_,i)=> i!==idx))}><X className="h-4 w-4 mr-1"/>Cancel</Button>
                    <Button disabled={loading} onClick={async ()=>{ try{ setLoading(true); const payload={ ...d, featured: !!d.featured, active: d.active ?? true }; const r=await fetch('/api/admin/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!r.ok) throw new Error('Add failed'); setDrafts(arr=> arr.filter((_,i)=> i!==idx)); await load(); toast({ title: 'Job posted', description: 'Your job is now listed.' })}catch(e:any){toast({ title: 'Add failed', description: e.message, variant: 'destructive' })}finally{setLoading(false)} }}>Add</Button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={()=> setDrafts(arr=> [...arr, { title:'', company:'', location:'', type:'FULL_TIME', applyUrl:'', description:'', source:'ABTECH', active:true, featured:false, compensationType:'SALARY', currency:'USD', allowSiteApply:true }])}>Add Job</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Submissions</CardTitle>
              <Badge variant="secondary">job_submissions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subs.map((s, idx) => (
                <div key={s.id} className="border rounded-2xl p-4 mb-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.title} <span className="text-muted-foreground">— {s.company}</span></div>
                      <div className="text-xs text-muted-foreground mt-1">{s.location} • {s.type.replace('_',' ')}</div>
                      <div className="text-xs mt-1">Status: <Badge variant="outline">{s.status}</Badge></div>
                    </div>
                    <div className="flex gap-2">
                      {s.status === 'PENDING' && (
                        <>
                          <Button size="sm" variant="outline" onClick={async ()=>{ try{ setLoading(true); const r=await fetch('/api/admin/jobs/submissions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id: s.id, op:'approve'})}); if(!r.ok) throw new Error('Approve failed'); await load(); toast({ title: 'Approved', description: 'Submission approved and published.' })}catch(e:any){toast({ title: 'Approve failed', description: e.message, variant: 'destructive' })}finally{setLoading(false)} }}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={async ()=>{ try{ setLoading(true); const r=await fetch('/api/admin/jobs/submissions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id: s.id, op:'reject'})}); if(!r.ok) throw new Error('Reject failed'); await load(); toast({ title: 'Rejected', description: 'Submission has been rejected.' })}catch(e:any){toast({ title: 'Reject failed', description: e.message, variant: 'destructive' })}finally{setLoading(false)} }}>Reject</Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={async ()=>{ try{ setLoading(true); const r=await fetch('/api/admin/jobs/submissions',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id: s.id})}); if(!r.ok) throw new Error('Delete failed'); setSubs(arr=> arr.filter((x)=> x.id!==s.id)); toast({ title: 'Deleted' })}catch(e:any){toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })}finally{setLoading(false)} }}>Remove</Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-4">{s.description}</p>
                </div>
              ))}
              {subs.length === 0 && (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
