import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://abtech.com'
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/search',
    '/auth/signin',
    '/auth/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }))

  // Category pages (these would be dynamic in a real app)
  const categories = [
    'technology',
    'ai-machine-learning',
    'startups',
    'crypto',
    'web-development',
  ].map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categories]
}