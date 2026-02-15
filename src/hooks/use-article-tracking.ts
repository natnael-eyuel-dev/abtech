"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface ArticleTracking {
  views: number;
  remainingArticles: number;
  hasReachedLimit: boolean;
  incrementView: () => void;
  resetViews: () => void;
}

export function useArticleTracking(): ArticleTracking {
  const { data: session } = useSession();
  const [views, setViews] = useState(0);

  useEffect(() => {
    // Load article views from cookies on component mount
    const loadViews = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('article_views='))
        ?.split('=')[1];
      
      const savedViews = parseInt(cookieValue || '0');
      setViews(savedViews);
    };

    loadViews();

    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'article_views') {
        loadViews();
      }
    };

    // Custom event used when server updates the cookie via Set-Cookie.
    const handleUpdated = () => loadViews();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('articleViewsUpdated', handleUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('articleViewsUpdated', handleUpdated);
    };
  }, []);

  const getArticleLimit = () => {
    const userRole = String(session?.user?.role ?? 'ANONYMOUS');

    switch (userRole) {
      case 'PREMIUM_USER':
        return -1; // Unlimited
      case 'FREE_USER':
      case 'AUTHOR':
        return 15;
      default:
        return 3;
    }
  };

  const limit = getArticleLimit();
  const remainingArticles = limit === -1 ? -1 : Math.max(0, limit - views);
  const hasReachedLimit = limit !== -1 && views >= limit;

  const incrementView = () => {
    if (hasReachedLimit) return;
    
    const newViews = views + 1;
    setViews(newViews);
    
    // Update cookie
    document.cookie = `article_views=${newViews}; path=/; max-age=${30 * 24 * 60 * 60}; secure=${process.env.NODE_ENV === 'production'}; sameSite=lax`;
    
    // Dispatch custom event for cross-tab communication
    window.dispatchEvent(new CustomEvent('articleViewIncremented', { 
      detail: { views: newViews } 
    }));
  };

  const resetViews = () => {
    setViews(0);
    document.cookie = 'article_views=0; path=/; max-age=0';
    window.dispatchEvent(new CustomEvent('articleViewsReset'));
  };

  return {
    views,
    remainingArticles,
    hasReachedLimit,
    incrementView,
    resetViews,
  };
}