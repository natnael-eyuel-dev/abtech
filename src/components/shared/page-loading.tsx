'use client'

import { cn } from '@/lib/utils'

interface PageLoadingProps {
  className?: string
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PageLoading({ 
  className = '', 
  text = 'Loading...',
  size = 'md' 
}: PageLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4 p-8',
      className
    )}>
      {/* Spinner */}
      <div
        className={cn(
          'border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
      
      {/* Loading text */}
      <p className={cn(
        'text-muted-foreground font-medium animate-pulse',
        textSizes[size]
      )}>
        {text}
      </p>
    </div>
  )
}

// Simplified spinner component for inline use
export function Spinner({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Card skeleton loader for article cards
export function ArticleCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('bg-card border rounded-lg overflow-hidden', className)}>
      {/* Image skeleton */}
      <div className="h-48 bg-muted animate-pulse" />
      
      <div className="p-6 space-y-4">
        {/* Category and date skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-6 bg-muted animate-pulse rounded w-full" />
          <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
        </div>
        
        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-12 bg-muted animate-pulse rounded-full" />
        </div>
        
        {/* Author and meta skeleton */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-8 bg-muted animate-pulse rounded" />
            <div className="h-4 w-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Hero section skeleton loader
export function HeroSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-br from-primary/10 via-background to-muted/50 py-16 lg:py-24', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge skeleton */}
          <div className="flex justify-center">
            <div className="h-8 w-32 bg-muted animate-pulse rounded-full" />
          </div>
          
          {/* Logo skeleton */}
          <div className="flex justify-center">
            <div className="h-16 w-64 bg-muted animate-pulse rounded-lg" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="h-6 bg-muted animate-pulse rounded w-full" />
            <div className="h-6 bg-muted animate-pulse rounded w-full" />
            <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
          </div>
          
          {/* Search bar skeleton */}
          <div className="flex justify-center">
            <div className="h-12 w-96 bg-muted animate-pulse rounded-lg" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="h-8 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-8 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-8 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}