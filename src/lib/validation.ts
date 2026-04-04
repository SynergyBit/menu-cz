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
  if (password.length < 6) {
    return { valid: false, message: "Heslo musí mít alespoň 6 znaků" };
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

// Rate limit map (in-memory, per-process)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);
