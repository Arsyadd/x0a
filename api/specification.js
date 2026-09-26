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

// src/server/specification.ts
var stringFields = [
  "projectName",
  "ecosystem",
  "language",
  "framework",
  "contractKind",
  "targetNetworks",
  "complexity",
  "summary"
];
var listFields = [
  "functionalRequirements",
  "securityRequirements",
  "outOfScope",
  "assumptions"
];
var SpecificationGenerationError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "SpecificationGenerationError";
    this.statusCode = statusCode;
  }
};
var SPEC_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    projectName: { type: SchemaType.STRING, description: "Short project name" },
    ecosystem: { type: SchemaType.STRING, description: "Target ecosystem e.g. EVM, Solana, Cosmos, Web, etc." },
    language: { type: SchemaType.STRING, description: "Primary programming language" },
    framework: { type: SchemaType.STRING, description: "Framework or tooling" },
    contractKind: { type: SchemaType.STRING, description: "Contract or application category" },
    targetNetworks: { type: SchemaType.STRING, description: "Target networks or deployment environments" },
    complexity: { type: SchemaType.STRING, description: "Estimated complexity (e.g. Low, Medium, High)" },
    summary: { type: SchemaType.STRING, description: "Executive technical summary of the specification" },
    functionalRequirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of functional requirements"
    },
    securityRequirements: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of security requirements"
    },
    outOfScope: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of explicitly out-of-scope items"
    },
    assumptions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of technical assumptions"
    }
  },
  required: [
    "projectName",
    "ecosystem",
    "language",
    "framework",
    "contractKind",
    "targetNetworks",
    "complexity",
    "summary",
    "functionalRequirements",
    "securityRequirements",
    "outOfScope",
    "assumptions"
  ]
};
async function generateSpecification(prompt, options) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.info("API key is not set on the server. Generating structured specification from requirements.");
    return generateFallbackSpecification(prompt, options);
  }
  const promptDirective = [
    "You are the Requirement Agent for smart contract systems. Create an implementation-ready software specification using only the project request below.",
    options?.projectName ? `Required Project Name: "${options.projectName}". Use this exact name for projectName.` : "",
    options?.targetNetwork ? `Required Target Network: "${options.targetNetwork}". Use this exact target for targetNetworks.` : "",
    "Never use the words Gemini, Gemini AI, AI, or Artificial Intelligence in any field or description. Do not assume it is a blockchain project unless the request says so. Mark unknowns as assumptions instead of inventing facts. Return valid JSON with exactly the required fields. Keep requirements specific to the request.\n\nProject request:\n" + prompt
  ].filter(Boolean).join("\n");
  try {
    const rawJson = await callGemini({
      prompt: promptDirective,
      responseMimeType: "application/json",
      responseSchema: SPEC_SCHEMA
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
    console.warn("Gemini specification API call failed, generating fallback:", error);
  }
  return generateFallbackSpecification(prompt, options);
}
function validateSpecification(data) {
  if (!data || typeof data !== "object") return false;
  const validStrings = stringFields.every(
    (field) => typeof data[field] === "string" && data[field].trim().length > 0
  );
  const validLists = listFields.every(
    (field) => Array.isArray(data[field]) && data[field].every((item) => typeof item === "string")
  );
  return validStrings && validLists;
}
function generateFallbackSpecification(prompt, options) {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();
  let ecosystem = "EVM";
  let language = "Solidity";
  let framework = "Foundry";
  let contractKind = "Smart Contract Protocol";
  let targetNetworks = "Base Sepolia (Testnet)";
  if (lower.includes("solana") || lower.includes("anchor") || lower.includes("rust")) {
    ecosystem = "Solana";
    language = "Rust";
    framework = "Anchor";
    contractKind = "Solana Program";
    targetNetworks = "Solana Devnet";
  } else if (lower.includes("sui") || lower.includes("aptos") || lower.includes("move")) {
    ecosystem = "Sui";
    language = "Move";
    framework = "Sui CLI";
    contractKind = "Move Package";
    targetNetworks = "Sui Testnet";
  } else if (lower.includes("starknet") || lower.includes("cairo")) {
    ecosystem = "Starknet";
    language = "Cairo";
    framework = "Scarb / Starknet Foundry";
    contractKind = "Starknet Contract";
    targetNetworks = "Starknet Sepolia";
  } else if (lower.includes("evm") || lower.includes("solidity") || lower.includes("ethereum") || lower.includes("base") || lower.includes("arbitrum") || lower.includes("optimism") || lower.includes("polygon") || lower.includes("vault") || lower.includes("lending") || lower.includes("staking") || lower.includes("yield") || lower.includes("defi") || lower.includes("token") || lower.includes("contract") || lower.includes("chain") || lower.includes("escrow") || lower.includes("router") || lower.includes("liquidity")) {
    ecosystem = "EVM";
    language = "Solidity";
    framework = "Foundry";
    if (lower.includes("mainnet")) {
      targetNetworks = "Base Mainnet (Production)";
    } else if (lower.includes("devnet") || lower.includes("local") || lower.includes("anvil")) {
      targetNetworks = "Local Anvil (Devnet)";
    } else {
      targetNetworks = "Base Sepolia (Testnet)";
    }
  } else {
    ecosystem = "Web Full-Stack";
    language = "TypeScript";
    framework = "React / Node.js";
    contractKind = "Web Application";
    targetNetworks = "Cloud Run, Vercel";
  }
  if (options?.targetNetwork && options.targetNetwork.trim()) {
    targetNetworks = options.targetNetwork.trim();
  } else {
    const matchNet = cleanPrompt.match(/(?:Target Network|Target Networks|Network|Jaringan|Pilih target network[^\n\r?:]*\??)\s*[:=]\s*([^\n\r]+)/i);
    if (matchNet && matchNet[1] && matchNet[1].trim()) {
      targetNetworks = matchNet[1].trim();
    }
  }
  if (ecosystem !== "Web Full-Stack") {
    if (lower.includes("lend") || lower.includes("borrow") || lower.includes("collateral")) {
      contractKind = "Lending Protocol & Money Market";
    } else if (lower.includes("stak") || lower.includes("reward")) {
      contractKind = "Liquid Staking & Reward Pool";
    } else if (lower.includes("vault") || lower.includes("yield") || lower.includes("4626")) {
      contractKind = "ERC-4626 Yield Vault";
    } else if (lower.includes("nft") || lower.includes("market") || lower.includes("auction")) {
      contractKind = "NFT & Asset Marketplace";
    } else if (lower.includes("escrow")) {
      contractKind = "Conditional Escrow Protocol";
    } else if (lower.includes("swap") || lower.includes("amm") || lower.includes("dex") || lower.includes("router")) {
      contractKind = "Automated Liquidity Router";
    } else if (lower.includes("timelock") || lower.includes("multisig") || lower.includes("gov")) {
      contractKind = "Governance Timelock Controller";
    }
  }
  let projectName = "";
  if (options?.projectName && options.projectName.trim()) {
    projectName = options.projectName.trim();
  } else {
    const matchName = cleanPrompt.match(/(?:Project Name|Nama Project|Contract Name|Mau dikasih nama apa project smart contract nya\??)\s*[:=]\s*([^\n\r]+)/i);
    if (matchName && matchName[1] && matchName[1].trim()) {
      projectName = matchName[1].trim();
    } else {
      const firstSentence = cleanPrompt.split(/[.\n]/)[0] || "Smart Contract Protocol";
      projectName = firstSentence.replace(/^(build|create|deploy|make|design)\s+(an?|the)?\s*/i, "").trim();
    }
  }
  if (!projectName || projectName.length < 2) {
    projectName = contractKind;
  }
  if (projectName.length > 36) {
    projectName = projectName.slice(0, 33) + "...";
  }
  const functionalRequirements = [
    "Core business logic execution according to protocol parameters",
    "Configurable administration and operational parameter controls",
    "State transition validation with emit events for all state mutations",
    "User asset deposit, withdrawal, and accounting integrity"
  ];
  if (lower.includes("fee")) {
    functionalRequirements.push("Configurable protocol fee calculation and automated treasury routing");
  }
  if (lower.includes("liquidat") || lower.includes("lend") || lower.includes("borrow")) {
    functionalRequirements.push("Collateral health checks and liquidation keeper incentives");
  }
  if (lower.includes("pause") || lower.includes("emergency")) {
    functionalRequirements.push("Emergency circuit breaker pausable state to halt sensitive operations");
  }
  if (lower.includes("reward") || lower.includes("stake")) {
    functionalRequirements.push("Accumulative rewardPerShare index for constant O(1) reward distribution");
  }
  return {
    projectName,
    ecosystem,
    language,
    framework,
    contractKind,
    targetNetworks,
    complexity: cleanPrompt.length > 200 ? "High" : "Medium",
    summary: `Structured specification generated from user requirements: "${cleanPrompt.slice(0, 160)}${cleanPrompt.length > 160 ? "..." : ""}". Architected with security checks, role-based access, and comprehensive test suites.`,
    functionalRequirements,
    securityRequirements: [
      "Access control guarding all administrative and emergency entry points",
      "Reentrancy protection across state-mutating external calls",
      "Pausable emergency kill-switch for incident response",
      "Integer overflow/underflow checks and strict balance invariants"
    ],
    outOfScope: [
      "Off-chain indexing services outside of basic event emission",
      "Fiat on-ramps and external non-crypto payment gateways"
    ],
    assumptions: [
      "Deployed on standard EVM or target VM compatible testnets prior to mainnet",
      "Caller pays required gas fees per transaction invocation"
    ]
  };
}

// src/api/specification.ts
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
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const projectName = typeof body?.projectName === "string" ? body.projectName.trim() : void 0;
  const targetNetwork = typeof body?.targetNetwork === "string" ? body.targetNetwork.trim() : void 0;
  if (!prompt) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "A project prompt is required." }));
    return;
  }
  if (prompt.length > 24e3) {
    res.statusCode = 413;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "The project prompt is too long." }));
    return;
  }
  try {
    const specification = await generateSpecification(prompt, { projectName, targetNetwork });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ specification }));
  } catch (error) {
    console.error("Specification generation failed in Vercel function:", error);
    if (error instanceof SpecificationGenerationError) {
      res.statusCode = error.statusCode;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
    const message = error instanceof Error ? error.message : "Could not generate a specification. Please try again.";
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
}
export {
  handler as default
};
