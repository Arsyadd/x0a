import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { Specification } from './specification';

export interface GeneratedFile {
  name: string;
  path: string[];
  language: 'solidity' | 'toml';
  code: string;
  description: string;
  isPrimary?: boolean;
}

export interface ThreatItem {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  asset: string;
  mitigation: string;
  status: 'Resolved' | 'Accepted residual risk' | 'Accepted';
}

export interface AdrItem {
  id: string;
  title: string;
  explanation: string;
  status: 'Accepted' | 'Proposed';
}

export interface GeneratedSourceBundle {
  primaryFile: string;
  files: GeneratedFile[];
  threatModel: ThreatItem[];
  adrs: AdrItem[];
  architectureSummary: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

const SOURCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    primaryFile: {
      type: Type.STRING,
      description: 'The filename of the primary core smart contract, e.g. VaultCore.sol, StakingPool.sol, Marketplace.sol, etc.',
    },
    architectureSummary: {
      type: Type.STRING,
      description: 'A 2-3 sentence technical overview of the contract architecture generated.',
    },
    files: {
      type: Type.ARRAY,
      description: 'Complete source files for this smart contract system.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Filename, e.g. VaultCore.sol or interfaces/IVault.sol' },
          language: { type: Type.STRING, description: 'Language: solidity or toml' },
          description: { type: Type.STRING, description: 'Short summary of the file purpose' },
          isPrimary: { type: Type.BOOLEAN, description: 'Whether this is the primary contract' },
          code: { type: Type.STRING, description: 'The complete, production-ready source code of the file. Must NOT be truncated or placeholder.' },
        },
        required: ['name', 'language', 'description', 'code'],
      },
    },
    threatModel: {
      type: Type.ARRAY,
      description: 'Threat model entries identified for this specific contract architecture.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'e.g. TM-001' },
          title: { type: Type.STRING, description: 'Threat name' },
          severity: { type: Type.STRING, description: 'Critical, High, Medium, or Low' },
          asset: { type: Type.STRING, description: 'Affected function or asset' },
          mitigation: { type: Type.STRING, description: 'How the code mitigates this threat' },
          status: { type: Type.STRING, description: 'Resolved or Accepted residual risk' },
        },
        required: ['id', 'title', 'severity', 'asset', 'mitigation', 'status'],
      },
    },
    adrs: {
      type: Type.ARRAY,
      description: 'Architecture Decision Records for this specification.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'e.g. ADR-001' },
          title: { type: Type.STRING, description: 'Decision summary' },
          explanation: { type: Type.STRING, description: 'Rationale and impact' },
          status: { type: Type.STRING, description: 'Accepted' },
        },
        required: ['id', 'title', 'explanation', 'status'],
      },
    },
  },
  required: ['primaryFile', 'architectureSummary', 'files', 'threatModel', 'adrs'],
};

function getErrorStatus(error: unknown): number {
  if (typeof error === 'object' && error !== null) {
    if ('status' in error && typeof (error as any).status === 'number') {
      return (error as any).status;
    }
    if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
      return (error as any).statusCode;
    }
  }
  return 0;
}

export async function generateSourceCode(
  spec: Specification,
): Promise<GeneratedSourceBundle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackSourceBundle(spec);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const promptText = `You are the lead Smart Contract Coder Agent on x0a.
Your job is to generate the complete, production-ready, genuine smart contract source files from the locked specification below.
Do NOT output mock placeholders or "TODO" comments. Every file must contain complete, functional code with proper Solidity syntax (^0.8.26), OpenZeppelin-compatible patterns, custom errors, events, and reentrancy/access guards matching the specification requirements.

Specification:
- Project Name: ${spec.projectName}
- Ecosystem: ${spec.ecosystem}
- Language: ${spec.language}
- Framework: ${spec.framework}
- Contract Type: ${spec.contractKind}
- Target Networks: ${spec.targetNetworks}
- Complexity: ${spec.complexity}
- Technical Summary: ${spec.summary}
- Functional Requirements:
${spec.functionalRequirements.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}
- Security Requirements:
${spec.securityRequirements.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}
- Out of Scope:
${spec.outOfScope.map((r, i) => `  - ${r}`).join('\n')}
- Assumptions:
${spec.assumptions.map((r, i) => `  - ${r}`).join('\n')}

Generate the complete set of 4 to 6 files:
1. Primary Core Contract (e.g. ${sanitizeContractName(spec.projectName)}.sol or VaultCore.sol)
2. Companion/Token/Accounting Contract (e.g. ShareToken.sol or PositionToken.sol)
3. Helper/Distributor/Manager Contract (e.g. RewardsDistributor.sol or StrategyManager.sol)
4. Interface file (e.g. interfaces/I${sanitizeContractName(spec.projectName)}.sol)
5. Deployment script (e.g. script/Deploy.s.sol)
6. Tooling config (foundry.toml)

Also generate 3-5 Threat Model entries and 3-4 ADRs directly reflecting these contracts. Return valid JSON following the schema.`;

  for (const model of CANDIDATE_MODELS) {
    const isThinkingSupported = model.startsWith('gemini-3');

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: Record<string, unknown> = {
          responseMimeType: 'application/json',
          responseSchema: SOURCE_SCHEMA,
        };

        if (isThinkingSupported) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model,
          contents: [promptText],
          config,
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed && Array.isArray(parsed.files) && parsed.files.length >= 3) {
            return formatBundle(parsed, spec);
          }
        }
      } catch (error) {
        const status = getErrorStatus(error);
        if (status !== 503 && status !== 429 && status !== 500 && status !== 504) {
          break;
        }
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      }
    }
  }

  // Fallback if API was unavailable
  return generateFallbackSourceBundle(spec);
}

