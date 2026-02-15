"use client"

import React, { useState } from 'react'
import PdfViewerClientWrapper from '@/components/pdf-viewer/PdfViewerClientWrapper'

export default function CourseModulesClient({ modules }: { modules: any[] }) {
  const [openAssetId, setOpenAssetId] = useState<string | null>(null)

  return (
    <div className="mt-10 space-y-4">
      {modules.map((m) => {
        const assets = m.assets || []
        return (
          <div key={m.id} className="rounded-xl border bg-card">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span>{m.title}</span>
                <span className="text-xs text-muted-foreground">{assets.length} file{assets.length === 1 ? '' : 's'}</span>
              </h3>
              {m.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.description}</p>}
            </div>

            <div className="divide-y">
              {assets.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No files in this module yet.</div>
              )}
              {assets.map((a: any, idx: number) => {
                const isOpen = openAssetId === a.id
                const url = `/api/pdf?publicId=${encodeURIComponent(a.publicId)}&filename=${encodeURIComponent((a.title || 'document') + '.pdf')}&dl=0`
                return (
                  <div
                    key={a.id}
                    className={`group ${isOpen ? 'bg-muted/40' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenAssetId(isOpen ? null : a.id)}
                      className="w-full text-left p-4 flex items-start gap-4 hover:bg-muted/50 focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0 mt-0.5 border border-primary/20">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{a.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                          <span>{a.pages ? `${a.pages} pages` : 'PDF'}</span>
                          {a.bytes && <span>{(a.bytes/1024/1024).toFixed(1)} MB</span>}
                          {a.publicId ? null : <span className="text-red-500">missing publicId</span>}
                        </div>
                      </div>
                    </button>
                    {isOpen && a.publicId && (
                      <div className="px-4 pb-4">
                        <PdfViewerClientWrapper url={url} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
