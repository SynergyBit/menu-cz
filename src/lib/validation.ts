// Input sanitization — strip HTML tags, trim
export function sanitize(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

// Email validation
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password strength
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Heslo musí mít alespoň 8 znaků" };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Heslo musí obsahovat alespoň jedno písmeno a jednu číslici",
    };
  }
  if (password.length > 128) {
    return { valid: false, message: "Heslo je příliš dlouhé" };
  }
  return { valid: true, message: "" };
}

// Phone validation (Czech format)
export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // optional
  return /^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/.test(phone.replace(/\s/g, ""));
}

// URL validation
export function isValidUrl(url: string): boolean {
  if (!url) return true; // optional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Rate limit is now backed by Postgres (distributed across Railway instances).
// See lib/rate-limit.ts. This re-export keeps existing imports working.
export { checkRateLimitDb as checkRateLimit } from "@/lib/rate-limit";
