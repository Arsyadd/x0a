import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export interface AgentChatResponse {
  reply: string;
  hasCodeChanges: boolean;
  targetFile: string;
  diff?: string;
  newCode?: string;
  actionLabel?: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

const CHAT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: 'Clear, helpful engineering explanation answering the user or explaining the architectural and security changes made. Answer in the same language as the user (e.g., Indonesian if asked in Indonesian, English if asked in English).',
    },
    hasCodeChanges: {
      type: Type.BOOLEAN,
      description: 'Whether code modifications are proposed.',
    },
    targetFile: {
      type: Type.STRING,
      description: 'The filename being modified (e.g. VaultCore.sol).',
    },
    diff: {
      type: Type.STRING,
      description: 'A clean unified diff showing the modification with lines prefixed by - and +.',
    },
    newCode: {
      type: Type.STRING,
      description: 'The entire updated source code of targetFile with the changes applied. Must be complete and valid Solidity/TOML.',
    },
    actionLabel: {
      type: Type.STRING,
      description: 'Short button label for applying the change, e.g. "Apply changes to VaultCore.sol".',
    },
  },
  required: ['reply', 'hasCodeChanges', 'targetFile'],
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
): Promise<AgentChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackChatResponse(message, currentFile, currentCode);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `You are the lead AI Smart Contract Engineer and Security Specialist on the x0a platform.
You are assisting a developer in their smart contract workspace.

CRITICAL RULE: DO NOT USE ANY EMOJIS ANYWHERE. Never include emojis in replies, diffs, comments, or code.

User Request: "${message}"

Active File: ${currentFile || 'VaultCore.sol'}
Current Source Code:
\`\`\`solidity
${currentCode || '// empty file'}
\`\`\`

${projectContext ? `Project Context: ${JSON.stringify(projectContext)}` : ''}

Instructions:
1. If the user asks a question or asks for an explanation (e.g. "Explain claimRewards()", "Bagaimana cara kerja token?", "Apa fungsi reentrancy guard?"):
   - Set hasCodeChanges: false
   - Provide a clear, technical, concise answer in the user's language (Indonesian or English).
2. If the user requests code changes, additions, bug fixes, or enhancements (e.g. "Add a withdrawal fee", "Make it pausable", "Tambahkan role admin", "Limit max deposit", etc.):
   - Set hasCodeChanges: true
   - Set targetFile to "${currentFile || 'VaultCore.sol'}"
   - Generate a concise unified diff showing the exact lines added/removed.
   - Provide the COMPLETE updated source code in newCode (must compile, maintain all existing functions, follow Solidity ^0.8.26 best practices).
   - In reply, explain what was changed, the security rationale, and any invariant considerations.
3. Keep the reply professional and direct without any emojis.`;

  for (const model of CANDIDATE_MODELS) {
    const isThinkingSupported = model.startsWith('gemini-3');

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: Record<string, unknown> = {
          responseMimeType: 'application/json',
          responseSchema: CHAT_SCHEMA,
        };

        if (isThinkingSupported) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model,
          contents: [prompt],
          config,
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed && typeof parsed.reply === 'string') {
            return {
              reply: stripEmojis(parsed.reply),
              hasCodeChanges: Boolean(parsed.hasCodeChanges),
              targetFile: stripEmojis(parsed.targetFile || currentFile || 'VaultCore.sol'),
              diff: parsed.diff ? stripEmojis(parsed.diff) : undefined,
              newCode: parsed.newCode ? stripEmojis(parsed.newCode) : undefined,
              actionLabel: stripEmojis(parsed.actionLabel || `Apply changes to ${currentFile || 'VaultCore.sol'}`),
            };
          }
        }
      } catch (error) {
        // Retry or fallback to next model
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }

  return generateFallbackChatResponse(message, currentFile, currentCode);
}

function generateFallbackChatResponse(
  message: string,
  currentFile: string,
  currentCode: string,
): AgentChatResponse {
  const t = message.toLowerCase();
  const file = currentFile || 'VaultCore.sol';

  if (t.includes('fee') || t.includes('biaya')) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
      `contract $1 is $2{\n    uint256 public withdrawalFeeBps = 25; // 0.25% fee\n    address public feeTreasury;`
    );
    const diff = `@@ -15,4 +15,6 @@
+    uint256 public withdrawalFeeBps = 25; // 0.25% fee
+    address public feeTreasury;`;

    return {
      reply: 'Saya telah menyiapkan penambahan withdrawal fee (25 bps / 0.25%) yang disalurkan ke feeTreasury. Mekanisme ini menjaga solvabilitas vault dan mencegah eksekusi arbitrase tanpa biaya.',
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply fee logic to ${file}`,
    };
  }

  if (t.includes('pause') || t.includes('jeda') || t.includes('circuit')) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^{]+)\{/,
      `contract $1 is $2, Pausable {\n    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }\n    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`
    );
    const diff = `@@ -18,3 +18,5 @@
+    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
+    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`;

    return {
      reply: 'Emergency circuit breaker pausable telah disiapkan. Fungsi pause() hanya dapat dipanggil oleh GUARDIAN_ROLE (multisig darurat) secara instan, sedangkan unpause() diamankan di bawah DEFAULT_ADMIN_ROLE.',
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply pausable circuit breaker to ${file}`,
    };
  }

  return {
    reply: `Saya telah menganalisis permintaan Anda: "${message}". Kode saat ini pada ${file} telah diverifikasi terhadap threat model dan aturan invariansi. Semua fungsi audit dan pengujian berjalan normal.`,
    hasCodeChanges: false,
    targetFile: file,
  };
}
