import { db } from "@/lib/db";
import { randomBytes } from "crypto";
const debug = /^(1|true|yes|on)$/i.test(String(process.env.SMTP_DEBUG || ""));

export type EmailTokenPurpose =
  | "newsletter-confirm"
  | "newsletter-unsubscribe"
  | "generic";

function tokenExpiry(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function buildIdentifier(email: string, purpose: EmailTokenPurpose) {
  return `${purpose}:${email.toLowerCase()}`;
}

export async function createEmailToken(email: string, purpose: EmailTokenPurpose, hoursValid = 24) {
  const token = randomBytes(32).toString("hex");
  const identifier = buildIdentifier(email, purpose);
  // Cleanup any previous tokens for the same identifier
  await db.verificationToken.deleteMany({ where: { identifier } }).catch(() => {});
  const vt = await db.verificationToken.create({
    data: {
      identifier,
      token,
      expires: tokenExpiry(hoursValid),
    },
  });
  if (debug) {
    console.info("[email-token] created", { purpose, email: email.toLowerCase(), expires: vt.expires.toISOString() });
  }
  return vt.token;
}

export async function verifyEmailToken(token: string, expectedPurpose?: EmailTokenPurpose) {
  const vt = await db.verificationToken.findUnique({ where: { token } });
  if (!vt) return { ok: false as const, reason: "invalid" as const };
  if (vt.expires < new Date()) {
    // expired; cleanup
    await db.verificationToken.delete({ where: { token } }).catch(() => {});
    if (debug) console.warn("[email-token] expired", { token });
    return { ok: false as const, reason: "expired" as const };
  }
  const [purpose, email] = vt.identifier.split(":", 2);
  if (expectedPurpose && purpose !== expectedPurpose) {
    if (debug) console.warn("[email-token] purpose mismatch", { expectedPurpose, got: purpose });
    return { ok: false as const, reason: "mismatch" as const };
  }
  return { ok: true as const, purpose: purpose as EmailTokenPurpose, email };
}

export async function consumeEmailToken(token: string) {
  await db.verificationToken.delete({ where: { token } }).catch(() => {});
  if (debug) console.info("[email-token] consumed", { token });
}
