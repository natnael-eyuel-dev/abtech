import { NextRequest, NextResponse } from 'next/server'

function encodePublicId(publicId: string) {
  // Encode each segment but preserve slashes
  return publicId
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/')
}

async function handleProxy(req: NextRequest, method: 'GET' | 'HEAD') {
  const url = new URL(req.url)
  const publicId = url.searchParams.get('publicId') || ''
  const filename = url.searchParams.get('filename') || 'document.pdf'
  const dl = url.searchParams.get('dl') === '1'

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  if (!cloud) {
    return NextResponse.json({ error: 'Cloudinary cloud name not configured' }, { status: 500 })
  }
  if (!publicId) {
    return NextResponse.json({ error: 'Missing publicId' }, { status: 400 })
  }

  try {
    const encodedId = encodePublicId(publicId.replace(/\.pdf$/i, ''))
    // Build base raw URL
    const baseUrl = `https://res.cloudinary.com/${cloud}/raw/upload/${encodedId}`

    // Forward Range header to support partial content and speedier pdf.js behavior
    const range = req.headers.get('range') || undefined
    const upstream = await fetch(baseUrl, {
      method,
      headers: range ? { Range: range } as any : undefined,
      cache: 'no-store',
    })

    // Pass through upstream errors
    if (!upstream.ok && upstream.status !== 206) {
      // Try to read text body if available for message
      let details: any = undefined
      try { details = await upstream.text() } catch { /* ignore */ }
      return NextResponse.json({ error: `Upstream error ${upstream.status}`, details }, { status: upstream.status })
    }

    const headers = new Headers()
    // Prefer upstream content type when present
    const upstreamCT = upstream.headers.get('content-type') || 'application/pdf'
    headers.set('Content-Type', upstreamCT)
    // Propagate range-related headers
    const contentRange = upstream.headers.get('content-range')
    const contentLength = upstream.headers.get('content-length')
    const acceptRanges = upstream.headers.get('accept-ranges') || 'bytes'
    if (contentRange) headers.set('Content-Range', contentRange)
    if (contentLength) headers.set('Content-Length', contentLength)
    headers.set('Accept-Ranges', acceptRanges)
    headers.set('Cache-Control', 'private, max-age=120')
    const cd = `${dl ? 'attachment' : 'inline'}; filename="${filename.replace(/"/g, '')}"`
    headers.set('Content-Disposition', cd)

    if (method === 'HEAD') {
      return new NextResponse(null, { status: upstream.status, headers })
    }

    const body = upstream.body
    return new Response(body, { status: upstream.status, headers })
  } catch (e: any) {
    console.error('PDF proxy error:', e)
    return NextResponse.json({ error: 'Failed to stream PDF' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handleProxy(req, 'GET')
}

export async function HEAD(req: NextRequest) {
  return handleProxy(req, 'HEAD')
}