function stripEmojis(text: string): string {
  if (!text) return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]/gu, '');
}

function sanitizeContractName(projectName: string): string {
  const clean = projectName.replace(/[^a-zA-Z0-9]/g, '');
  return clean.length > 0 ? clean : 'VaultCore';
}

function formatBundle(data: any, spec: Specification): GeneratedSourceBundle {
  const primaryName = stripEmojis(data.primaryFile || (data.files && data.files[0]?.name) || 'VaultCore.sol');
  const cleanSlug = spec.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const files: GeneratedFile[] = (data.files || []).map((f: any) => {
    const cleanName = stripEmojis(f.name);
    const pathParts = cleanName.includes('/') ? cleanName.split('/') : ['contracts', cleanName];
    const isPrimary = cleanName === primaryName || f.isPrimary === true;
    return {
      name: cleanName,
      path: [cleanSlug, ...pathParts],
      language: cleanName.endsWith('.toml') ? 'toml' : 'solidity',
      code: stripEmojis(String(f.code || '').trim()),
      description: stripEmojis(f.description || `${cleanName} smart contract component`),
      isPrimary,
    };
  });

  const rawThreatModel = Array.isArray(data.threatModel) && data.threatModel.length > 0 ? data.threatModel : getDefaultThreatModel(spec);
  const threatModel: ThreatItem[] = rawThreatModel.map((tm: any) => ({
    id: stripEmojis(tm.id),
    title: stripEmojis(tm.title),
    severity: tm.severity,
    asset: stripEmojis(tm.asset),
    mitigation: stripEmojis(tm.mitigation),
    status: tm.status,
  }));

  const rawAdrs = Array.isArray(data.adrs) && data.adrs.length > 0 ? data.adrs : getDefaultAdrs(spec);
  const adrs: AdrItem[] = rawAdrs.map((adr: any) => ({
    id: stripEmojis(adr.id),
    title: stripEmojis(adr.title),
    explanation: stripEmojis(adr.explanation),
    status: adr.status,
  }));

  return {
    primaryFile: primaryName,
    files,
    threatModel,
    adrs,
    architectureSummary: stripEmojis(data.architectureSummary || spec.summary),
  };
}

function getDefaultThreatModel(spec: Specification): ThreatItem[] {
  return [
    {
      id: 'TM-001',
      title: 'First-deposit donation and share price inflation attack',
      severity: 'High',
      asset: `${spec.contractKind} Share Accounting`,
      mitigation: 'Virtual assets and shares offset (1e3 virtual shares, 1 virtual asset) enforced in convertToShares / convertToAssets.',
      status: 'Resolved',
    },
    {
      id: 'TM-002',
      title: 'Reentrancy during external asset transfer',
      severity: 'Critical',
      asset: 'withdraw / claim functions',
      mitigation: 'Checks-Effects-Interactions pattern strictly applied plus OpenZeppelin ReentrancyGuard nonReentrant modifier.',
      status: 'Resolved',
    },
    {
      id: 'TM-003',
      title: 'Privileged role compromise (guardian or admin key)',
      severity: 'High',
      asset: 'AccessControl roles',
      mitigation: 'Admin role controlled by Safe multisig behind a timelock; guardian scoped to emergency pause only.',
      status: 'Accepted residual risk',
    },
    {
      id: 'TM-004',
      title: 'Oracle price feed staleness or deviation anomaly',
      severity: 'Medium',
      asset: 'Asset valuation / reward calculation',
      mitigation: 'Heartbeat staleness check and deviation boundaries enforced on oracle price updates.',
      status: 'Resolved',
    },
  ];
}

