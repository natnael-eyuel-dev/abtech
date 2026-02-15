'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroBackgroundProps {
  imageSrc?: string;
  className?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function Background({
  imageSrc = "/images/hero.png",
  className,
  overlayOpacity = 0.45,
  children,
}: HeroBackgroundProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden py-20 flex items-center justify-center text-center',
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt="Tech Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Overlay for Contrast */}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-br from-background/60 via-background/40 to-background/70 backdrop-blur-[2px]"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />

      {/* Subtle Glow Overlay */}
  <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_30%_40%,theme(colors.primary/15),transparent_60%),radial-gradient(circle_at_70%_60%,theme(colors.secondary/15),transparent_60%)]" />

      {/* Foreground Content */}
      <div className="relative z-30 px-4">{children}</div>
    </section>
  );
}
