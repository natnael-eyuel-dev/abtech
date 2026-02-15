"use client"

import { Background } from '@/components/shared/Background'
import { Badge } from '@/components/ui/badge'

interface PageHeroProps {
  title: string
  subtitle?: string
  badge?: string
  imageSrc?: string
  overlayOpacity?: number
  actions?: React.ReactNode
}

export default function PageHero({ title, subtitle, badge, imageSrc, overlayOpacity, actions }: PageHeroProps) {
  return (
    <Background imageSrc={imageSrc} overlayOpacity={overlayOpacity}>
      <div className="max-w-4xl mx-auto">
        {badge && (
          <Badge variant="secondary" className="mb-4">{badge}</Badge>
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">{subtitle}</p>
        )}
        {actions && (
          <div className="mt-4 flex items-center justify-center gap-3">{actions}</div>
        )}
      </div>
    </Background>
  )
}
