"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  User, 
  Heart, 
  MessageCircle, 
  Share2, 
  ArrowLeft,
  Calendar,
  Tag,
  Crown
} from "lucide-react";
import { ArticleCard, type Article } from "@/components/blog/article-card";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { ShareButtons } from "@/components/blog/share-buttons";
import { Paywall } from "@/components/content/paywall";
import { AccessIndicator } from "@/components/content/access-indicator";
import { useArticleTracking } from "@/hooks/use-article-tracking";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Menu } from "lucide-react";
import RouteLoading from "./loading";

interface ArticlePageProps {
  params: any;
}

type ApiLockReason =
  | 'none'
  | 'authentication_required'
  | 'premium_required'
  | 'limit_reached'
  | 'upgrade_required';

export default function ArticlePage({ params }: ArticlePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { views, remainingArticles } = useArticleTracking();
  const { data: session } = useSession();
  const [canAccessContent, setCanAccessContent] = useState(true);
  const [accessReason, setAccessReason] = useState<'none' | 'authentication_required' | 'premium_required' | 'limit_reached' | 'upgrade_required'>('none');
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setIsLoading(true);
        const response = await fetch(`/api/articles/by-slug/${params.id}`);
        if (response.ok) {
          const articleData = await response.json();
          setArticle(articleData);
          // Server may update article_views cookie; notify tracking hooks to re-read it.
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("articleViewsUpdated"));
          }
          
          // Parse headings from content
          const headingRegex = /^(#{1,6})\s+(.+)$/gm;
          const matches = [...articleData.content.matchAll(headingRegex)];
          const tocItems = matches.map((match, index) => {
            const level = match[1].length;
            const text = match[2].trim();
            const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return { id, text, level };
          });
          setHeadings(tocItems);
          
          // Fetch related articles
          const relatedResponse = await fetch(`/api/articles?limit=3&exclude=${params.id}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedArticles(relatedData.articles || []);
          }
        } else {
          setError("Article not found");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        setError("Failed to load article");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  useEffect(() => {
    // Set up intersection observer to track active heading
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveHeading(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all heading elements
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsTocOpen(false);
    }
  };

  useEffect(() => {
    if (!article) return;

  // Check content access (coerce to string to avoid narrow enum typing issues)
  const userRole = (session?.user?.role as string) || 'ANONYMOUS';
    
    let hasAccess = true;
    let reason: 'none' | 'authentication_required' | 'premium_required' | 'limit_reached' | 'upgrade_required' = 'none';

    // If API already marked it as locked, trust that immediately (avoids blank-content flicker).
    const apiLocked = Boolean((article as any)?.locked);
    const apiReason = String((article as any)?.lockReason || 'none') as ApiLockReason;
    if (apiLocked && apiReason !== 'none') {
      setCanAccessContent(false);
      setAccessReason(apiReason);
      return;
    }
    
    // Premium users can access everything
    if (userRole === 'PREMIUM_USER' || userRole === 'ADMIN') {
      hasAccess = true;
    } else if (article.isPremium && userRole === 'ANONYMOUS') {
      hasAccess = false;
      reason = 'authentication_required';
    } else if (article.isPremium && userRole !== 'PREMIUM_USER') {
      hasAccess = false;
      reason = 'premium_required';
    } else {
      // Check article view limits
      const limit = userRole === 'FREE_USER' || userRole === 'AUTHOR' ? 15 : 3;
      if (views >= limit) {
        hasAccess = false;
        reason = userRole === 'FREE_USER' || userRole === 'AUTHOR' ? 'upgrade_required' : 'limit_reached';
      }
    }
    
    setCanAccessContent(hasAccess);
    setAccessReason(reason);
  }, [article, session, views]);

  // Show loading state
  if (isLoading) {
    return (
      <RouteLoading />
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <ReadingProgressBar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ReadingProgressBar />
      
      {/* Mobile TOC Button */}
      {headings.length > 0 && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsTocOpen(!isTocOpen)}
            size="lg"
            className="rounded-full shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mobile TOC Sidebar */}
      {isTocOpen && headings.length > 0 && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Table of Contents</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTocOpen(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
              <div className="p-4">
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToHeading(heading.id)}
                      className={`w-full text-left transition-all duration-200 rounded-md px-3 py-2 text-sm group ${
                        activeHeading === heading.id
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={`h-3 w-3 transition-transform duration-200 ${
                            activeHeading === heading.id ? 'text-primary' : 'opacity-0 group-hover:opacity-50'
                          }`}
                        />
                        <span className="truncate">{heading.text}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl flex gap-8">
        {/* Main Content */}
        <article className="flex-1 max-w-4xl">
          {/* Access Indicator - Text style for subtle integration */}
          <div className="mb-4 text-right">
            <AccessIndicator className="text" />
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              {article.featured && (
                <Badge variant="default">Featured</Badge>
              )}
              {article.trending && (
                <Badge variant="destructive">Trending</Badge>
              )}
              {article.isPremium && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={article.author.avatar} alt={article.author.name} />
                  <AvatarFallback>
                    {article.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{article.author.name}</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{article.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{article.comments}</span>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <div className="relative h-64 md:h-96 mt-6 rounded-lg overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Content or Paywall */}
          {canAccessContent ? (
            <>
              {/* Article Content */}
              <div className="mb-12">
                <MarkdownRenderer content={article.content} />
              </div>

              {/* Tags */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share this article
                </h3>
                <ShareButtons
                  title={article.title}
                  excerpt={article.excerpt}
                  url={`/article/${article.id}`}
                />
              </div>

              {/* Author Bio */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={article.author.avatar} alt={article.author.name} />
                      <AvatarFallback className="text-lg">
                        {article.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{article.author.name}</h3>
                      <p className="text-muted-foreground">
                        Tech enthusiast and AI researcher with over 10 years of experience in machine learning and software development.
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Related Articles */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <ArticleCard 
                      key={relatedArticle.id} 
                      article={relatedArticle} 
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <Paywall 
              reason={accessReason as any}
              previewContent={getPreviewContent(article, accessReason)}
              remainingArticles={remainingArticles}
              articleTitle={article.title}
            />
          )}
        </article>

        {/* Desktop TOC Sidebar */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-64">
            <div className="sticky top-24">
              <div className="w-64">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Table of Contents
                </h3>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <nav className="space-y-1">
                    {headings.map((heading) => (
                      <button
                        key={heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`w-full text-left transition-all duration-200 rounded-md px-3 py-2 text-sm group ${
                          activeHeading === heading.id
                            ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`h-3 w-3 transition-transform duration-200 ${
                              activeHeading === heading.id ? 'text-primary' : 'opacity-0 group-hover:opacity-50'
                            }`}
                          />
                          <span className="truncate">{heading.text}</span>
                        </div>
                      </button>
                    ))}
                  </nav>
                </ScrollArea>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function getPreviewContent(article: Article, reason: string): string {
  if (reason === 'premium_required') {
    return `This premium article contains exclusive analysis and insights that are only available to our premium members. Upgrade now to unlock the full content and gain access to our complete library of premium articles.`;
  } else if (reason === 'authentication_required') {
    return `This article requires a free account. Sign up now to get access to 15 free articles per month, plus the ability to save articles, comment, and receive personalized recommendations.`;
  } else if (reason === 'limit_reached' || reason === 'upgrade_required') {
    return `You've reached your monthly article limit. Upgrade to premium for unlimited access to all articles, exclusive content, and an ad-free experience.`;
  }
  return '';
}