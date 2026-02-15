"use client"

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageSquare, Hash, TrendingUp, Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";
import { Background } from "@/components/shared/Background";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage: string | null;
  publishedAt: string; // ISO string
  author: { name: string | null };
  category: { name: string; slug: string } | null;
};

type TrendingTopic = { name: string; posts?: string | number; followers?: string | number }
type RecentDiscussion = { title: string; author: string; replies: string | number; views: string | number; lastActivity: string; category: string; link?: string; date?: string; time?: string }
type UpcomingEvent = { title: string; date: string; time: string; location: string; attendees: string | number; type: string }
type FeaturedMember = { name: string; role: string; contributions: string | number; followers: string | number; expertise: string[] }

type CategoryOption = { slug: string; name: string }
type AuthorOption = { id: string; name: string; count: number }
type Pagination = { page: number; pageSize: number; total: number; totalPages: number }
type CurrentFilters = { category: string; role: 'ALL' | 'ADMIN' | string; author: string }

export default function CommunityClient({
  articles,
  trendingTopics = [],
  recentDiscussions = [],
  upcomingEvents = [],
  featuredMembers = [],
  categories = [],
  authors = [],
  pagination,
  currentFilters,
}: {
  articles: ArticleSummary[]
  trendingTopics?: TrendingTopic[]
  recentDiscussions?: RecentDiscussion[]
  upcomingEvents?: UpcomingEvent[]
  featuredMembers?: FeaturedMember[]
  categories?: CategoryOption[]
  authors?: AuthorOption[]
  pagination: Pagination
  currentFilters: CurrentFilters
}) {
  const {data: session} = useSession();
  const router = useRouter()
  const searchParams = useSearchParams()
  const formattedArticles = useMemo(() => {
    return articles.map((a) => ({
      ...a,
      displayDate: new Date(a.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  }, [articles]);
  const totalPages = pagination.totalPages;

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('page', String(Math.max(1, Math.min(totalPages, nextPage))))
    router.push(`/community?${params.toString()}`)
  }

  function renderPageNumbers() {
    const current = pagination.page
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('ellipsis')
      const start = Math.max(2, current - 1)
      const end = Math.min(totalPages - 1, current + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return (
      <div className="flex items-center gap-2">
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`el-${idx}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`h-9 px-3 rounded-md border ${p === current ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'} text-sm`}
            >
              {p}
            </button>
          )
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with background image */}
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
                Join Our Community
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Connect, Learn, and
                <span className="text-primary"> Grow Together</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of tech enthusiasts, developers, and industry experts 
                in our vibrant community. Share knowledge, network, and stay ahead 
                of the curve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/auth/signup">
                    Join Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#explore">Explore Topics</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </Background>
      </section>

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <section id="explore" className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trending Topics</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover what's hot in the tech community right now.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {trendingTopics.map((topic, index) => (
                <motion.div
                  key={topic.name + String(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-2 text-primary">
                          <Hash className="h-5 w-5" />
                          <span className="text-sm font-medium">Topic</span>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <h3 className="font-semibold text-lg mb-3">{topic.name}</h3>
                      <div className="flex items-center justify-between text-sm">
                        {topic.posts !== undefined && (
                          <Badge variant="outline">{topic.posts} posts</Badge>
                        )}
                        {topic.followers !== undefined && (
                          <Badge variant="outline">{topic.followers} followers</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Discussions */}
      {recentDiscussions.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Recent Discussions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join the conversation and share your expertise with the community.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {recentDiscussions.map((discussion, index) => {
                const dateTimeText = (() => {
                  if (discussion?.date) {
                    try {
                      const iso = `${discussion.date}${discussion.time ? `T${discussion.time}` : ''}`
                      const d = new Date(iso)
                      if (!isNaN(d.getTime())) {
                        const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        const timeStr = discussion.time ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
                        return timeStr ? `${dateStr} at ${timeStr}` : dateStr
                      }
                    } catch {}
                  }
                  return discussion.lastActivity
                })()
                const hasLink = typeof discussion.link === 'string' && discussion.link.trim().length > 0
                return (
                <motion.div
                  key={discussion.title + String(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span>by {discussion.author}</span>
                            <Badge variant="secondary">{discussion.category}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{discussion.replies} replies</span>
                            <span>{discussion.views} views</span>
                            <span>{dateTimeText}</span>
                          </div>
                        </div>
                        {hasLink && (
                          <a
                            href={discussion.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary text-sm hover:underline"
                          >
                            Join Discussion <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )})}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Upcoming Events</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our virtual and in-person events to learn and network with industry experts.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.title + String(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{event.type}</Badge>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees} attendees</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Members */}
      {featuredMembers.length > 0 && (
        <section className="pt-12 pb-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Featured Community Members</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet some of our most active and knowledgeable community contributors.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {featuredMembers.map((member, index) => (
                <motion.div
                  key={member.name + String(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center h-full min-h-[220px] hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge variant="secondary">{member.role}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Contributions</span>
                          <span className="font-medium">{member.contributions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Followers</span>
                          <span className="font-medium">{member.followers}</span>
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-xs text-left mb-2">Expertise</p>
                          <div className="flex flex-wrap gap-1">
                            {member.expertise.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {(!session || !session.user) && (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-shadow">
                <CardContent className="p-12">
                  <MessageSquare className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-6">
                    Ready to Join the Conversation?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Become part of our growing community of tech enthusiasts. Share your knowledge, 
                    learn from others, and help shape the future of technology.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <a href="/auth/signup">
                        Sign Up Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <a href="#explore">Explore Topics</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}