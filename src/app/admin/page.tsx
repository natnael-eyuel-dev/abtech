"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Settings,
  HelpCircle,
  Contact,
  Briefcase,
  DollarSignIcon,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/shared/PageHero";

interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalViews: number;
  recentArticles: Array<{
    id: string;
    title: string;
    views: number;
    publishedAt: string;
  }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    totalUsers: 0,
    totalViews: 0,
    recentArticles: [],
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        badge="admin"
        title="Admin Dashboard"
        subtitle={`Welcome back, ${session.user?.name ?? ''}`}
        imageSrc="/images/hero.png"
        overlayOpacity={0.35}
        actions={
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/community">
                <Users className="mr-2 h-4 w-4" />
                Community
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help 
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/contact">
                <Contact className="mr-2 h-4 w-4" />
                Contact
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/pricing">
                <DollarSignIcon className="mr-2 h-4 w-4" />
                Pricing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Courses
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Responsive two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Stats + Recent */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Overview */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Articles
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
              </section>

              {/* Recent Articles */}
              <section>
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Articles</CardTitle>
                      <CardDescription>
                        Your latest published articles
                      </CardDescription>
                    </div>
                    <Button variant="outline" asChild size="sm">
                      <Link href="/admin/articles">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recentArticles.length > 0 ? (
                        stats.recentArticles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-center justify-between rounded-md border p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/articles/${article.id}`)
                              }
                            >
                              <h3 className="font-medium">{article.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {new Date(article.publishedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {article.views}
                              </div>
                              <Badge variant="outline">Published</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-sm text-muted-foreground">
                          No articles yet. Create your first article to get started.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Right: Quick actions & shortcuts */}
            <div className="space-y-8 lg:sticky lg:top-24 self-start">
              {/* Quick Actions */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <Link href="/admin/articles/new">
                      <CardHeader>
                        <Plus className="h-6 w-6 text-primary mb-2" />
                        <CardTitle className="text-base">New Article</CardTitle>
                        <CardDescription>
                          Create a new blog article
                        </CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <Link href="/admin/articles">
                      <CardHeader>
                        <FileText className="h-6 w-6 text-primary mb-2" />
                        <CardTitle className="text-base">Manage Articles</CardTitle>
                        <CardDescription>Edit and publish articles</CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <Link href="/admin/categories">
                      <CardHeader>
                        <TrendingUp className="h-6 w-6 text-primary mb-2" />
                        <CardTitle className="text-base">Categories</CardTitle>
                        <CardDescription>
                          Manage article categories
                        </CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                </div>
              </section>

              {/* Management Links */}
              <section>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Management</CardTitle>
                    <CardDescription>Frequently used areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/admin/courses"><BookOpen className="mr-2 h-4 w-4" /> Courses</Link>
                      </Button>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/admin/pricing"><DollarSignIcon className="mr-2 h-4 w-4" /> Pricing</Link>
                      </Button>
                      <Button variant="outline" className="justify-start" asChild>
                        <Link href="/admin/community"><Users className="mr-2 h-4 w-4" /> Community</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
