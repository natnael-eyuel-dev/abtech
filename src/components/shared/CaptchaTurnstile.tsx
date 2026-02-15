"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, opts: any) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      ready: (cb: () => void) => void;
    };
    __turnstileReadyPromise?: Promise<void>;
    __turnstileReadyResolve?: () => void;
    [key: string]: any;
  }
}

export function CaptchaTurnstile({ onToken, className }: { onToken: (token: string | null) => void; className?: string }) {
  const id = useId().replace(/[:]/g, "");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const cbName = `onTurnstileVerify_${id}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!siteKey) {
      onToken(null);
      return;
    }

    // Prepare global callback used by Turnstile
    (window as any)[cbName] = (token: string) => {
      onToken(token);
    };

    // Ensure script is present only once and create a global ready promise
    const ensureScript = () => {
      if (window.turnstile) {
        return Promise.resolve();
      }
      if (!window.__turnstileReadyPromise) {
        window.__turnstileReadyPromise = new Promise<void>((resolve) => {
          window.__turnstileReadyResolve = resolve;
        });
        const existing = document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]') as HTMLScriptElement | null;

        const resolveWhenAvailable = () => {
          if (window.turnstile) {
            window.__turnstileReadyResolve?.();
            return;
          }
          const id = window.setInterval(() => {
            if (window.turnstile) {
              window.__turnstileReadyResolve?.();
              window.clearInterval(id);
            }
          }, 50);
        };

        if (!existing) {
          const s = document.createElement("script");
          s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          s.async = true;
          s.defer = true;
          s.onload = () => window.__turnstileReadyResolve?.();
          s.onerror = () => {
            // Resolve to avoid hanging; widget render may still fail gracefully
            window.__turnstileReadyResolve?.();
          };
          document.head.appendChild(s);
          // As a fallback, poll for availability too
          resolveWhenAvailable();
        } else {
          // Script tag exists; wait for load and/or poll for global
          existing.addEventListener('load', () => window.__turnstileReadyResolve?.(), { once: true });
          resolveWhenAvailable();
        }
      }
      return window.__turnstileReadyPromise as Promise<void>;
    };

    let cancelled = false;
    setFailed(false);
    ensureScript().then(() => {
      if (cancelled) return;
      if (!containerRef.current) return;
      // Clean any inner content to avoid stacking
      containerRef.current.innerHTML = "";
      try {
        widgetIdRef.current = window.turnstile?.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => (window as any)[cbName]?.(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
          retry: "auto",
          appearance: "always",
          theme: "light",
          size: "normal",
        });
        // If render didn't return an id, mark as failed (likely blocked by extension)
        if (!widgetIdRef.current) {
          setFailed(true);
        }
      } catch {
        // Ignore; widget may not render if blocked
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = undefined;
        }
      } catch {}
      try { delete (window as any)[cbName]; } catch {}
    };
  }, [cbName, onToken, siteKey, attempt]);

  if (!siteKey) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className={className}>
          <div style={{
            minWidth: 200,
            minHeight: 50,
            border: '1px dashed var(--border)',
            color: 'var(--muted-foreground)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            Captcha disabled: missing NEXT_PUBLIC_TURNSTILE_SITE_KEY
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className}>
      <div ref={containerRef} style={{ minWidth: 200, minHeight: 50, position: 'relative', zIndex: 1 }} />
      {failed && (
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
          Captcha failed to load. It may be blocked by an extension.
          <button
            type="button"
            onClick={() => setAttempt(a => a + 1)}
            style={{ marginLeft: 8, textDecoration: 'underline' }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
