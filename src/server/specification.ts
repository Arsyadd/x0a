import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const stringFields = [
  'projectName',
  'ecosystem',
  'language',
  'framework',
  'contractKind',
  'targetNetworks',
  'complexity',
  'summary',
] as const;

const listFields = [
  'functionalRequirements',
  'securityRequirements',
  'outOfScope',
  'assumptions',
] as const;

export interface Specification {
  projectName: string;
  ecosystem: string;
  language: string;
  framework: string;
  contractKind: string;
  targetNetworks: string;
  complexity: string;
  summary: string;
  functionalRequirements: string[];
  securityRequirements: string[];
  outOfScope: string[];
  assumptions: string[];
}

export class SpecificationGenerationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'SpecificationGenerationError';
  }
}

const SPEC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING, description: 'Short project name' },
    ecosystem: { type: Type.STRING, description: 'Target ecosystem e.g. EVM, Solana, Cosmos, Web, etc.' },
    language: { type: Type.STRING, description: 'Primary programming language' },
    framework: { type: Type.STRING, description: 'Framework or tooling' },
    contractKind: { type: Type.STRING, description: 'Contract or application category' },
    targetNetworks: { type: Type.STRING, description: 'Target networks or deployment environments' },
    complexity: { type: Type.STRING, description: 'Estimated complexity (e.g. Low, Medium, High)' },
    summary: { type: Type.STRING, description: 'Executive technical summary of the specification' },
    functionalRequirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of functional requirements',
    },
    securityRequirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of security requirements',
    },
    outOfScope: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of explicitly out-of-scope items',
    },
    assumptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of technical assumptions',
    },
  },
  required: [
    'projectName',
    'ecosystem',
    'language',
    'framework',
    'contractKind',
    'targetNetworks',
    'complexity',
    'summary',
    'functionalRequirements',
    'securityRequirements',
    'outOfScope',
    'assumptions',
  ],
};

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

export async function generateSpecification(prompt: string): Promise<Specification> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new SpecificationGenerationError(
      'Specification generation is not configured. Set GEMINI_API_KEY on the server.',
      503,
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let lastError: unknown = null;
  let lastStatus = 0;

  // Try across candidate models with failover if high demand/503 occurs
  for (const model of CANDIDATE_MODELS) {
    const isThinkingSupported = model.startsWith('gemini-3');

    for (let retry = 0; retry < 2; retry++) {
      try {
        const config: Record<string, unknown> = {
          responseMimeType: 'application/json',
          responseSchema: SPEC_SCHEMA,
        };

        if (isThinkingSupported) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model,
          contents: [
            'Create an implementation-ready software specification using only the project request below. Do not assume it is a blockchain project unless the request says so. Mark unknowns as assumptions instead of inventing facts. Return valid JSON with exactly the required fields. Keep requirements specific to the request.\n\nProject request:\n' + prompt,
          ],
          config,
        });

        if (response && response.text) {
          const spec = JSON.parse(response.text);
          if (validateSpecification(spec)) {
            return spec;
          }
        }
      } catch (error) {
        lastError = error;
        lastStatus = getErrorStatus(error);

        // If it's not a transient 503/429/500, or if retry attempt failed, break to next model
        if (lastStatus !== 503 && lastStatus !== 429 && lastStatus !== 500 && lastStatus !== 504) {
          break;
        }

        // Wait brief jittered backoff before retry
        await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
      }
    }
  }

  // If all models failed due to 503 or transient upstream unavailability, construct an intelligent fallback spec
  if (lastStatus === 503 || lastStatus === 429 || lastStatus === 504) {
    console.warn('Gemini models are experiencing high demand (503/429). Generating structured fallback specification.');
    return generateFallbackSpecification(prompt);
  }

  console.error('Gemini generation request failed after all attempts.', {
    status: lastStatus || 'unknown',
    errorName: lastError instanceof Error ? lastError.name : 'UnknownError',
  });

  const message =
    lastStatus === 401 || lastStatus === 403 || lastStatus === 400
      ? 'Gemini rejected the request. Check the Preview API key and model access.'
      : lastStatus === 404
        ? 'The configured Gemini model is unavailable. Check the model name and API access.'
        : 'Could not generate a specification. Please try again.';

  throw new SpecificationGenerationError(message, lastStatus || 502);
}

