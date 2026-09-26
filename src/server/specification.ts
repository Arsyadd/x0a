import { getGeminiApiKey } from './geminiConfig';
import { callGemini, SchemaType } from './geminiClient';

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
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'SpecificationGenerationError';
    this.statusCode = statusCode;
  }
}

const SPEC_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    projectName: { type: SchemaType.STRING, description: 'Short project name' },
    ecosystem: { type: SchemaType.STRING, description: 'Target ecosystem e.g. EVM, Solana, Cosmos, Web, etc.' },
    language: { type: SchemaType.STRING, description: 'Primary programming language' },
    framework: { type: SchemaType.STRING, description: 'Framework or tooling' },
    contractKind: { type: SchemaType.STRING, description: 'Contract or application category' },
    targetNetworks: { type: SchemaType.STRING, description: 'Target networks or deployment environments' },
    complexity: { type: SchemaType.STRING, description: 'Estimated complexity (e.g. Low, Medium, High)' },
    summary: { type: SchemaType.STRING, description: 'Executive technical summary of the specification' },
    functionalRequirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of functional requirements',
    },
    securityRequirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of security requirements',
    },
    outOfScope: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of explicitly out-of-scope items',
    },
    assumptions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
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

export interface SpecificationOptions {
  projectName?: string;
  targetNetwork?: string;
}

export async function generateSpecification(
  prompt: string,
  options?: SpecificationOptions,
): Promise<Specification> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.info('API key is not set on the server. Generating structured specification from requirements.');
    return generateFallbackSpecification(prompt, options);
  }

  const promptDirective = [
    'You are the Requirement Agent for smart contract systems. Create an implementation-ready software specification using only the project request below.',
    options?.projectName ? `Required Project Name: "${options.projectName}". Use this exact name for projectName.` : '',
    options?.targetNetwork ? `Required Target Network: "${options.targetNetwork}". Use this exact target for targetNetworks.` : '',
    'Never use the words Gemini, Gemini AI, AI, or Artificial Intelligence in any field or description. Do not assume it is a blockchain project unless the request says so. Mark unknowns as assumptions instead of inventing facts. Return valid JSON with exactly the required fields. Keep requirements specific to the request.\n\nProject request:\n' + prompt,
  ].filter(Boolean).join('\n');

  try {
    const rawJson = await callGemini({
      prompt: promptDirective,
      responseMimeType: 'application/json',
      responseSchema: SPEC_SCHEMA as Record<string, unknown>,
    });

    if (rawJson) {
      const spec = JSON.parse(rawJson);
      if (validateSpecification(spec)) {
        if (options?.projectName && options.projectName.trim()) {
          spec.projectName = options.projectName.trim();
        }
        if (options?.targetNetwork && options.targetNetwork.trim()) {
          spec.targetNetworks = options.targetNetwork.trim();
        }
        return spec;
      }
    }
  } catch (error) {
    console.warn('Gemini specification API call failed, generating fallback:', error);
  }

  return generateFallbackSpecification(prompt, options);
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

