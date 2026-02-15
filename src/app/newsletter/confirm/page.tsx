"use client";

import { useEffect, useState } from "react";

export default function NewsletterConfirmPage({ searchParams }: { searchParams: any }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams?.token;
    if (!token) {
      setStatus("error");
      setMessage("Missing confirmation token.");
      return;
    }
    setStatus("loading");
    fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          setStatus("success");
          setMessage(data?.message || "Subscription confirmed.");
          try {
            if (data?.email) {
              localStorage.setItem("abtech:newsletter:email", data.email);
              localStorage.setItem("abtech:newsletter:status", "verified");
            }
          } catch {}
        } else {
          setStatus("error");
          setMessage(data?.message || "Invalid or expired token.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [searchParams?.token]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      {status === "loading" && <p className="text-muted-foreground">Confirming your subscription…</p>}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-semibold">You're all set!</h1>
          <p className="text-muted-foreground">{message}</p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-semibold">We couldn't confirm that</h1>
          <p className="text-muted-foreground">{message}</p>
        </>
      )}
    </div>
  );
}
