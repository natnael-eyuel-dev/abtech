import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const existing = await (db as any).communitySection.findUnique({ where: { key: 'contactFaqs' } })
    const faqs = Array.isArray(existing?.data) ? existing!.data : []
    return NextResponse.json({ faqs })
  } catch (e) {
    console.error('Public contact FAQs GET error', e)
    return NextResponse.json({ faqs: [] })
  }
}
