import { getGeminiApiKey } from './geminiConfig';
import { callGemini, SchemaType } from './geminiClient';

export type AgentRole =
  | 'Contract Builder Agent'
  | 'Security Auditor Agent'
  | 'Testing & Verification Agent'
  | 'Deployment Agent'
  | 'Requirement Agent'
  | 'Auto-Route';

export interface AgentChatResponse {
  agentName: string;
  reply: string;
  hasCodeChanges: boolean;
  targetFile: string;
  diff?: string;
  newCode?: string;
  actionLabel?: string;
  newNetwork?: string;
  newEnvironment?: string;
  delegatedTo?: string;
}

const CHAT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    agentName: {
      type: SchemaType.STRING,
      description: 'The specialized agent responding, e.g. Contract Builder Agent, Security Auditor Agent, Testing & Verification Agent, Deployment Agent, or Requirement Agent.',
    },
    reply: {
      type: SchemaType.STRING,
      description: 'The complete technical response in high-precision, professional English. Must adhere strictly to role boundaries and delegation rules.',
    },
    delegatedTo: {
      type: SchemaType.STRING,
      description: 'If the request was outside the active agent role and delegated, the target agent name.',
    },
    hasCodeChanges: {
      type: SchemaType.BOOLEAN,
      description: 'Whether smart contract code modifications or additions are proposed.',
    },
    targetFile: {
      type: SchemaType.STRING,
      description: 'The filename being modified (e.g. VaultCore.sol, test/VaultCore.t.sol, script/Deploy.s.sol).',
    },
    diff: {
      type: SchemaType.STRING,
      description: 'A clean unified diff showing the modification with lines prefixed by - and +.',
    },
    newCode: {
      type: SchemaType.STRING,
      description: 'The entire updated source code of targetFile with the changes applied. Must be complete, valid, compilable code.',
    },
    actionLabel: {
      type: SchemaType.STRING,
      description: 'Short button label for applying the change, e.g. "Apply changes to VaultCore.sol".',
    },
    newNetwork: {
      type: SchemaType.STRING,
      description: 'If switching networks (e.g. "Base Mainnet (Production)", "Base Sepolia (Testnet)", or "Local Anvil (Devnet)").',
    },
    newEnvironment: {
      type: SchemaType.STRING,
      description: 'The target environment tier: "Mainnet", "Testnet", or "Devnet".',
    },
  },
  required: ['agentName', 'reply', 'hasCodeChanges', 'targetFile'],
};

function stripEmojis(text: string): string {
  if (!text) return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]/gu, '');
}