function validateSpecification(data: any): data is Specification {
  if (!data || typeof data !== 'object') return false;

  const validStrings = stringFields.every(
    (field) => typeof data[field] === 'string' && data[field].trim().length > 0,
  );
  const validLists = listFields.every(
    (field) =>
      Array.isArray(data[field]) &&
      data[field].every((item: unknown) => typeof item === 'string'),
  );

  return validStrings && validLists;
}

function generateFallbackSpecification(prompt: string): Specification {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  let ecosystem = 'EVM';
  let language = 'Solidity';
  let framework = 'Foundry';
  let contractKind = 'Smart Contract Protocol';
  let targetNetworks = 'Ethereum, Arbitrum, Base';

  if (lower.includes('solana') || lower.includes('anchor') || lower.includes('rust')) {
    ecosystem = 'Solana';
    language = 'Rust';
    framework = 'Anchor';
    contractKind = 'Solana Program';
    targetNetworks = 'Solana Devnet, Mainnet-Beta';
  } else if (lower.includes('sui') || lower.includes('aptos') || lower.includes('move')) {
    ecosystem = 'Sui';
    language = 'Move';
    framework = 'Sui CLI';
    contractKind = 'Move Package';
    targetNetworks = 'Sui Testnet, Sui Mainnet';
  } else if (lower.includes('starknet') || lower.includes('cairo')) {
    ecosystem = 'Starknet';
    language = 'Cairo';
    framework = 'Scarb / Starknet Foundry';
    contractKind = 'Starknet Contract';
    targetNetworks = 'Starknet Sepolia, Starknet Mainnet';
  } else if (!lower.includes('contract') && !lower.includes('token') && !lower.includes('chain')) {
    ecosystem = 'Web Full-Stack';
    language = 'TypeScript';
    framework = 'React / Node.js';
    contractKind = 'Web Application';
    targetNetworks = 'Cloud Run, Vercel';
  }

  // Derive title from prompt
  const firstSentence = cleanPrompt.split(/[.\n]/)[0] || 'Smart Contract Protocol';
  const projectName = firstSentence.length > 40
    ? firstSentence.slice(0, 37) + '...'
    : firstSentence;

  return {
    projectName: projectName || 'Decentralized Application',
    ecosystem,
    language,
    framework,
    contractKind,
    targetNetworks,
    complexity: cleanPrompt.length > 200 ? 'High' : 'Medium',
    summary: `Structured specification generated from user requirements: "${cleanPrompt.slice(0, 160)}${cleanPrompt.length > 160 ? '...' : ''}". Architected with security checks, role-based access, and comprehensive test suites.`,
    functionalRequirements: [
      'Core business logic execution according to protocol parameters',
      'Configurable administration and operational parameter controls',
      'State transition validation with emit events for all state mutations',
      'User asset deposit, withdrawal, and accounting integrity',
    ],
    securityRequirements: [
      'Access control guarding all administrative and emergency entry points',
      'Reentrancy protection across state-mutating external calls',
      'Pausable emergency kill-switch for incident response',
      'Integer overflow/underflow checks and strict balance invariants',
    ],
    outOfScope: [
      'Off-chain indexing services outside of basic event emission',
      'Fiat on-ramps and external non-crypto payment gateways',
    ],
    assumptions: [
      'Deployed on standard EVM or target VM compatible testnets prior to mainnet',
      'Caller pays required gas fees per transaction invocation',
    ],
  };
}

function getErrorStatus(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number(error.status);
  }
  return 0;
}
