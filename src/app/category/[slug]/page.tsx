"use client";

import { useState, useEffect } from "react";
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

interface CategoryPageProps {
  params: any;
  searchParams: any;
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categorySlug = params.slug;
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "popular">(searchParams.sort || "latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles by category from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiParams = new URLSearchParams();
        apiParams.set("category", categorySlug);
        if (searchQuery) apiParams.set("search", searchQuery);
        apiParams.set("limit", "100");

        const response = await fetch(`/api/articles?${apiParams.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch articles");
        
        const data = await response.json();
        const fetchedArticles = data.articles || [];

        if (fetchedArticles.length > 0) {
          setCategoryName(fetchedArticles[0].category);
        } else {
          // Try to fetch category info separately
          const catResponse = await fetch(`/api/categories`);
          if (catResponse.ok) {
            const cats = await catResponse.json();
            const cat = cats.find((c: any) => c.slug === categorySlug);
            if (cat) {
              setCategoryName(cat.name);
            } else {
              notFound();
            }
          } else {
            notFound();
          }
        }

        setArticles(fetchedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load articles");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [categorySlug, searchQuery]);

  const sortedArticles = [...articles].sort((a, b) => {
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
    totalArticles: articles.length,
    totalReads: articles.reduce((sum, article) => sum + article.likes, 0),
    totalComments: articles.reduce((sum, article) => sum + article.comments, 0),
    topTags: Array.from(
      new Set(articles.flatMap(article => article.tags))
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
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {loading ? "Loading..." : `${articles.length} article${articles.length !== 1 ? 's' : ''} found`}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : sortedArticles.length > 0 ? (
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