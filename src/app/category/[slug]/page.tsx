"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { ArticleCard, type Article } from "@/components/blog/article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/blog/category-filter";
import { Search, TrendingUp, ArrowLeft, Grid, List } from "lucide-react";
import Link from "next/link";

// Sample data - in a real app, this would come from an API
const sampleArticles: Article[] = [
  {
    id: "1",
    title: "The Future of AI: How Machine Learning is Transforming Industries",
    excerpt: "Artificial Intelligence and Machine Learning are revolutionizing the way businesses operate across various sectors. From healthcare to finance, discover the latest trends and applications.",
    content: "Full article content here...",
    author: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
    },
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    category: "AI & Machine Learning",
    tags: ["AI", "Machine Learning", "Technology", "Innovation"],
    readTime: 8,
    likes: 234,
    comments: 45,
    featured: true,
    trending: true,
    coverImage: "/images/ai-future.jpg",
  },
  {
    id: "2",
    title: "Building Scalable Web Applications with Next.js 15",
    excerpt: "Learn how to leverage the latest features in Next.js 15 to build high-performance, scalable web applications. Explore the App Router, server components, and more.",
    content: "Full article content here...",
    author: {
      name: "Mike Chen",
      avatar: "/avatars/mike.jpg",
    },
    publishedAt: "2024-01-14T14:30:00Z",
    updatedAt: "2024-01-14T14:30:00Z",
    category: "Web Development",
    tags: ["Next.js", "React", "Web Development", "JavaScript"],
    readTime: 12,
    likes: 189,
    comments: 32,
    featured: true,
    trending: false,
    coverImage: "/images/nextjs-15.jpg",
  },
  {
    id: "3",
    title: "Crypto Market Analysis: Bitcoin's Journey to New Heights",
    excerpt: "An in-depth analysis of Bitcoin's recent performance and the factors driving the cryptocurrency market. Expert insights on what to expect in the coming months.",
    content: "Full article content here...",
    author: {
      name: "Alex Rodriguez",
      avatar: "/avatars/alex.jpg",
    },
    publishedAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
    category: "Crypto",
    tags: ["Bitcoin", "Cryptocurrency", "Finance", "Trading"],
    readTime: 6,
    likes: 156,
    comments: 28,
    featured: false,
    trending: true,
    coverImage: "/images/crypto-analysis.jpg",
  },
  {
    id: "4",
    title: "Startup Success Stories: Companies That Made It Big in 2024",
    excerpt: "Discover the inspiring journeys of startups that achieved remarkable success this year. Learn from their strategies, challenges, and key decisions.",
    content: "Full article content here...",
    author: {
      name: "Emily Davis",
      avatar: "/avatars/emily.jpg",
    },
    publishedAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    category: "Startups",
    tags: ["Startups", "Business", "Success Stories", "Entrepreneurship"],
    readTime: 10,
    likes: 298,
    comments: 67,
    featured: false,
    trending: false,
    coverImage: "/images/startup-success.jpg",
  },
  {
    id: "5",
    title: "The Rise of Edge Computing: What You Need to Know",
    excerpt: "Edge computing is changing the way we process data. Understand the fundamentals, benefits, and real-world applications of this transformative technology.",
    content: "Full article content here...",
    author: {
      name: "David Kim",
      avatar: "/avatars/david.jpg",
    },
    publishedAt: "2024-01-11T11:20:00Z",
    updatedAt: "2024-01-11T11:20:00Z",
    category: "Technology",
    tags: ["Edge Computing", "Cloud", "Technology", "Infrastructure"],
    readTime: 7,
    likes: 145,
    comments: 23,
    featured: false,
    trending: false,
    coverImage: "/images/edge-computing.jpg",
  },
  {
    id: "6",
    title: "Web3 and the Future of Decentralized Applications",
    excerpt: "Explore the world of Web3 and decentralized applications. Learn about blockchain technology, smart contracts, and the potential impact on the internet.",
    content: "Full article content here...",
    author: {
      name: "Lisa Wang",
      avatar: "/avatars/lisa.jpg",
    },
    publishedAt: "2024-01-10T13:55:00Z",
    updatedAt: "2024-01-10T13:55:00Z",
    category: "Web Development",
    tags: ["Web3", "Blockchain", "Decentralization", "Smart Contracts"],
    readTime: 9,
    likes: 178,
    comments: 41,
    featured: false,
    trending: true,
    coverImage: "/images/web3-future.jpg",
  },
];

const categories = [
  "Technology",
  "AI & Machine Learning",
  "Startups",
  "Crypto",
  "Web Development",
];

interface CategoryPageProps {
  params: any;
  searchParams: any;
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categoryName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Check if category exists
  if (!categories.includes(categoryName)) {
    notFound();
  }

  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "popular">(searchParams.sort || "latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredArticles = sampleArticles.filter(article => {
    const matchesCategory = article.category === categoryName;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return b.trending === a.trending ? 0 : b.trending ? 1 : -1;
      case "popular":
        return b.likes - a.likes;
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  const categoryStats = {
    totalArticles: filteredArticles.length,
    totalReads: filteredArticles.reduce((sum, article) => sum + article.likes, 0),
    totalComments: filteredArticles.reduce((sum, article) => sum + article.comments, 0),
    topTags: Array.from(
      new Set(filteredArticles.flatMap(article => article.tags))
    ).slice(0, 5),
  };

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Category
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {categoryName}
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Explore the latest insights and trends in {categoryName.toLowerCase()}
                </p>
                
                {/* Category Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {categoryStats.totalArticles}
                    </div>
                    <div className="text-sm text-muted-foreground">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {categoryStats.totalReads}+
                    </div>
                    <div className="text-sm text-muted-foreground">Reads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {categoryStats.totalComments}
                    </div>
                    <div className="text-sm text-muted-foreground">Comments</div>
                  </div>
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryStats.topTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="space-y-4 mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles in this category..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CategoryFilter
                categories={categories}
                selectedCategory={categoryName}
                onCategoryChange={() => {}} // Disabled since we're in a specific category
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          {sortedArticles.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {sortedArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article}
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No articles found in {categoryName} matching your search criteria.
              </p>
              <Button onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}