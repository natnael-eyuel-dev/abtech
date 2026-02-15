import { ArticleCardSkeleton } from '@/components/shared/page-loading'

export default function SearchLoading() {
  return (
    <div className="min-h-screen">
      {/* Search Header Loading */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button skeleton */}
            <div className="mb-4">
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>
            
            <div className="text-center space-y-6">
              {/* Title skeleton */}
              <div className="h-12 w-64 bg-muted animate-pulse rounded mx-auto" />
              
              {/* Description skeleton */}
              <div className="space-y-2 max-w-2xl mx-auto">
                <div className="h-6 bg-muted animate-pulse rounded w-full" />
                <div className="h-6 bg-muted animate-pulse rounded w-5/6 mx-auto" />
              </div>
              
              {/* Search bar skeleton */}
              <div className="relative max-w-2xl mx-auto mb-6">
                <div className="h-14 bg-muted animate-pulse rounded-lg" />
              </div>

              {/* Quick Stats skeleton */}
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-10 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Results Loading */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters Loading */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                {/* Filters card skeleton */}
                <div className="bg-card p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </div>

                  {/* Category filter skeleton */}
                  <div className="mb-6">
                    <div className="h-5 w-20 bg-muted animate-pulse rounded mb-3" />
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 w-full bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  </div>

                  {/* Tags filter skeleton */}
                  <div>
                    <div className="h-5 w-24 bg-muted animate-pulse rounded mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-8 w-16 bg-muted animate-pulse rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active filters skeleton */}
                <div className="bg-card p-6 rounded-lg">
                  <div className="h-5 w-28 bg-muted animate-pulse rounded mb-3" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Loading */}
            <div className="lg:w-3/4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                <div className="space-y-2">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort dropdown skeleton */}
                  <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                  
                  {/* View mode toggle skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>

              {/* Articles Grid Loading */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}