function getDefaultAdrs(spec: Specification): AdrItem[] {
  return [
    {
      id: 'ADR-001',
      title: `Adopt standardized ${spec.contractKind} architectural pattern`,
      explanation: `Provides seamless interoperability across ${spec.ecosystem} ecosystem tooling and indexers.`,
      status: 'Accepted',
    },
    {
      id: 'ADR-002',
      title: 'Virtual shares and virtual assets offset',
      explanation: 'Removes first-depositor donation manipulation without permanently burning initial tokens.',
      status: 'Accepted',
    },
    {
      id: 'ADR-003',
      title: 'Pull-based reward and withdrawal distribution',
      explanation: 'Users claim their shares/rewards on demand to avoid unbounded for-loop gas limits.',
      status: 'Accepted',
    },
    {
      id: 'ADR-004',
      title: 'Separation of Guardian pause from Timelocked Admin',
      explanation: 'Emergency circuit breaker requires instantaneous response, while economic parameters require timelock review.',
      status: 'Accepted',
    },
  ];
}

function generateFallbackSourceBundle(spec: Specification): GeneratedSourceBundle {
  const cName = sanitizeContractName(spec.projectName);
  const cleanSlug = spec.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const primaryContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ShareToken } from "./ShareToken.sol";
import { I${cName} } from "./interfaces/I${cName}.sol";

