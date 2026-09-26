/**
 * Shared helper to resolve and sanitize the Gemini API key across server runtimes.
 * Supports GEMINI_API_KEY, GOOGLE_API_KEY, GOOGLE_GENAI_API_KEY, and VITE_GEMINI_API_KEY.
 * Automatically trims quotes and whitespace which frequently cause 502 errors when copied into Vercel.
 */
export function getGeminiApiKey(): string | undefined {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!rawKey) return undefined;
  const clean = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  return clean || undefined;
}
