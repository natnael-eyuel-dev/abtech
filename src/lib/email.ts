import nodemailer from "nodemailer";
import { db } from "@/lib/db";

type SendEmailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

const parseBool = (v: string | undefined) => /^(1|true|yes|on)$/i.test(String(v || ""));

async function getSmtpConfig() {
  // 1) Prefer environment variables when fully provided
  const envHost = process.env.SMTP_HOST;
  const envPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const envUser = process.env.SMTP_USER;
  const envPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const envFrom = process.env.SENDER_EMAIL || envUser;
  if (envHost && envPort && envUser && envPass) {
    // Log chosen source and essential params (no secrets)
    if (parseBool(process.env.SMTP_DEBUG)) {
      console.info("[email] Using SMTP config from ENV", {
        host: envHost,
        port: envPort,
        secureDefault: envPort === 465,
        userSet: Boolean(envUser),
        from: envFrom,
      });
    }
    return {
      host: envHost,
      port: envPort,
      secure: envPort === 465,
      auth: { user: envUser, pass: envPass },
      defaultFrom: envFrom || envUser,
    } as const;
  }

  // 2) Fall back to DB settings
  try {
    const settings = await db.setting.findFirst();
    if (settings?.smtpHost && settings?.smtpPort && settings?.smtpUser && settings?.smtpPassword) {
      if (parseBool(process.env.SMTP_DEBUG)) {
        console.info("[email] Using SMTP config from DB Setting", {
          host: settings.smtpHost,
          port: settings.smtpPort,
          secureDefault: settings.smtpPort === 465,
          userSet: Boolean(settings.smtpUser),
          from: settings.senderEmail || settings.smtpUser,
        });
      }
      return {
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpPort === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword,
        },
        defaultFrom: settings.senderEmail || settings.smtpUser,
      } as const;
    }
  } catch {}

  return null;
}

export async function sendEmail(opts: SendEmailOptions) {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    // In dev, gracefully no-op and log
    if (process.env.NODE_ENV !== "production") {
      const dbg = parseBool(process.env.SMTP_DEBUG);
      console.log("[email] SMTP not configured; printing email instead:");
      console.log({ to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
      if (dbg) {
        console.warn("[email] Missing SMTP config details", {
          hasHost: Boolean(process.env.SMTP_HOST),
          hasPort: Boolean(process.env.SMTP_PORT),
          hasUser: Boolean(process.env.SMTP_USER),
          hasPass: Boolean(process.env.SMTP_PASSWORD || process.env.SMTP_PASS),
        });
      }
      return { accepted: [opts.to], previewOnly: true };
    }
    throw new Error("SMTP is not configured. Set it in Settings or environment variables.");
  }

  // Optional env flags for tricky SMTP setups (self-signed certs, STARTTLS, etc.)
  const secureOverride = process.env.SMTP_SECURE ? parseBool(process.env.SMTP_SECURE) : undefined;
  const ignoreTLS = parseBool(process.env.SMTP_IGNORE_TLS);
  const requireTLS = parseBool(process.env.SMTP_REQUIRE_TLS);
  const allowSelfSigned = parseBool(process.env.SMTP_ALLOW_SELF_SIGNED);
  const debug = parseBool(process.env.SMTP_DEBUG);

  if (debug) {
    console.info("[email] SMTP flags", {
      host: cfg.host,
      port: cfg.port,
      secureDefault: cfg.secure,
      secureOverride: secureOverride ?? null,
      ignoreTLS,
      requireTLS,
      allowSelfSigned,
      debug,
    });
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: secureOverride ?? cfg.secure,
    auth: cfg.auth,
    ignoreTLS: ignoreTLS || undefined,
    requireTLS: requireTLS || undefined,
    tls: allowSelfSigned ? { rejectUnauthorized: false } : undefined,
    logger: debug || undefined,
    debug: debug || undefined,
  });

  const from = opts.from || cfg.defaultFrom || cfg.auth.user;

  // Optional verify step to catch TLS/connection issues with richer error
  if (debug) {
    try {
      await transporter.verify();
      console.info("[email] SMTP verify succeeded");
    } catch (e: any) {
      console.error("[email] SMTP verify failed", {
        message: e?.message,
        code: e?.code,
        command: e?.command,
        response: e?.response,
        responseCode: e?.responseCode,
        stack: e?.stack,
      });
      // Continue to attempt send; verify is diagnostic-only
    }
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    if (debug) {
      console.info("[email] sendMail ok", {
        messageId: (info as any)?.messageId,
        accepted: (info as any)?.accepted,
        rejected: (info as any)?.rejected,
        pending: (info as any)?.pending,
        response: (info as any)?.response,
      });
    }
    return info;
  } catch (e: any) {
    console.error("[email] sendMail failed", {
      to: opts.to,
      subject: opts.subject,
      code: e?.code,
      command: e?.command,
      response: e?.response,
      responseCode: e?.responseCode,
      message: e?.message,
      stack: e?.stack,
    });
    throw e;
  }
}

export function buildAbsoluteUrl(path: string) {
  // Attempt to construct a reasonable absolute URL for emails
  const hostname = process.env.HOSTNAME || "localhost";
  const port = process.env.NEXT_PUBLIC_FRONTEND_PORT || process.env.PORT || "3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${protocol}://${hostname}${port ? `:${port}` : ""}${normalizedPath}`;
  if (parseBool(process.env.SMTP_DEBUG)) {
    console.info("[email] buildAbsoluteUrl", { url, hostname, port, protocol, path });
  }
  return url;
}
