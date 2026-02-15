"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CommunityClient from "./CommunityClient";
import CommunityLoading from "./loading";

export default function CommunityPage() {
  const searchParams = useSearchParams();

  const page = useMemo(() => {
    const raw = searchParams?.get('page') || '1';
    return Math.max(1, parseInt(raw || '1'));
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const raw = searchParams?.get('pageSize') || '10';
    return Math.min(24, Math.max(6, parseInt(raw || '10')));
  }, [searchParams]);

  const category = useMemo(() => searchParams?.get('category') || '', [searchParams]);
  const role = useMemo(() => searchParams?.get('role') || 'ALL', [searchParams]);
  const author = useMemo(() => searchParams?.get('author') || '', [searchParams]);

  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string; count: number }[]>([]);
  const [sections, setSections] = useState<{ [k: string]: any[] }>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(pageSize));
        params.set('published', 'true');
        if (category) params.set('category', category);
        if (author) params.set('authorId', author);
        if (role === 'ADMIN') params.set('authorRole', 'ADMIN');

        const [aRes, cRes, sRes, auRes] = await Promise.all([
          fetch('/api/articles?' + params.toString()),
          fetch('/api/categories'),
          fetch('/api/community/sections'),
          fetch('/api/articles/authors?published=true'),
        ]);
        if (!cancelled) {
          const aJson = await aRes.json();
          const cJson = await cRes.json();
          const sJson = await sRes.json();
          const auJson = await auRes.json();

          const mappedArticles = (aJson.articles || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt ?? '',
            publishedAt: new Date(a.publishedAt).toISOString(),
            coverImage: a.coverImage ?? null,
            author: { name: a.author?.name ?? 'Unknown' },
            category: a.category ? { name: a.category, slug: a.categorySlug || '' } : null,
          }));
          setArticles(mappedArticles);
          setTotal(aJson.pagination?.total ?? 0);

          setCategories((cJson || []).map((c: any) => ({ slug: c.slug, name: c.name })));
          setSections(sJson || {});
          setAuthors((auJson || []).map((u: any) => ({ id: String(u.id), name: u.name || 'Unknown', count: Number(u.count || 0) })));
        }
      } catch (e) {
        // Optional: surface via toast or inline error UI if desired
        console.error('Failed to load community data', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, [page, pageSize, category, role, searchParams]);

  if (isLoading) return <CommunityLoading />;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filters: any = { category: category || '', role, author: author || '' };

  return (
    <CommunityClient
      articles={articles}
      trendingTopics={sections.trendingTopics ?? []}
      recentDiscussions={sections.recentDiscussions ?? []}
      upcomingEvents={sections.upcomingEvents ?? []}
      featuredMembers={sections.featuredMembers ?? []}
      categories={categories}
      authors={authors}
      pagination={{ page, pageSize, total, totalPages }}
      currentFilters={filters}
    />
  );
}

