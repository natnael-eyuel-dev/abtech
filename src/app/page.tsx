"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArticleCard, type Article } from "@/components/blog/article-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { ABTECHLogo } from "@/components/shared/abtech-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Clock, Star, ArrowRight, Zap, Globe, Target, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { CourseCard, type Course } from "@/components/courses/course-card";
import RouteLoading from "./loading";
import { Background } from "@/components/shared/Background";

// Real data types
interface DbArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  featured: boolean;
  trending: boolean;
  premium: boolean;
  readTime: number;
  views: number;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    comments: number;
    likes: number;
  };
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "popular">("latest");
  const [searchQuery, setSearchQuery] = useState("");
  // Courses (for highlight)
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Fetch articles
        const articlesResponse = await fetch("/api/articles?limit=50");
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          setArticles(articlesData.articles);
        } else {
          setError("Failed to fetch articles");
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch courses for highlight (client-side)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/courses?limit=6', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.courses)) setCourses(data.courses);
        }
      } catch {}
    })();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <RouteLoading />
    )
  }

  // Get unique categories for filter, including "All"
  const categoryOptions = ["All", ...categories.map(cat => cat.name)];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
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

  const featuredArticles = articles.filter(article => article.featured);
  const trendingArticles = articles.filter(article => article.trending);

  // Calculate real stats
  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, article) => sum + ((article as any).views || 0), 0);
  const totalAuthors = new Set(articles.map(article => article.author.name)).size;

  return (
    <div className="min-h-screen">
      {/* Modern Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-muted/40"
      >
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,white,transparent)]" />
        <Background imageSrc = "/images/home-hero.png">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                <Badge variant="secondary" className="mb-5 flex items-center gap-1 mx-auto">
                  <Sparkles className="w-3 h-3" />
                  Elevate Your Tech Insight
                </Badge>
              </motion.div>
              <ABTECHLogo bottomMargin justify="center" />
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
              >
                Build Tomorrow with Clear Knowledge Today
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" className="group" onClick={() => window.location.href = '/courses'}>
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = '/blog'}>
                  Read Articles
                </Button>
              </motion.div>
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6 }}
                className="relative max-w-lg mx-auto mt-12"
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  className="pl-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            </div>
          </div>
        </Background>
      </motion.section>

      {/* Value Props */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[{
              icon: <Target className="h-5 w-5" />, title: 'Focused', body: 'We strip fluff. Every article and course is edited for clarity and direct applicability.'
            }, {
              icon: <ShieldCheck className="h-5 w-5" />, title: 'Credible', body: 'Content is peer-reviewed for technical accuracy and strategic relevance.'
            }, {
              icon: <BookOpen className="h-5 w-5" />, title: 'Structured', body: 'Courses break complex topics into digestible modules with practical assets.'
            }].map((p) => (
              <div key={p.title} className="rounded-xl border bg-card p-6 flex flex-col gap-3 hover:shadow-sm transition">
                <div className="flex items-center gap-2 text-primary">{p.icon}<span className="font-medium">{p.title}</span></div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="text-red-500 mb-4">⚠️ Error loading content</div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Articles */}
      {!error && featuredArticles.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="py-16 bg-muted/30"
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge variant="outline" className="mb-2">
                  <Star className="w-3 h-3 mr-1" />
                  Editor's Choice
                </Badge>
                <h2 className="text-3xl font-bold">Featured Articles</h2>
              </div>
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Trending Articles */}
      {!error && trendingArticles.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="py-16"
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge variant="outline" className="mb-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending Now
                </Badge>
                <h2 className="text-3xl font-bold">Trending Articles</h2>
              </div>
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Courses Highlight */}
      {courses && courses.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge variant="outline" className="mb-2"><BookOpen className="w-3 h-3 mr-1" /> Courses</Badge>
                <h2 className="text-3xl font-bold">Structured Learning Paths</h2>
                <p className="text-muted-foreground mt-1 text-sm">Practical multi-module deep dives with curated assets.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/courses'}>
                Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 4).map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      {!error && sortedArticles.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="py-16 bg-muted/30"
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Articles</h2>
                  <p className="text-muted-foreground">
                    {sortedArticles.length} article{sortedArticles.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div className="mb-8">
              <CategoryFilter
                categories={categoryOptions}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.5 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>

            {/* No results message */}
            {sortedArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </motion.section>
      )}
    </div>
  );
}