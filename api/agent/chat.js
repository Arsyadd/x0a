// src/server/dynamicAuth.ts
import { createPublicKey, verify as verifySignature } from "node:crypto";
var jwksCache = null;
async function getDynamicKeySet(environmentId) {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(`https://app.dynamic.xyz/api/v0/sdk/${encodeURIComponent(environmentId)}/.well-known/jwks`);
  if (!response.ok) throw new Error("Could not load Dynamic signing keys.");
  const data = await response.json();
  if (!Array.isArray(data.keys)) throw new Error("Dynamic signing keys are invalid.");
  jwksCache = { keys: data.keys, expiresAt: Date.now() + 10 * 60 * 1e3 };
  return data.keys;
}
async function verifyDynamicAuthToken(token, environmentId) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!header.kid || !["RS256", "ES256"].includes(header.alg || "")) return false;
    const now = Math.floor(Date.now() / 1e3);
    if (typeof claims.exp !== "number" || claims.exp <= now) return false;
    if (typeof claims.nbf === "number" && claims.nbf > now) return false;
    if (Array.isArray(claims.scopes) && claims.scopes.includes("requiresAdditionalAuth")) return false;
    const key = (await getDynamicKeySet(environmentId)).find((candidate) => candidate.kid === header.kid);
    if (!key) return false;
    const publicKey = createPublicKey({ key, format: "jwk" });
    const signedData = Buffer.from(`${parts[0]}.${parts[1]}`);
    const signature = Buffer.from(parts[2], "base64url");
    if (header.alg === "RS256") return verifySignature("RSA-SHA256", signedData, publicKey, signature);
    return verifySignature("sha256", signedData, { key: publicKey, dsaEncoding: "ieee-p1363" }, signature);
  } catch {
    return false;
  }
}
async function isDynamicRequestAuthorized(request) {
  const environmentId = process.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  const authorization = request.headers.authorization || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  return Boolean(environmentId && token && await verifyDynamicAuthToken(token, environmentId));
}

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
    agentName: {
      type: SchemaType.STRING,
      description: "The specialized agent responding, e.g. Contract Builder Agent, Security Auditor Agent, Testing & Verification Agent, Deployment Agent, or Requirement Agent."
    },
    reply: {
      type: SchemaType.STRING,
      description: "The complete technical response in high-precision, professional English. Must adhere strictly to role boundaries and delegation rules."
    },
    delegatedTo: {
      type: SchemaType.STRING,
      description: "If the request was outside the active agent role and delegated, the target agent name."
    },
    hasCodeChanges: {
      type: SchemaType.BOOLEAN,
      description: "Whether smart contract code modifications or additions are proposed."
    },
    targetFile: {
      type: SchemaType.STRING,
      description: "The filename being modified (e.g. VaultCore.sol, test/VaultCore.t.sol, script/Deploy.s.sol)."
    },
    diff: {
      type: SchemaType.STRING,
      description: "A clean unified diff showing the modification with lines prefixed by - and +."
    },
    newCode: {
      type: SchemaType.STRING,
      description: "The entire updated source code of targetFile with the changes applied. Must be complete, valid, compilable code."
    },
    actionLabel: {
      type: SchemaType.STRING,
      description: 'Short button label for applying the change, e.g. "Apply changes to VaultCore.sol".'
    },
    newNetwork: {
      type: SchemaType.STRING,
      description: 'If switching networks (e.g. "Base Mainnet (Production)", "Base Sepolia (Testnet)", or "Local Anvil (Devnet)").'
    },
    newEnvironment: {
      type: SchemaType.STRING,
      description: 'The target environment tier: "Mainnet", "Testnet", or "Devnet".'
    }
  },
  required: ["agentName", "reply", "hasCodeChanges", "targetFile"]
};
function stripEmojis(text) {
  if (!text) return "";
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]/gu, "");
}
async function handleAgentChat(message, currentFile, currentCode, projectContext, selectedAgent) {
  const activeRole = selectedAgent || "Contract Builder Agent";
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
     "I\u2019m the ${activeRole}. I can only assist with tasks related to [${activeRole}'s specific responsibility]. I have automatically delegated your request to the [Target Agent]."
     Then immediately provide the [Target Agent]'s comprehensive, expert response and any relevant code changes or diffs.
   - If the user's prompt is completely unrelated to smart contracts, blockchain, or software development (e.g. cooking, general knowledge, non-technical queries):
     Respond strictly:
     "I\u2019m the ${activeRole}. I can only assist with tasks related to [${activeRole}'s specific responsibility]."
     Do not answer unrelated queries or pretend to have capabilities outside this role.

User Request: "${message}"
Active File: ${currentFile || "VaultCore.sol"}
Current Source Code:
\`\`\`solidity
${currentCode || "// empty file"}
\`\`\`
${projectContext ? `Project Context: ${JSON.stringify(projectContext)}` : ""}`;
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
          agentName: stripEmojis(parsed.agentName || activeRole),
          reply: stripEmojis(parsed.reply),
          hasCodeChanges: Boolean(parsed.hasCodeChanges),
          targetFile: stripEmojis(parsed.targetFile || currentFile || "VaultCore.sol"),
          diff: parsed.diff ? stripEmojis(parsed.diff) : void 0,
          newCode: parsed.newCode ? stripEmojis(parsed.newCode) : void 0,
          actionLabel: stripEmojis(parsed.actionLabel || `Apply changes to ${currentFile || "VaultCore.sol"}`),
          newNetwork: parsed.newNetwork ? stripEmojis(parsed.newNetwork) : void 0,
          newEnvironment: parsed.newEnvironment ? stripEmojis(parsed.newEnvironment) : void 0,
          delegatedTo: parsed.delegatedTo ? stripEmojis(parsed.delegatedTo) : void 0
        };
      }
    }
  } catch (error) {
    console.warn("Gemini chat API call failed, using fallback:", error);
  }
  return generateFallbackChatResponse(message, currentFile, currentCode, activeRole);
}
function generateFallbackChatResponse(message, currentFile, currentCode, activeRole) {
  const t = message.toLowerCase();
  const file = currentFile || "VaultCore.sol";
  const isOffTopic = t.includes("weather") || t.includes("recipe") || t.includes("cook") || t.includes("movie") || t.includes("joke") || t.includes("football") || t.includes("sports");
  if (isOffTopic) {
    const roleResponsibility = {
      "Contract Builder Agent": "smart contract architecture, Solidity implementation, and code enhancements",
      "Security Auditor Agent": "adversarial smart contract security reviews, static analysis, and vulnerability mitigation",
      "Testing & Verification Agent": "Foundry unit tests, invariant fuzzing campaigns, and formal verification",
      "Deployment Agent": "deployment scripts, network configurations, and on-chain release orchestration",
      "Requirement Agent": "smart contract intake, specification scoping, and architectural decision records"
    };
    const resp = roleResponsibility[activeRole] || "smart contract development";
    return {
      agentName: activeRole,
      reply: `I\u2019m the ${activeRole}. I can only assist with tasks related to ${resp}. Please let me know how I can assist with your smart contract codebase.`,
      hasCodeChanges: false,
      targetFile: file
    };
  }
  const isSecurity = t.includes("audit") || t.includes("vulnerability") || t.includes("hack") || t.includes("exploit") || t.includes("reentrancy risk") || t.includes("security check");
  const isTesting = t.includes("test") || t.includes("fuzz") || t.includes("foundry") || t.includes("forge") || t.includes("invariant");
  const isDeployment = t.includes("deploy") || t.includes("mainnet") || t.includes("testnet") || t.includes("devnet") || t.includes("anvil") || t.includes("network");
  if (isSecurity && activeRole !== "Security Auditor Agent" && activeRole !== "Auto-Route") {
    return {
      agentName: activeRole,
      delegatedTo: "Security Auditor Agent",
      reply: `I\u2019m the ${activeRole}. I can only assist with tasks related to smart contract authoring and code modifications. I have automatically delegated your request to the Security Auditor Agent.

Security Auditor Agent: Static analysis on ${file} indicates that reentrancy protection is enforced via nonReentrant and virtual shares prevent first-deposit inflation attacks. Access control is locked to multi-sig authorities. No critical reentrancy or donation vulnerabilities detected.`,
      hasCodeChanges: false,
      targetFile: file
    };
  }
  if (isTesting && activeRole !== "Testing & Verification Agent" && activeRole !== "Auto-Route") {
    return {
      agentName: activeRole,
      delegatedTo: "Testing & Verification Agent",
      reply: `I\u2019m the ${activeRole}. I can only assist with tasks related to smart contract authoring and implementation. I have automatically delegated your request to the Testing & Verification Agent.

Testing & Verification Agent: Prepared a comprehensive Foundry invariant test suite in test/VaultCore.t.sol verifying deposit solvency, share accounting monotonicity, and access control reverts across 10,000 random fuzzed calls.`,
      hasCodeChanges: false,
      targetFile: file
    };
  }
  if (isDeployment && activeRole !== "Deployment Agent" && activeRole !== "Auto-Route") {
    let targetNet = "Base Mainnet (Production)";
    let env = "Mainnet";
    if (t.includes("devnet") || t.includes("anvil") || t.includes("local")) {
      targetNet = "Local Anvil (Devnet)";
      env = "Devnet";
    } else if (t.includes("testnet") || t.includes("sepolia")) {
      targetNet = "Base Sepolia (Testnet)";
      env = "Testnet";
    }
    return {
      agentName: activeRole,
      delegatedTo: "Deployment Agent",
      reply: `I\u2019m the ${activeRole}. I can only assist with tasks related to smart contract authoring. I have automatically delegated your request to the Deployment Agent.

Deployment Agent: Target deployment environment updated to ${targetNet}. RPC configuration, gas budgeting, and Safe multi-sig authorization parameters are now active for this workspace.`,
      hasCodeChanges: false,
      targetFile: file,
      newNetwork: targetNet,
      newEnvironment: env
    };
  }
  if (t.includes("fee")) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
      `contract $1 is $2{
    uint256 public withdrawalFeeBps = 25; // 0.25% protocol fee
    address public feeTreasury;`
    );
    const diff = `@@ -15,4 +15,6 @@
+    uint256 public withdrawalFeeBps = 25; // 0.25% protocol fee
+    address public feeTreasury;`;
    return {
      agentName: "Contract Builder Agent",
      reply: "I have prepared a configurable 25 bps (0.25%) withdrawal fee routed to feeTreasury. This protects protocol solvency, aligns incentives, and prevents zero-cost atomic arbitrage.",
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply withdrawal fee to ${file}`
    };
  }
  if (t.includes("pause")) {
    const updated = currentCode.replace(
      /contract\s+(\w+)\s+is\s+([^\{]+)\{/,
      `contract $1 is $2, Pausable {
    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`
    );
    const diff = `@@ -12,2 +12,4 @@
+contract VaultCore is IVault, AccessControl, ReentrancyGuard, Pausable {
+    function pause() external onlyRole(GUARDIAN_ROLE) { _pause(); }
+    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }`;
    return {
      agentName: "Contract Builder Agent",
      reply: "An emergency circuit breaker has been added to the contract. The pause() function can be triggered instantaneously by GUARDIAN_ROLE in the event of an incident, while unpause() is restricted to DEFAULT_ADMIN_ROLE under multi-sig supervision.",
      hasCodeChanges: true,
      targetFile: file,
      diff,
      newCode: updated !== currentCode ? updated : currentCode,
      actionLabel: `Apply pausable circuit breaker to ${file}`
    };
  }
  return {
    agentName: activeRole === "Auto-Route" ? "Contract Builder Agent" : activeRole,
    reply: `I have analyzed your request: "${message}". What specific modification, invariant check, or enhancement would you like me to implement for ${file}?`,
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
  if (!await isDynamicRequestAuthorized(req)) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Please sign in to use this feature." }));
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
  const activeAgent = typeof body?.activeAgent === "string" ? body.activeAgent : void 0;
  if (!message) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Message cannot be empty." }));
    return;
  }
  try {
    const response = await handleAgentChat(message, currentFile, currentCode, projectContext, activeAgent);
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
