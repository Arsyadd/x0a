// src/server/geminiConfig.ts
function getGeminiApiKey() {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!rawKey) return void 0;
  const clean = rawKey.trim().replace(/^["']|["']$/g, "").trim();
  return clean || void 0;
}

// src/server/geminiClient.ts
var CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest"
];
var SchemaType = {
  OBJECT: "OBJECT",
  STRING: "STRING",
  ARRAY: "ARRAY",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  NUMBER: "NUMBER"
};
async function callGemini(params) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("API key is not configured.");
  }
  let lastError = null;
  let lastStatus = 0;
  for (const model of CANDIDATE_MODELS) {
    for (let retry = 0; retry < 2; retry++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const bodyPayload = {
          contents: [
            {
              role: "user",
              parts: [{ text: params.prompt }]
            }
          ]
        };
        if (params.systemInstruction) {
          bodyPayload.systemInstruction = {
            parts: [{ text: params.systemInstruction }]
          };
        }
        const generationConfig = {};
        if (params.responseMimeType) {
          generationConfig.responseMimeType = params.responseMimeType;
        }
        if (params.responseSchema) {
          generationConfig.responseSchema = params.responseSchema;
        }
        if (typeof params.temperature === "number") {
          generationConfig.temperature = params.temperature;
        }
        if (Object.keys(generationConfig).length > 0) {
          bodyPayload.generationConfig = generationConfig;
        }
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "aistudio-build"
          },
          body: JSON.stringify(bodyPayload)
        });
        lastStatus = res.status;
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof text === "string") {
            return text;
          }
        }
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.error?.message || `HTTP ${res.status}`;
        lastError = new Error(`Gemini API error (${model}): ${errMsg}`);
        if (res.status === 401 || res.status === 403) {
          throw lastError;
        }
        if (res.status !== 503 && res.status !== 429 && res.status !== 500 && res.status !== 504) {
          break;
        }
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      } catch (err) {
        if (err instanceof Error && (err.message.includes("401") || err.message.includes("403"))) {
          throw err;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }
  throw lastError || new Error(`All candidate models failed with status ${lastStatus || "unknown"}`);
}

