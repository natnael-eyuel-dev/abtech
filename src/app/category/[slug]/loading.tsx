import { ArticleCardSkeleton } from '@/components/shared/page-loading'

export default function CategoryLoading() {
  return (
    <div className="min-h-screen">
      {/* Category Header Loading */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button skeleton */}
            <div className="mb-4">
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                {/* Badge skeleton */}
                <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
                
                {/* Title skeleton */}
                <div className="h-12 w-80 bg-muted animate-pulse rounded" />
                
                {/* Description skeleton */}
                <div className="h-6 w-96 bg-muted animate-pulse rounded" />
                
                {/* Category Stats skeleton */}
                <div className="grid grid-cols-3 gap-6 max-w-lg">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-12 bg-muted animate-pulse rounded mx-auto mb-2" />
                      <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags skeleton */}
              <div className="bg-card p-6 rounded-lg">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section Loading */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Search and Filters Loading */}
          <div className="space-y-4 mb-8">
            {/* Search bar skeleton */}
            <div className="relative max-w-md">
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Category filter skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
              </div>

              {/* View Mode Toggle skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                <div className="h-10 w-10 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Articles Grid Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}