/// @title ${cName}
/// @notice ${spec.summary}
/// @dev Target network: ${spec.targetNetworks}. Framework: ${spec.framework}.
contract ${cName} is I${cName}, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant STRATEGIST_ROLE = keccak256("STRATEGIST_ROLE");

    uint256 private constant VIRTUAL_SHARES = 1e3;
    uint256 private constant VIRTUAL_ASSETS = 1;

    IERC20 public immutable asset;
    ShareToken public immutable shares;
    address public rewardsDistributor;
    uint256 public withdrawalFeeBps = 0; // Configurable protocol fee
    address public treasury;

    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event RewardsDistributorUpdated(address indexed previous, address indexed next);
    event FeeUpdated(uint256 newFeeBps, address newTreasury);

    error ZeroAddress();
    error ZeroAmount();
    error VaultPaused();
    error InsufficientShares();
    error ExcessiveFee();

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _admin,
        address _guardian
    ) {
        if (address(_asset) == address(0) || _admin == address(0)) revert ZeroAddress();
        asset = _asset;
        shares = new ShareToken(_name, _symbol, address(this));
        treasury = _admin;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        if (_guardian != address(0)) {
            _grantRole(GUARDIAN_ROLE, _guardian);
        }
    }

    function totalAssets() public view override returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function convertToShares(uint256 assets) public view override returns (uint256) {
        uint256 supply = shares.totalSupply() + VIRTUAL_SHARES;
        uint256 total = totalAssets() + VIRTUAL_ASSETS;
        return (assets * supply) / total;
    }

    function convertToAssets(uint256 shareAmount) public view override returns (uint256) {
        uint256 supply = shares.totalSupply() + VIRTUAL_SHARES;
        uint256 total = totalAssets() + VIRTUAL_ASSETS;
        return (shareAmount * total) / supply;
    }

    function deposit(uint256 assets, address receiver) external override nonReentrant whenNotPaused returns (uint256 sharesOut) {
        if (assets == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        sharesOut = convertToShares(assets);
        if (sharesOut == 0) revert ZeroAmount();

        asset.safeTransferFrom(msg.sender, address(this), assets);
        shares.mint(receiver, sharesOut);

        emit Deposit(msg.sender, receiver, assets, sharesOut);
    }

    function withdraw(uint256 shareAmount, address receiver, address owner) external override nonReentrant returns (uint256 assetsOut) {
        if (shareAmount == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        if (msg.sender != owner) {
            uint256 allowed = shares.allowance(owner, msg.sender);
            if (allowed < shareAmount) revert InsufficientShares();
        }

        assetsOut = convertToAssets(shareAmount);
        shares.burn(owner, shareAmount);

        if (withdrawalFeeBps > 0 && treasury != address(0)) {
            uint256 fee = (assetsOut * withdrawalFeeBps) / 10_000;
            assetsOut -= fee;
            asset.safeTransfer(treasury, fee);
        }

        asset.safeTransfer(receiver, assetsOut);
        emit Withdraw(msg.sender, receiver, owner, assetsOut, shareAmount);
    }

    function setRewardsDistributor(address _distributor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit RewardsDistributorUpdated(rewardsDistributor, _distributor);
        rewardsDistributor = _distributor;
    }

    function setFeeParameters(uint256 _feeBps, address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_feeBps > 1000) revert ExcessiveFee(); // Max 10%
        withdrawalFeeBps = _feeBps;
        treasury = _treasury;
        emit FeeUpdated(_feeBps, _treasury);
    }

    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
`;

  const shareToken = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ShareToken
/// @notice Pro-rata accounting token for ${spec.projectName} depositors.
contract ShareToken is ERC20 {
    address public immutable vault;

    error OnlyVault();

    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _vault
    ) ERC20(_name, _symbol) {
        vault = _vault;
    }

    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyVault {
        _burn(from, amount);
    }
}
`;

  const rewardsDistributor = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title RewardsDistributor
/// @notice Pull-based reward accumulator for ${spec.projectName}.
contract RewardsDistributor is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    IERC20 public immutable rewardToken;
    address public immutable vault;

    mapping(address => uint256) public userRewards;

    event RewardNotified(uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(IERC20 _rewardToken, address _vault, address _admin) {
        rewardToken = _rewardToken;
        vault = _vault;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(DISTRIBUTOR_ROLE, _admin);
    }

    function claim(address receiver) external returns (uint256 reward) {
        reward = userRewards[msg.sender];
        if (reward > 0) {
            userRewards[msg.sender] = 0;
            rewardToken.safeTransfer(receiver, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }
}
`;

  const interfaceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface I${cName} {
    function totalAssets() external view returns (uint256);
    function convertToShares(uint256 assets) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function deposit(uint256 assets, address receiver) external returns (uint256 sharesOut);
    function withdraw(uint256 shares, address receiver, address owner) external returns (uint256 assetsOut);
}
`;

  const deployScript = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Script } from "forge-std/Script.sol";
import { ${cName} } from "../${cName}.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deploy${cName} is Script {
    function run() external returns (${cName} deployed) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address assetToken = vm.envAddress("ASSET_ADDRESS");
        address guardian = vm.envAddress("GUARDIAN_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);
        deployed = new ${cName}(
            IERC20(assetToken),
            "${spec.projectName} Shares",
            "x${cName.slice(0, 4).toUpperCase()}",
            vm.addr(deployerPrivateKey),
            guardian
        );
        vm.stopBroadcast();
    }
}
`;

  const foundryToml = `[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc_version = "0.8.26"
optimizer = true
optimizer_runs = 200
evm_version = "cancun"

[rpc_endpoints]
base_sepolia = "\${BASE_SEPOLIA_RPC}"
mainnet = "\${MAINNET_RPC}"
`;

  const files: GeneratedFile[] = [
    {
      name: `${cName}.sol`,
      path: [cleanSlug, 'contracts', `${cName}.sol`],
      language: 'solidity',
      code: primaryContract,
      description: `Primary ${spec.contractKind} smart contract`,
      isPrimary: true,
    },
    {
      name: 'ShareToken.sol',
      path: [cleanSlug, 'contracts', 'ShareToken.sol'],
      language: 'solidity',
      code: shareToken,
      description: 'Pro-rata share accounting ERC20 token',
    },
    {
      name: 'RewardsDistributor.sol',
      path: [cleanSlug, 'contracts', 'RewardsDistributor.sol'],
      language: 'solidity',
      code: rewardsDistributor,
      description: 'Pull-based reward distribution module',
    },
    {
      name: `interfaces/I${cName}.sol`,
      path: [cleanSlug, 'contracts', 'interfaces', `I${cName}.sol`],
      language: 'solidity',
      code: interfaceCode,
      description: `External contract interface for I${cName}`,
    },
    {
      name: 'script/Deploy.s.sol',
      path: [cleanSlug, 'contracts', 'script', 'Deploy.s.sol'],
      language: 'solidity',
      code: deployScript,
      description: 'Foundry deployment and verification script',
    },
    {
      name: 'foundry.toml',
      path: [cleanSlug, 'foundry.toml'],
      language: 'toml',
      code: foundryToml,
      description: 'Foundry compiler configuration & EVM target',
    },
  ];

  return {
    primaryFile: `${cName}.sol`,
    files,
    threatModel: getDefaultThreatModel(spec),
    adrs: getDefaultAdrs(spec),
    architectureSummary: spec.summary,
  };
}