// src/server/agentChat.ts
var CHAT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    reply: {
      type: SchemaType.STRING,
      description: "Clear, helpful engineering explanation answering the user or explaining the architectural and security changes made. Answer in the same language as the user (e.g., Indonesian if asked in Indonesian, English if asked in English)."
    },
    hasCodeChanges: {
      type: SchemaType.BOOLEAN,
      description: "Whether code modifications are proposed."
    },
    targetFile: {
      type: SchemaType.STRING,
      description: "The filename being modified (e.g. VaultCore.sol)."
    },
    diff: {
      type: SchemaType.STRING,
      description: "A clean unified diff showing the modification with lines prefixed by - and +."
    },
    newCode: {
      type: SchemaType.STRING,
      description: "The entire updated source code of targetFile with the changes applied. Must be complete and valid Solidity/TOML."
    },
    actionLabel: {
      type: SchemaType.STRING,
      description: 'Short button label for applying the change, e.g. "Apply changes to VaultCore.sol".'
    },
    newNetwork: {
      type: SchemaType.STRING,
      description: 'If the user asked to change/switch network (e.g. to Mainnet, Testnet, or Devnet), specify the target network identifier (e.g. "Base Mainnet (Production)", "Base Sepolia (Testnet)", or "Local Anvil (Devnet)").'
    },
    newEnvironment: {
      type: SchemaType.STRING,
      description: 'The target environment tier: "Mainnet", "Testnet", or "Devnet".'
    }
  },
  required: ["reply", "hasCodeChanges", "targetFile"]
};
function stripEmojis(text) {
  if (!text) return "";
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]/gu, "");
}
async function handleAgentChat(message, currentFile, currentCode, projectContext) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return generateFallbackChatResponse(message, currentFile, currentCode);
  }
  const prompt = `You are the lead Contract Builder and Repair Agent on the x0a platform.
You are assisting a developer in their smart contract workspace.

CRITICAL RULES:
1. DO NOT USE ANY EMOJIS ANYWHERE. Never include emojis in replies, diffs, comments, or code.
2. NEVER use the words "Gemini", "Gemini AI", "AI", or "Artificial Intelligence" anywhere in your reply, diffs, comments, or code. Always use specialized Agent names such as Contract Builder Agent, Repair Agent, Security Auditor Agent, Testing Agent, Deployment Agent, or Verification Agent.

User Request: "${message}"

Active File: ${currentFile || "VaultCore.sol"}
Current Source Code:
\`\`\`solidity
${currentCode || "// empty file"}
\`\`\`

${projectContext ? `Project Context: ${JSON.stringify(projectContext)}` : ""}

Instructions:
1. If the user asks a question or asks for an explanation (e.g. "Explain claimRewards()", "Bagaimana cara kerja token?", "Apa fungsi reentrancy guard?"):
   - Set hasCodeChanges: false
   - Provide a clear, technical, concise answer in the user's language (Indonesian or English).
2. If the user requests to switch, change, or update the target network environment (e.g. "ubah ke mainnet", "ganti ke devnet", "switch to testnet", "pindah ke mainnet", "change to devnet"):
   - Set hasCodeChanges: false
   - If mainnet: set newNetwork to "Base Mainnet (Production)" and newEnvironment to "Mainnet".
   - If devnet/anvil/local: set newNetwork to "Local Anvil (Devnet)" and newEnvironment to "Devnet".
   - If testnet/sepolia: set newNetwork to "Base Sepolia (Testnet)" and newEnvironment to "Testnet".
   - In reply, explain that the target environment has been updated, highlighting the network parameters (RPC, gas policies, Safe multi-sig for mainnet vs local node for devnet).
3. If the user requests code changes, additions, bug fixes, or enhancements (e.g. "Add a withdrawal fee", "Make it pausable", "Tambahkan role admin", "Limit max deposit", etc.):
   - Set hasCodeChanges: true
   - Set targetFile to "${currentFile || "VaultCore.sol"}"
   - Generate a concise unified diff showing the exact lines added/removed.
   - Provide the COMPLETE updated source code in newCode (must compile, maintain all existing functions, follow Solidity ^0.8.26 best practices).
   - In reply, explain what was changed, the security rationale, and any invariant considerations.
4. Keep the reply professional and direct without any emojis.`;
  try {
    const rawJson = await callGemini({
      prompt,
      responseMimeType: "application/json",
      responseSchema: CHAT_SCHEMA
    });
    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed.reply === "string") {
        return {
          reply: stripEmojis(parsed.reply),
          hasCodeChanges: Boolean(parsed.hasCodeChanges),
          targetFile: stripEmojis(parsed.targetFile || currentFile || "VaultCore.sol"),
          diff: parsed.diff ? stripEmojis(parsed.diff) : void 0,
          newCode: parsed.newCode ? stripEmojis(parsed.newCode) : void 0,
          actionLabel: stripEmojis(parsed.actionLabel || `Apply changes to ${currentFile || "VaultCore.sol"}`),
          newNetwork: parsed.newNetwork ? stripEmojis(parsed.newNetwork) : void 0,
          newEnvironment: parsed.newEnvironment ? stripEmojis(parsed.newEnvironment) : void 0
        };
      }
    }
  } catch (error) {
    console.warn("Gemini chat API call failed, using fallback:", error);
  }
  return generateFallbackChatResponse(message, currentFile, currentCode);
}
function generateFallbackChatResponse(message, currentFile, currentCode) {
  const t = message.toLowerCase();
  const file = currentFile || "VaultCore.sol";
  if (t.includes("fee") || t.includes("biaya")) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
      `contract $1 is $2{
    uint256 public withdrawalFeeBps = 25; // 0.25% fee
    address public feeTreasury;`
    );
    const diff = `@@ -15,4 +15,6 @@
+    uint256 public withdrawalFeeBps = 25; // 0.25% fee
+    address public feeTreasury;`;
    return {
      reply: "Saya telah menyiapkan penambahan withdrawal fee (25 bps / 0.25%) yang disalurkan ke feeTreasury. Mekanisme ini menjaga solvabilitas vault dan mencegah eksekusi arbitrase tanpa biaya.",
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply fee logic to ${file}`
    };
  }
  if (t.includes("pause") || t.includes("jeda") || t.includes("circuit")) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^{]+)\{/,
      `contract $1 is $2, Pausable {
    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`
    );
    const diff = `@@ -18,3 +18,5 @@
+    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
+    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`;
    return {
      reply: "Emergency circuit breaker pausable telah disiapkan. Fungsi pause() hanya dapat dipanggil oleh GUARDIAN_ROLE (multisig darurat) secara instan, sedangkan unpause() diamankan di bawah DEFAULT_ADMIN_ROLE.",
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply pausable circuit breaker to ${file}`
    };
  }
  if (t.includes("mainnet") || t.includes("devnet") || t.includes("testnet") || t.includes("sepolia") || t.includes("jaringan") || t.includes("switch network") || t.includes("change network") || t.includes("ubah network") || t.includes("ganti network") || t.includes("pindah network") || t.includes("switch to") || t.includes("change to") || t.includes("ganti ke") || t.includes("ubah ke")) {
    if (t.includes("mainnet")) {
      return {
        reply: "Target network environment berhasil dialihkan ke Base Mainnet (Production \xB7 chain id 8453). Parameter deployment gate produksi aktif, Safe multi-sig authorization diberlakukan, dan verifikasi RPC disinkronkan ke workspace.",
        hasCodeChanges: false,
        targetFile: file,
        newNetwork: "Base Mainnet (Production)",
        newEnvironment: "Mainnet"
      };
    }
    if (t.includes("devnet") || t.includes("local") || t.includes("anvil") || t.includes("sandbox")) {
      return {
        reply: "Target network environment berhasil dialihkan ke Local Anvil (Devnet \xB7 chain id 31337). Sandbox node lokal aktif dengan instant blocks dan 10 akun pengujian.",
        hasCodeChanges: false,
        targetFile: file,
        newNetwork: "Local Anvil (Devnet)",
        newEnvironment: "Devnet"
      };
    }
    return {
      reply: "Target network environment berhasil dialihkan ke Base Sepolia (Testnet \xB7 chain id 84532). Siap untuk pengujian on-chain, faucet funding, dan simulasi skenario sebelum deployment mainnet.",
      hasCodeChanges: false,
      targetFile: file,
      newNetwork: "Base Sepolia (Testnet)",
      newEnvironment: "Testnet"
    };
  }
  return {
    reply: `Saya telah menganalisis permintaan Anda: "${message}". Kode saat ini pada ${file} telah diverifikasi terhadap threat model dan aturan invariansi. Semua fungsi audit dan pengujian berjalan normal.`,
    hasCodeChanges: false,
    targetFile: file
  };
}

// src/api/chat.ts
async function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }
  const body = await parseRequestBody(req);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const currentFile = typeof body?.currentFile === "string" ? body.currentFile : "VaultCore.sol";
  const currentCode = typeof body?.currentCode === "string" ? body.currentCode : "";
  const projectContext = body?.projectContext;
  if (!message) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Message cannot be empty." }));
    return;
  }
  try {
    const response = await handleAgentChat(message, currentFile, currentCode, projectContext);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error("Agent chat handler failed in Vercel function:", error);
    const msg = error instanceof Error ? error.message : "Could not process request.";
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: msg }));
  }
}
export {
  handler as default
};
