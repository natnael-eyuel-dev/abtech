"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleCard, type Article } from "@/components/blog/article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  Heart,
  Grid,
  List,
  X,
  ArrowLeft
} from "lucide-react";
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "popular">("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const allTags = Array.from(new Set(sampleArticles.flatMap(article => article.tags)));

  const filteredArticles = sampleArticles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => article.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
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

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedTags([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedTags.length > 0 || searchQuery;

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Search Articles
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find exactly what you're looking for from our collection of tech articles, tutorials, and insights.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles, authors, topics, or tags..."
                  className="pl-12 h-14 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {filteredArticles.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Results</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {allTags.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tags</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Filters and Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </h3>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === "all" ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory("all")}
                      >
                        All Categories
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <h4 className="font-medium mb-3">Popular Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 12).map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="bg-card p-6 rounded-lg">
                    <h4 className="font-medium mb-3">Active Filters</h4>
                    <div className="space-y-2">
                      {searchQuery && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Search: "{searchQuery}"</span>
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setSearchQuery("")}
                          />
                        </div>
                      )}
                      {selectedCategory !== "all" && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Category: {selectedCategory}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setSelectedCategory("all")}
                          />
                        </div>
                      )}
                      {selectedTags.map((tag) => (
                        <div key={tag} className="flex items-center justify-between">
                          <span className="text-sm">Tag: #{tag}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleTagToggle(tag)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="lg:w-3/4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {filteredArticles.length} Search Results
                  </h2>
                  <p className="text-muted-foreground">
                    {searchQuery && `Showing results for "${searchQuery}"`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="latest">
                      <Clock className="h-4 w-4 mr-2" />
                      Latest
                    </option>
                    <option value="trending">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trending
                    </option>
                    <option value="popular">
                      <Heart className="h-4 w-4 mr-2" />
                      Most Popular
                    </option>
                  </select>

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
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
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
                    No articles found matching your search criteria.
                  </p>
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}