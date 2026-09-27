import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from './geminiConfig.ts';

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
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

export async function callGemini(params: GeminiCallParams): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  // 1. Primary: Use the official @google/genai SDK
  try {
    const ai = new GoogleGenAI({ apiKey });

    for (const model of CANDIDATE_MODELS) {
      try {
        const config: Record<string, unknown> = {};
        if (params.responseMimeType) {
          config.responseMimeType = params.responseMimeType;
        }
        if (params.responseSchema) {
          config.responseSchema = params.responseSchema;
        }
        if (typeof params.temperature === 'number') {
          config.temperature = params.temperature;
        }
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }

        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        if (response && typeof response.text === 'string' && response.text.trim()) {
          return response.text;
        }
      } catch (modelErr: any) {
        const msg = String(modelErr?.message || '');
        // If permission is denied or access is restricted on the project, break early to use deterministic engines
        if (msg.includes('denied') || msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID') || msg.includes('401')) {
          return null;
        }
      }
    }
  } catch (sdkErr: any) {
    const msg = String(sdkErr?.message || '');
    if (msg.includes('denied') || msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('401')) {
      return null;
    }
  }

  // 2. Secondary fallback: direct REST call
  for (const model of CANDIDATE_MODELS) {
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

      if (res.ok) {
        const data = (await res.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === 'string' && text.trim()) {
          return text;
        }
      }

      if (res.status === 401 || res.status === 403) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return null;
}
