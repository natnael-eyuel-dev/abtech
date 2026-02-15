"use client"

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/shared/Background";
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Mail,
  Search,
  ArrowRight,
  ExternalLink,
  Video,
  FileText,
  Users
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

type HelpCategoryArticle = string | { title: string; link?: string };
type HelpCategory = { icon?: string; title: string; description?: string; articles: HelpCategoryArticle[] };
type PopularArticle = { title: string; category: string; views?: string; link?: string };
type VideoTutorial = { title: string; duration: string; link?: string };

const iconMap: Record<string, React.ComponentType<any>> = {
  BookOpen,
  Users,
  MessageSquare,
  Mail,
  FileText,
  Video,
};

export default function HelpCenterClient() {
  const [helpCategories, setHelpCategories] = useState<HelpCategory[]>([]);

  const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([]);

  const [videoTutorials, setVideoTutorials] = useState<VideoTutorial[]>([]);
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});

  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/help/sections');
        const json = await res.json();
        if (cancelled) return;
        if (Array.isArray(json.categories)) {
          // categories icon names may be strings; map to components
          const mapped = json.categories.map((c: any) => ({
            ...c,
            icon: c.icon && iconMap[c.icon] ? iconMap[c.icon] : BookOpen,
          }));
          setHelpCategories(mapped);
        }
        if (Array.isArray(json.popularArticles)) setPopularArticles(json.popularArticles);
        if (Array.isArray(json.videoTutorials)) setVideoTutorials(json.videoTutorials);
      } catch (e) {
        console.error('Failed to load help sections', e);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  // Helpers
  function slugify(str: string): string {
    return (str || "")
      .toString()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    try {
      // Common patterns: https://www.youtube.com/watch?v=ID, https://youtu.be/ID, embed URLs
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return id;
        // /embed/ID pattern
        const m = u.pathname.match(/\/embed\/([^/?#]+)/);
        if (m) return m[1];
      }
      if (u.hostname.includes("youtu.be")) {
        const m = u.pathname.match(/\/([^/?#]+)/);
        return m ? m[1] : null;
      }
    } catch {}
    return null;
  }

  function youtubeEmbedUrl(id: string): string {
    return `https://www.youtube.com/embed/${id}`;
  }

  function youtubeThumbUrl(id: string): string {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative">
        <Background overlayOpacity={0.6}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge variant="secondary" className="mb-4">
                Help Center
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How can we
                <span className="text-primary"> help you?</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find answers, get support, and learn how to make the most of our platform.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-12 h-12 text-base"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </motion.div>
            <div className="container mx-auto px-4 pt-12">
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" asChild>
                  <a href="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/community">
                    <Users className="mr-2 h-4 w-4" />
                    Community Forum
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/docs">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Documentation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Background>
      </section>

      {/* Help Categories */}
      <section className="pb-12 pt-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Browse by Category</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find help articles organized by topic to quickly get the answers you need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {helpCategories
              .filter((c) => {
                if (!q) return true;
                const t = q.toLowerCase();
                return (
                  c.title.toLowerCase().includes(t) ||
                  (c.description || '').toLowerCase().includes(t) ||
                  c.articles.some((a: any) => {
                    const title = typeof a === 'string' ? a : a?.title || ''
                    return title.toLowerCase().includes(t)
                  })
                );
              })
              .map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {(() => {
                          const Icon = (category.icon as any) || BookOpen;
                          return <Icon className="h-6 w-6 text-primary" />;
                        })()}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          <a href={`/category/${slugify(category.title)}`} className="hover:underline">
                            {category.title}
                          </a>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                       {category.articles.map((article: any, idx: number) => {
                         const title = typeof article === 'string' ? article : article?.title;
                         const linkFromObj = typeof article === 'object' ? (article?.link || '') : '';
                         const href = linkFromObj || (title ? `/article/${slugify(title)}` : '#');
                         return (
                           <li key={idx}>
                             <a
                               href={href}
                               className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                             >
                               <Badge variant="outline" className="min-w-6 h-5 px-2 flex items-center justify-center">#{idx + 1}</Badge>
                               <FileText className="h-3 w-3 flex-shrink-0" />
                               <span className="truncate">{title}</span>
                               <ArrowRight className="h-3 w-3 flex-shrink-0 ml-auto" />
                             </a>
                           </li>
                         );
                       })}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Popular Articles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most-viewed help articles from our community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {popularArticles
              .filter((a) => (q ? a.title.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase()) : true))
              .map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <a href={(article as any).link || `/article/${slugify(article.title)}`} className="block">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                            <span>{article.views} views</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Video Tutorials</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch step-by-step video guides to learn our platform features.
            </p>
          </motion.div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {videoTutorials
              .filter((v) => (q ? v.title.toLowerCase().includes(q.toLowerCase()) : true))
              .map((video, index) => (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {(() => {
                      const ytId = extractYouTubeId((video as any).link);
                      const isYouTube = !!ytId;
                      const playing = !!playingVideos[index];
                      return (
                        <div className="block">
                          <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
                            {isYouTube ? (
                              playing ? (
                                <iframe
                                  className="w-full h-full"
                                  src={youtubeEmbedUrl(ytId!)}
                                  title={video.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="w-full h-full relative group"
                                  onClick={() => setPlayingVideos((prev) => ({ ...prev, [index]: true }))}
                                  aria-label={`Play ${video.title}`}
                                >
                                  <img
                                    src={youtubeThumbUrl(ytId!)}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-14 w-14 rounded-full bg-white/90 group-hover:bg-white shadow flex items-center justify-center">
                                      <svg viewBox="0 0 24 24" className="h-7 w-7 text-black" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
                                    </div>
                                  </div>
                                </button>
                              )
                            ) : (
                              <a href={(video as any).link || '#'} className="w-full h-full flex items-center justify-center">
                                <Video className="h-12 w-12 text-muted-foreground" />
                              </a>
                            )}
                          </div>
                          <h3 className="font-semibold mb-2">{video.title}</h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{video.duration}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="pt-12 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-shadow">
              <CardContent className="p-12">
                <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-6">Still Need Help?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you 
                  with any questions or issues you might have.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/community">
                      <Users className="mr-2 h-4 w-4" />
                      Ask Community
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}