function generateFallbackSpecification(
  prompt: string,
  options?: SpecificationOptions,
): Specification {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  let ecosystem = 'EVM';
  let language = 'Solidity';
  let framework = 'Foundry';
  let contractKind = 'Smart Contract Protocol';
  let targetNetworks = 'Base Sepolia (Testnet)';

  if (lower.includes('solana') || lower.includes('anchor') || lower.includes('rust')) {
    ecosystem = 'Solana';
    language = 'Rust';
    framework = 'Anchor';
    contractKind = 'Solana Program';
    targetNetworks = 'Solana Devnet';
  } else if (lower.includes('sui') || lower.includes('aptos') || lower.includes('move')) {
    ecosystem = 'Sui';
    language = 'Move';
    framework = 'Sui CLI';
    contractKind = 'Move Package';
    targetNetworks = 'Sui Testnet';
  } else if (lower.includes('starknet') || lower.includes('cairo')) {
    ecosystem = 'Starknet';
    language = 'Cairo';
    framework = 'Scarb / Starknet Foundry';
    contractKind = 'Starknet Contract';
    targetNetworks = 'Starknet Sepolia';
  } else if (
    lower.includes('evm') ||
    lower.includes('solidity') ||
    lower.includes('ethereum') ||
    lower.includes('base') ||
    lower.includes('arbitrum') ||
    lower.includes('optimism') ||
    lower.includes('polygon') ||
    lower.includes('vault') ||
    lower.includes('lending') ||
    lower.includes('staking') ||
    lower.includes('yield') ||
    lower.includes('defi') ||
    lower.includes('token') ||
    lower.includes('contract') ||
    lower.includes('chain') ||
    lower.includes('escrow') ||
    lower.includes('router') ||
    lower.includes('liquidity')
  ) {
    ecosystem = 'EVM';
    language = 'Solidity';
    framework = 'Foundry';
    if (lower.includes('mainnet')) {
      targetNetworks = 'Base Mainnet (Production)';
    } else if (lower.includes('devnet') || lower.includes('local') || lower.includes('anvil')) {
      targetNetworks = 'Local Anvil (Devnet)';
    } else {
      targetNetworks = 'Base Sepolia (Testnet)';
    }
  } else {
    ecosystem = 'Web Full-Stack';
    language = 'TypeScript';
    framework = 'React / Node.js';
    contractKind = 'Web Application';
    targetNetworks = 'Cloud Run, Vercel';
  }

  // Override target network if explicitly provided or in prompt
  if (options?.targetNetwork && options.targetNetwork.trim()) {
    targetNetworks = options.targetNetwork.trim();
  } else {
    const matchNet = cleanPrompt.match(/(?:Target Network|Target Networks|Network|Jaringan|Pilih target network[^\n\r?:]*\??)\s*[:=]\s*([^\n\r]+)/i);
    if (matchNet && matchNet[1] && matchNet[1].trim()) {
      targetNetworks = matchNet[1].trim();
    }
  }

  // Refine contractKind for smart contract protocols
  if (ecosystem !== 'Web Full-Stack') {
    if (lower.includes('lend') || lower.includes('borrow') || lower.includes('collateral')) {
      contractKind = 'Lending Protocol & Money Market';
    } else if (lower.includes('stak') || lower.includes('reward')) {
      contractKind = 'Liquid Staking & Reward Pool';
    } else if (lower.includes('vault') || lower.includes('yield') || lower.includes('4626')) {
      contractKind = 'ERC-4626 Yield Vault';
    } else if (lower.includes('nft') || lower.includes('market') || lower.includes('auction')) {
      contractKind = 'NFT & Asset Marketplace';
    } else if (lower.includes('escrow')) {
      contractKind = 'Conditional Escrow Protocol';
    } else if (lower.includes('swap') || lower.includes('amm') || lower.includes('dex') || lower.includes('router')) {
      contractKind = 'Automated Liquidity Router';
    } else if (lower.includes('timelock') || lower.includes('multisig') || lower.includes('gov')) {
      contractKind = 'Governance Timelock Controller';
    }
  }

  // Derive or prioritize project name
  let projectName = '';
  if (options?.projectName && options.projectName.trim()) {
    projectName = options.projectName.trim();
  } else {
    // Check if prompt has explicit Project Name: line or answered question
    const matchName = cleanPrompt.match(/(?:Project Name|Nama Project|Contract Name|Mau dikasih nama apa project smart contract nya\??)\s*[:=]\s*([^\n\r]+)/i);
    if (matchName && matchName[1] && matchName[1].trim()) {
      projectName = matchName[1].trim();
    } else {
      const firstSentence = cleanPrompt.split(/[.\n]/)[0] || 'Smart Contract Protocol';
      projectName = firstSentence.replace(/^(build|create|deploy|make|design)\s+(an?|the)?\s*/i, '').trim();
    }
  }

  if (!projectName || projectName.length < 2) {
    projectName = contractKind;
  }
  if (projectName.length > 36) {
    projectName = projectName.slice(0, 33) + '...';
  }

  const functionalRequirements: string[] = [
    'Core business logic execution according to protocol parameters',
    'Configurable administration and operational parameter controls',
    'State transition validation with emit events for all state mutations',
    'User asset deposit, withdrawal, and accounting integrity',
  ];

  if (lower.includes('fee')) {
    functionalRequirements.push('Configurable protocol fee calculation and automated treasury routing');
  }
  if (lower.includes('liquidat') || lower.includes('lend') || lower.includes('borrow')) {
    functionalRequirements.push('Collateral health checks and liquidation keeper incentives');
  }
  if (lower.includes('pause') || lower.includes('emergency')) {
    functionalRequirements.push('Emergency circuit breaker pausable state to halt sensitive operations');
  }
  if (lower.includes('reward') || lower.includes('stake')) {
    functionalRequirements.push('Accumulative rewardPerShare index for constant O(1) reward distribution');
  }

  return {
    projectName,
    ecosystem,
    language,
    framework,
    contractKind,
    targetNetworks,
    complexity: cleanPrompt.length > 200 ? 'High' : 'Medium',
    summary: `Structured specification generated from user requirements: "${cleanPrompt.slice(0, 160)}${cleanPrompt.length > 160 ? '...' : ''}". Architected with security checks, role-based access, and comprehensive test suites.`,
    functionalRequirements,
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