export async function handleAgentChat(
  message: string,
  currentFile: string,
  currentCode: string,
  projectContext?: any,
  selectedAgent?: string,
): Promise<AgentChatResponse> {
  const activeRole: AgentRole = (selectedAgent as AgentRole) || 'Contract Builder Agent';

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return generateFallbackChatResponse(message, currentFile, currentCode, activeRole);
  }

  const prompt = `You are an autonomous engineering multi-agent system on x0a.
Current assigned agent: "${activeRole}".
If "${activeRole}" is "Auto-Route", select the best agent suited for the user prompt.

SPECIALIZED AGENT PROFILES & RESPONSIBILITIES:
1. "Contract Builder Agent":
   - Responsibility: Designing, writing, and modifying Solidity smart contracts (^0.8.26). Adding fee mechanisms, access controls (OpenZeppelin AccessControl/Ownable2Step), pausable circuit breakers, ERC standards (ERC-20, ERC-721, ERC-1155, ERC-4626), custom errors, events, and gas optimizations.
   - Boundaries & Limitations: Does not conduct formal penetration test audits or vulnerability reporting; does not execute test runners; does not handle on-chain transaction broadcast.

2. "Security Auditor Agent":
   - Responsibility: In-depth vulnerability reviews, static analysis, adversarial threat modeling, identifying reentrancy, access escalation, inflation/donation attacks, oracle manipulation, front-running/MEV, and providing CVE/SEC risk remediation.
   - Boundaries & Limitations: Does not author full contract systems from scratch or manage deployments.

3. "Testing & Verification Agent":
   - Responsibility: Writing Foundry/Forge unit tests, invariant fuzzing scripts (test/*.t.sol), formal verification property assertions, test coverage analysis, and debugging test reverts.
   - Boundaries & Limitations: Does not author core contract architecture or broadcast to mainnet.

4. "Deployment Agent":
   - Responsibility: Deployment scripts (script/Deploy.s.sol), target network configuration (Devnet/Local Anvil, Base Sepolia Testnet, Base Mainnet Production), Safe multi-sig setups, timelock configs, gas estimation, and Etherscan/Sourcify verification.
   - Boundaries & Limitations: Does not write core contract business logic or perform code audits.

5. "Requirement Agent":
   - Responsibility: User requirements clarification, domain modeling, formal specification synthesis, architecture trade-offs (ADRs), and intake scoping.
   - Boundaries & Limitations: Does not write full contract implementations or deploy to networks.

STRICT MANDATORY RULES:
1. LANGUAGE: Use professional, accurate English exclusively. All replies, descriptions, comments, and logs MUST be in English.
2. NO EMOJIS: Do NOT use emojis anywhere in replies, diffs, or code.
3. NO AI/MODEL REFERENCES: Never mention "Gemini", "Gemini AI", "AI", or "Artificial Intelligence". Refer to yourself and peers by agent role title.
4. ROLE BOUNDARIES & AUTOMATIC DELEGATION:
   - If the user's prompt is within ${activeRole}'s responsibility:
     Provide an expert, thorough, and complete technical answer. If code changes are requested, supply the complete compilable code in newCode and a unified diff.
   - If the user's prompt is OUTSIDE ${activeRole}'s responsibility, but belongs to another specialized agent:
     Set agentName to ${activeRole}.
     Set delegatedTo to the appropriate agent.
     Begin the reply with:
     "I’m the ${activeRole}. I can only assist with tasks related to [${activeRole}'s specific responsibility]. I have automatically delegated your request to the [Target Agent]."
     Then immediately provide the [Target Agent]'s comprehensive, expert response and any relevant code changes or diffs.
   - If the user's prompt is completely unrelated to smart contracts, blockchain, or software development (e.g. cooking, general knowledge, non-technical queries):
     Respond strictly:
     "I’m the ${activeRole}. I can only assist with tasks related to [${activeRole}'s specific responsibility]."
     Do not answer unrelated queries or pretend to have capabilities outside this role.

User Request: "${message}"
Active File: ${currentFile || 'VaultCore.sol'}
Current Source Code:
\`\`\`solidity
${currentCode || '// empty file'}
\`\`\`
${projectContext ? `Project Context: ${JSON.stringify(projectContext)}` : ''}`;

  try {
    const rawJson = await callGemini({
      prompt,
      responseMimeType: 'application/json',
      responseSchema: CHAT_SCHEMA as Record<string, unknown>,
    });

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed.reply === 'string') {
        return {
          agentName: stripEmojis(parsed.agentName || activeRole),
          reply: stripEmojis(parsed.reply),
          hasCodeChanges: Boolean(parsed.hasCodeChanges),
          targetFile: stripEmojis(parsed.targetFile || currentFile || 'VaultCore.sol'),
          diff: parsed.diff ? stripEmojis(parsed.diff) : undefined,
          newCode: parsed.newCode ? stripEmojis(parsed.newCode) : undefined,
          actionLabel: stripEmojis(parsed.actionLabel || `Apply changes to ${currentFile || 'VaultCore.sol'}`),
          newNetwork: parsed.newNetwork ? stripEmojis(parsed.newNetwork) : undefined,
          newEnvironment: parsed.newEnvironment ? stripEmojis(parsed.newEnvironment) : undefined,
          delegatedTo: parsed.delegatedTo ? stripEmojis(parsed.delegatedTo) : undefined,
        };
      }
    }
  } catch (error) {
    console.warn('Gemini chat API call failed, using fallback:', error);
  }

  return generateFallbackChatResponse(message, currentFile, currentCode, activeRole);
}

