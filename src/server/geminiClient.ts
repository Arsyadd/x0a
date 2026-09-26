import { getGeminiApiKey } from './geminiConfig';

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
];

export const SchemaType = {
  OBJECT: 'OBJECT',
  STRING: 'STRING',
  ARRAY: 'ARRAY',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  NUMBER: 'NUMBER',
} as const;

export interface GeminiCallParams {
  prompt: string;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  systemInstruction?: string;
  temperature?: number;
}

export async function callGemini(params: GeminiCallParams): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('API key is not configured.');
  }

  let lastError: Error | null = null;
  let lastStatus = 0;

  for (const model of CANDIDATE_MODELS) {
    for (let retry = 0; retry < 2; retry++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const bodyPayload: Record<string, unknown> = {
          contents: [
            {
              role: 'user',
              parts: [{ text: params.prompt }],
            },
          ],
        };

        if (params.systemInstruction) {
          bodyPayload.systemInstruction = {
            parts: [{ text: params.systemInstruction }],
          };
        }

        const generationConfig: Record<string, unknown> = {};
        if (params.responseMimeType) {
          generationConfig.responseMimeType = params.responseMimeType;
        }
        if (params.responseSchema) {
          generationConfig.responseSchema = params.responseSchema;
        }
        if (typeof params.temperature === 'number') {
          generationConfig.temperature = params.temperature;
        }

        if (Object.keys(generationConfig).length > 0) {
          bodyPayload.generationConfig = generationConfig;
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build',
          },
          body: JSON.stringify(bodyPayload),
        });

        lastStatus = res.status;

        if (res.ok) {
          const data = (await res.json()) as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof text === 'string') {
            return text;
          }
        }

        const errData = (await res.json().catch(() => null)) as any;
        const errMsg = errData?.error?.message || `HTTP ${res.status}`;
        lastError = new Error(`Gemini API error (${model}): ${errMsg}`);

        // If key is invalid or permission denied (401 / 403), stop retrying
        if (res.status === 401 || res.status === 403) {
          throw lastError;
        }

        // If not transient, try next model
        if (res.status !== 503 && res.status !== 429 && res.status !== 500 && res.status !== 504) {
          break;
        }

        // Backoff before retry
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      } catch (err) {
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
          throw err;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastError || new Error(`All candidate models failed with status ${lastStatus || 'unknown'}`);
}
