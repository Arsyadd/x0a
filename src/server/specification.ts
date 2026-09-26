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
  selectedEcosystem: string;
  selectedChain: string;
  selectedNetwork: string;
  compatibilityStatus: 'compatible' | 'review' | 'incompatible';
  compatibilityExplanation: string;
  recommendations: string[];
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
    selectedEcosystem: { type: SchemaType.STRING, description: 'The exact ecosystem selected by the user' },
    selectedChain: { type: SchemaType.STRING, description: 'The exact chain selected by the user' },
    selectedNetwork: { type: SchemaType.STRING, description: 'The exact network selected by the user' },
    compatibilityStatus: { type: SchemaType.STRING, description: 'One of compatible, review, or incompatible' },
    compatibilityExplanation: { type: SchemaType.STRING, description: 'Explain compatibility or incompatibility with the selected ecosystem, chain, and network. Never change the user selection.' },
    recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'When incompatible or requiring review, recommend compatible contract type, ecosystem/chain, and network. Empty when compatible.' },
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
    'selectedEcosystem',
    'selectedChain',
    'selectedNetwork',
    'compatibilityStatus',
    'compatibilityExplanation',
    'recommendations',
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
  selectedEcosystem?: string;
  selectedChain?: string;
  selectedNetwork?: string;
  isTestnet?: boolean;
}

export async function generateSpecification(
  prompt: string,
  options?: SpecificationOptions,
): Promise<Specification> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.info('API key is not set on the server. Generating structured specification from requirements.');
    return applyTargetSelection(generateFallbackSpecification(prompt, options), prompt, options);
  }

  const promptDirective = [
    'You are the Requirement Agent for smart contract systems. Create an implementation-ready software specification by reconciling the request, attached source material, linked reference excerpts, and explicit target selection.',
    options?.projectName ? `Required Project Name: "${options.projectName}". Use this exact name for projectName.` : '',
    options?.selectedEcosystem ? `User-selected ecosystem (must remain unchanged): "${options.selectedEcosystem}".` : '',
    options?.selectedChain ? `User-selected chain (must remain unchanged): "${options.selectedChain}".` : '',
    options?.selectedNetwork ? `User-selected network (must remain unchanged): "${options.selectedNetwork}"${options.isTestnet ? ' (testnet)' : ' (production/mainnet)'}.` : '',
    'Evaluate whether the requested contract type and requirements are compatible with the exact user-selected ecosystem, chain, and network. Set compatibilityStatus to compatible, review, or incompatible. Explain concrete issues and give actionable alternatives in recommendations when needed. Do not silently change any user selection; selectedEcosystem, selectedChain, selectedNetwork, and targetNetworks must preserve the requested selection. Never use the words Gemini, Gemini AI, AI, or Artificial Intelligence in user-facing fields. Mark unknowns as assumptions instead of inventing facts. Keep every requirement specific to the supplied material.\n\nProject request and extracted source material:\n' + prompt,
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
        return applyTargetSelection(spec, prompt, options);
      }
    }
  } catch (error) {
    console.warn('Gemini specification API call failed, generating fallback:', error);
  }

  return applyTargetSelection(generateFallbackSpecification(prompt, options), prompt, options);
}

function applyTargetSelection(spec: Specification, prompt: string, options?: SpecificationOptions): Specification {
  const inferredEcosystem = spec.ecosystem;
  const ecosystem = options?.selectedEcosystem?.trim() || spec.ecosystem;
  const chain = options?.selectedChain?.trim() || ecosystem;
  const network = options?.selectedNetwork?.trim() || options?.targetNetwork?.trim() || spec.targetNetworks;
  const lower = prompt.toLowerCase();
  const explicitlyDifferent = (ecosystem.toLowerCase() === 'evm' && /\b(anchor|solana program|move package|cairo contract)\b/.test(lower)) ||
    (/\b(solana|sui|aptos|starknet|cosmos|near|polkadot|cardano)\b/.test(lower) &&
      !lower.includes(ecosystem.toLowerCase()));

  spec.selectedEcosystem = ecosystem;
  spec.selectedChain = chain;
  spec.selectedNetwork = network;
  spec.ecosystem = ecosystem;
  spec.targetNetworks = network;

  if (explicitlyDifferent && spec.compatibilityStatus !== 'incompatible') {
    spec.compatibilityStatus = 'incompatible';
    spec.compatibilityExplanation = `The request appears to target a different execution model than the selected ${ecosystem} ecosystem / ${chain} chain. The selection is unchanged.`;
    spec.recommendations = [`Keep ${ecosystem} · ${chain} · ${network} selected and redesign the contract for its native execution model, or choose an ecosystem matching the requested contract (${inferredEcosystem}).`].concat(spec.recommendations || []);
  } else if (!spec.compatibilityStatus || !spec.compatibilityExplanation) {
    spec.compatibilityStatus = 'review';
    spec.compatibilityExplanation = `The request will be built for your selected ${ecosystem} ecosystem, ${chain} chain, and ${network} network. Confirm its requirements and security assumptions before generation.`;
    spec.recommendations = [];
  }

  return spec;
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
  const validCompatibility =
    typeof data.selectedEcosystem === 'string' &&
    typeof data.selectedChain === 'string' &&
    typeof data.selectedNetwork === 'string' &&
    ['compatible', 'review', 'incompatible'].includes(data.compatibilityStatus) &&
    typeof data.compatibilityExplanation === 'string' &&
    Array.isArray(data.recommendations) &&
    data.recommendations.every((item: unknown) => typeof item === 'string');

  return validStrings && validLists && validCompatibility;
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
    selectedEcosystem: options?.selectedEcosystem || ecosystem,
    selectedChain: options?.selectedChain || options?.selectedEcosystem || ecosystem,
    selectedNetwork: options?.selectedNetwork || options?.targetNetwork || targetNetworks,
    compatibilityStatus: 'review',
    compatibilityExplanation: 'Review the selected target against the protocol requirements and ecosystem-specific security model.',
    recommendations: [],
  };
}

function getErrorStatus(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number(error.status);
  }
  return 0;
}