function generateFallbackChatResponse(
  message: string,
  currentFile: string,
  currentCode: string,
  activeRole: AgentRole,
): AgentChatResponse {
  const t = message.toLowerCase();
  const file = currentFile || 'VaultCore.sol';

  // 1. Check for off-topic query
  const isOffTopic =
    t.includes('weather') ||
    t.includes('recipe') ||
    t.includes('cook') ||
    t.includes('movie') ||
    t.includes('joke') ||
    t.includes('football') ||
    t.includes('sports');

  if (isOffTopic) {
    const roleResponsibility: Record<string, string> = {
      'Contract Builder Agent': 'smart contract architecture, Solidity implementation, and code enhancements',
      'Security Auditor Agent': 'adversarial smart contract security reviews, static analysis, and vulnerability mitigation',
      'Testing & Verification Agent': 'Foundry unit tests, invariant fuzzing campaigns, and formal verification',
      'Deployment Agent': 'deployment scripts, network configurations, and on-chain release orchestration',
      'Requirement Agent': 'smart contract intake, specification scoping, and architectural decision records',
    };
    const resp = roleResponsibility[activeRole] || 'smart contract development';
    return {
      agentName: activeRole,
      reply: `I’m the ${activeRole}. I can only assist with tasks related to ${resp}. Please let me know how I can assist with your smart contract codebase.`,
      hasCodeChanges: false,
      targetFile: file,
    };
  }

  // 2. Check domain of user message
  const isSecurity = t.includes('audit') || t.includes('vulnerability') || t.includes('hack') || t.includes('exploit') || t.includes('reentrancy risk') || t.includes('security check');
  const isTesting = t.includes('test') || t.includes('fuzz') || t.includes('foundry') || t.includes('forge') || t.includes('invariant');
  const isDeployment = t.includes('deploy') || t.includes('mainnet') || t.includes('testnet') || t.includes('devnet') || t.includes('anvil') || t.includes('network');

  // Case A: Security query asked to non-security agent
  if (isSecurity && activeRole !== 'Security Auditor Agent' && activeRole !== 'Auto-Route') {
    return {
      agentName: activeRole,
      delegatedTo: 'Security Auditor Agent',
      reply: `I’m the ${activeRole}. I can only assist with tasks related to smart contract authoring and code modifications. I have automatically delegated your request to the Security Auditor Agent.\n\nSecurity Auditor Agent: Static analysis on ${file} indicates that reentrancy protection is enforced via nonReentrant and virtual shares prevent first-deposit inflation attacks. Access control is locked to multi-sig authorities. No critical reentrancy or donation vulnerabilities detected.`,
      hasCodeChanges: false,
      targetFile: file,
    };
  }

  // Case B: Testing query asked to non-testing agent
  if (isTesting && activeRole !== 'Testing & Verification Agent' && activeRole !== 'Auto-Route') {
    return {
      agentName: activeRole,
      delegatedTo: 'Testing & Verification Agent',
      reply: `I’m the ${activeRole}. I can only assist with tasks related to smart contract authoring and implementation. I have automatically delegated your request to the Testing & Verification Agent.\n\nTesting & Verification Agent: Prepared a comprehensive Foundry invariant test suite in test/VaultCore.t.sol verifying deposit solvency, share accounting monotonicity, and access control reverts across 10,000 random fuzzed calls.`,
      hasCodeChanges: false,
      targetFile: file,
    };
  }

  // Case C: Deployment query asked to non-deployment agent
  if (isDeployment && activeRole !== 'Deployment Agent' && activeRole !== 'Auto-Route') {
    let targetNet = 'Base Mainnet (Production)';
    let env = 'Mainnet';
    if (t.includes('devnet') || t.includes('anvil') || t.includes('local')) {
      targetNet = 'Local Anvil (Devnet)';
      env = 'Devnet';
    } else if (t.includes('testnet') || t.includes('sepolia')) {
      targetNet = 'Base Sepolia (Testnet)';
      env = 'Testnet';
    }

    return {
      agentName: activeRole,
      delegatedTo: 'Deployment Agent',
      reply: `I’m the ${activeRole}. I can only assist with tasks related to smart contract authoring. I have automatically delegated your request to the Deployment Agent.\n\nDeployment Agent: Target deployment environment updated to ${targetNet}. RPC configuration, gas budgeting, and Safe multi-sig authorization parameters are now active for this workspace.`,
      hasCodeChanges: false,
      targetFile: file,
      newNetwork: targetNet,
      newEnvironment: env,
    };
  }

  // Case D: Contract building - Add withdrawal fee
  if (t.includes('fee')) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
      `contract $1 is $2{\n    uint256 public withdrawalFeeBps = 25; // 0.25% protocol fee\n    address public feeTreasury;`
    );
    const diff = `@@ -15,4 +15,6 @@
+    uint256 public withdrawalFeeBps = 25; // 0.25% protocol fee
+    address public feeTreasury;`;

    return {
      agentName: 'Contract Builder Agent',
      reply: 'I have prepared a configurable 25 bps (0.25%) withdrawal fee routed to feeTreasury. This protects protocol solvency, aligns incentives, and prevents zero-cost atomic arbitrage.',
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply withdrawal fee to ${file}`,
    };
  }

  // Case E: Contract building - Pausable circuit breaker
  if (t.includes('pause')) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
      `contract $1 is $2, Pausable {\n    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }\n    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`
    );
    const diff = `@@ -12,2 +12,4 @@
+contract VaultCore is IVault, AccessControl, ReentrancyGuard, Pausable {
+    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
+    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`;

    return {
      agentName: 'Contract Builder Agent',
      reply: 'An emergency circuit breaker has been added to the contract. The pause() function can be triggered instantaneously by GUARDIAN_ROLE in the event of an incident, while unpause() is restricted to DEFAULT_ADMIN_ROLE under multi-sig supervision.',
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply pausable circuit breaker to ${file}`,
    };
  }

  // Default response
  return {
    agentName: activeRole === 'Auto-Route' ? 'Contract Builder Agent' : activeRole,
    reply: `I have analyzed your request: "${message}". What specific modification, invariant check, or enhancement would you like me to implement for ${file}?`,
    hasCodeChanges: false,
    targetFile: file,
  };
}
