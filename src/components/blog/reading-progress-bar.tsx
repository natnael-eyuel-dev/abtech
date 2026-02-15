"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ReadingProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-muted">
      <div
        className={cn(
          "h-full bg-primary transition-all duration-150 ease-out",
          scrollProgress > 90 && "bg-green-500"
        )}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}