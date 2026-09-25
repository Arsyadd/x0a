// @ts-nocheck
export const SVG_VB = 'viewBox="0 0 600 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"';

export const PHASES = [
  { name: 'Understand', a: '#2A2BD6', b: '#0C0F2B', c: '#B7A8FF', d: '#8E7DFF' },
  { name: 'Build',       a: '#2A2BD6', b: '#0C0F2B', c: '#B7A8FF', d: '#8E7DFF' },
  { name: 'Prove',       a: '#2A2BD6', b: '#0C0F2B', c: '#B7A8FF', d: '#8E7DFF' },
  { name: 'Ship',        a: '#2A2BD6', b: '#0C0F2B', c: '#B7A8FF', d: '#8E7DFF' },
  { name: 'Operate',     a: '#2A2BD6', b: '#0C0F2B', c: '#B7A8FF', d: '#8E7DFF' }
];

export const STAGES = [
  { phase: 0, name: 'Intent', agent: 'Requirement Agent', out: 'A classified project and target VM',
    text: 'You describe what you want in plain language, such as \u201CBuild a lending protocol\u201D or \u201CCreate a Solana staking program\u201D. x0a works out the target ecosystem and chain, the contract type, the users, assets, permissions and business rules.',
    chips: ['Desired behavior', 'Target ecosystem', 'Target chain', 'Contract type', 'Users', 'Assets', 'Permissions', 'Business rules', 'External dependencies', 'Security assumptions', 'Upgradeability'] },
  { phase: 0, name: 'Requirements', agent: 'Requirement Agent', out: 'Completeness status and open questions',
    text: 'It asks only the questions that materially affect implementation, security, economics or deployment. Before anything is locked, it checks for missing, contradictory, ambiguous, unsafe, impossible, chain-incompatible and cost-sensitive requirements.',
    chips: ['Asset model', 'User roles', 'Admin authority', 'Upgradeability', 'Emergency controls', 'Fees', 'Oracle source', 'Cross-chain behavior', 'Governance', 'Finality expectations', 'Security tier'] },
  { phase: 0, name: 'Specification', agent: 'Requirement Agent', out: 'A locked, versioned specification',
    text: 'Approved requirements become an immutable specification snapshot: SPEC-v1, SPEC-v2 and so on. Every downstream artifact references the specification version it was built from.',
    chips: ['Project intent', 'Functional', 'Non-functional', 'Security', 'Economic', 'Chain', 'VM', 'Deployment', 'Monitoring', 'Upgrade', 'Acceptance criteria'] },
  { phase: 0, name: 'Threat model', agent: 'Threat Model Agent', out: 'A threat model and security invariants',
    text: 'Threat modeling is a first-class artifact, not an afterthought. x0a maps assets, actors and trust boundaries, then writes the invariants that must always hold, such as \u201Cunauthorized users cannot mint\u201D.',
    chips: ['Assets', 'Actors', 'Trust boundaries', 'Attack surfaces', 'Privileged roles', 'Oracle dependencies', 'Cross-chain dependencies', 'Economic assumptions', 'Threat scenarios', 'Mitigations', 'Required tests'] },
  { phase: 0, name: 'Architecture', agent: 'Architect Agent', out: 'Architecture, state model and ADRs',
    text: 'The Architect turns the specification into module boundaries, a state model, an authority model and an upgrade strategy, using the target VM\u2019s native design patterns. Each important decision becomes an architectural decision record.',
    chips: ['Module boundaries', 'Interfaces', 'State model', 'Authority model', 'Dependency graph', 'Upgrade strategy', 'Testing strategy', 'Deployment strategy', 'Monitoring strategy', 'ADRs'] },
  { phase: 1, name: 'Code', agent: 'Coder Agent', out: 'Source, tests and configuration',
    text: 'Complete native projects, not EVM-shaped approximations: Solidity with Foundry, Anchor programs, Move packages, CosmWasm contracts, Cairo, Plutus or Aiken validators, and the native SDK for any other ecosystem an adapter exposes.',
    chips: ['Solidity', 'Foundry', 'Anchor', 'Move packages', 'CosmWasm', 'Cairo', 'Plutus or Aiken', 'Tests', 'Deployment scripts'] },
  { phase: 1, name: 'Build', agent: 'Isolated build workers', out: 'An artifact hash and a reproducible build manifest',
    text: 'Generated code is untrusted, so it only runs in disposable, isolated workers with pinned toolchains and no secrets. Every build records a manifest so it can be reproduced later.',
    chips: ['Ephemeral containers', 'Non-root execution', 'CPU and memory limits', 'Network allowlist', 'No master secrets', 'No wallet credentials', 'Immutable toolchains', 'Artifact hashing', 'Full logs'] },
  { phase: 1, name: 'Test', agent: 'Tester and Security Agent', out: 'Test evidence',
    text: 'A multi-layer testing engine runs everything from compilation and unit tests to fuzzing, invariant checks and economic attack analysis, using the tools native to each ecosystem.',
    chips: ['Compilation', 'Unit', 'Integration', 'Regression', 'Property', 'Invariant', 'Fuzz', 'Differential', 'Static analysis', 'Dependency analysis', 'Adversarial', 'Economic attack', 'Chain-specific checks'] },
  { phase: 2, name: 'Security', agent: 'Tester and Security Agent', out: 'Findings backed by evidence',
    text: 'Every finding carries severity, confidence, root cause, an exploit scenario and a regression test. AI claims without evidence are marked UNVERIFIED and can never count as a pass. Validated findings enter an auto-fix loop, capped at three attempts before a human is required.',
    chips: ['Critical', 'High', 'Medium', 'Low', 'Informational', 'Unverified', 'Auto-fix, 3 attempts'] },
  { phase: 2, name: 'Adversarial review', agent: 'Red Team and Economic Security Agents', out: 'Attack scenarios and reviewer findings',
    text: 'A red team agent actively tries to break the system and produces reproducible attack scenarios. Economic and dependency reviewers challenge the assumptions, and disagreements are settled by evidence and tool output, never by vote.',
    chips: ['Access-control bypass', 'Reentrancy', 'Oracle manipulation', 'Flash-loan paths', 'Signature replay', 'PDA validation', 'Capability abuse', 'CPI abuse', 'Upgrade attacks', 'Initialization attacks', 'Cross-chain messages', 'Griefing'] },
  { phase: 2, name: 'Simulation', agent: 'Simulation Agent', out: 'Simulation evidence',
    text: 'Simulation is ecosystem-native: local forks on EVM, a local validator on Solana, transaction blocks on Sui. The Scenario Lab runs multi-step sequences generated from the threat model and the state model, and every run records evidence.',
    chips: ['Deploy', 'Initialize', 'Deposit', 'Manipulate oracle', 'Borrow', 'Update price', 'Withdraw', 'Repay'] },
  { phase: 3, name: 'Policy gate', agent: 'Deterministic policy engine', out: 'A gate decision',
    text: 'A deterministic gate, separate from every AI agent, decides whether deployment may proceed. \u201CThe AI says it is safe\u201D is never an input. Policies are configurable, and every change to them is auditable.',
    chips: ['No critical findings', 'No high findings', 'Tests pass', 'Invariants pass', 'Fuzzing passes', 'Simulation passes', 'Artifact hash matches', 'Specification approved', 'Target approved', 'RPC healthy'] },
  { phase: 3, name: 'Wallet approval', agent: 'Deployer Agent', out: 'An unsigned transaction and its preview',
    text: 'The Deployer prepares an unsigned transaction and shows a full preview. You approve it in your own wallet. It can never ask for private keys or seed phrases, and it can never broadcast on its own.',
    chips: ['Network', 'Target address', 'Parameters', 'Expected state changes', 'Fees', 'Artifact hash', 'Simulation result', 'Relevant risks'] },
  { phase: 3, name: 'Deployment', agent: 'Deployer Agent', out: 'A deployment record',
    text: 'After your authorization the transaction is broadcast and followed to finality, and chain state is reconciled. An unknown transaction is never silently retried, and there is no silent mainnet deployment.',
    chips: ['Explicit target confirmation', 'Final simulation', 'Track finality', 'Reconcile chain state', 'No silent retries', 'Post-deployment check'] },
  { phase: 4, name: 'Verification', agent: 'Verification Agent', out: 'A verification report',
    text: 'x0a compares what it built with what is on chain: source, metadata, compiler configuration, the bytecode or program artifact, and the deployed state. A mismatch raises DEPLOYMENT_INTEGRITY_ERROR and stops automatic verification.',
    chips: ['Source', 'Metadata', 'Bytecode or program', 'Compiler configuration', 'Owner and admin', 'Roles', 'Upgrade authority', 'Initialization', 'Explorer publication'] },
  { phase: 4, name: 'Monitoring', agent: 'Incident and Monitor Agent', out: 'Alerts and drift reports',
    text: 'Live monitoring watches transactions, asset movements, role and ownership changes, upgrades and oracle anomalies, and stays read-only with respect to chain state. It also compares live behavior to the approved specification: if the spec says only Treasury can withdraw and another role does, that is a drift alert.',
    chips: ['Failed transactions', 'Asset movements', 'Role changes', 'Ownership changes', 'Upgrade events', 'Pause events', 'Oracle anomalies', 'Liquidity anomalies', 'Specification drift'] },
  { phase: 4, name: 'Incident response', agent: 'Incident and Monitor Agent', out: 'An incident report and a replay',
    text: 'Incidents are detected, classified and reconstructed with forensic evidence preserved. x0a recommends a response, but any mitigation waits for your approval, and where technically possible the incident can be replayed in an isolated environment.',
    chips: ['Detection', 'Evidence collection', 'Impact analysis', 'Attack path', 'Recommended response', 'User approval', 'Mitigation', 'Postmortem'] },
  { phase: 4, name: 'Continuous improvement', agent: 'Orchestrator and security memory', out: 'Security memory for future runs',
    text: 'Every confirmed incident becomes a root cause, a regression test, a security rule, an invariant and a threat model update. Security knowledge is never discarded, and future versions automatically check for historical vulnerabilities.',
    chips: ['Root cause', 'Regression test', 'Security rule', 'Invariant', 'Threat model update', 'Monitoring rule'] }
];

export const AGENTS = [
  { name: 'Orchestrator', role: 'Central coordination',
    does: ['Inspects the project state and selects the agents it needs', 'Orders execution, keeps context and resolves conflicts between agents', 'Chooses verification depth and enforces budgets and permissions', 'Triggers re-review when something changes'],
    cannot: ['Bypass deterministic security gates'] },
  { name: 'Requirement', role: 'Turns intent into a specification',
    does: ['Interprets intent and detects the target VM and chain', 'Asks only the questions that change implementation, security or cost', 'Detects ambiguity and contradictions', 'Versions the locked specification with acceptance criteria'],
    reads: ['User intent', 'Project history', 'Chain capabilities'], writes: ['Specification'] },
  { name: 'Architect', role: 'Designs the system',
    does: ['Module boundaries, state model and authority model', 'Upgrade, testing, deployment and monitoring plans', 'Records architectural decision records', 'Uses the native design patterns of the target VM'] },
  { name: 'Threat Model', role: 'Designs the attacks out',
    does: ['Identifies assets, actors, trust boundaries and attack surfaces', 'Defines security properties and mitigations', 'Defines the security tests that must exist', 'Feeds the Coder, Tester, Red Team and Simulator agents'] },
  { name: 'Coder', role: 'Writes native projects',
    does: ['Generates complete projects for the target ecosystem', 'Solidity and Foundry, Anchor, Move, CosmWasm, Cairo, Aiken and more', 'Uses the native SDK and toolchain the adapter exposes'],
    reads: ['Specification', 'Architecture', 'Threat model'], writes: ['Source', 'Tests', 'Configuration'] },
  { name: 'Tester and Security', role: 'Runs the security engine',
    does: ['Thirteen testing layers, from compilation to chain-specific checks', 'Runs the security tools native to each ecosystem', 'Records every finding with severity, root cause and evidence', 'Marks claims without evidence as UNVERIFIED'],
    reads: ['Source', 'Build', 'Test output', 'Dependencies'], writes: ['Findings', 'Security evidence'] },
  { name: 'Red Team', role: 'Tries to break it',
    does: ['Attempts access-control bypass, reentrancy, oracle and flash-loan attacks', 'Covers PDA, capability and cross-program abuse', 'Produces reproducible attack scenarios when possible'] },
  { name: 'Economic Security', role: 'Questions the economics',
    does: ['Oracle and liquidity manipulation, liquidation incentives and insolvency', 'Separates mathematical proof, simulation evidence and heuristic AI analysis'] },
  { name: 'Simulation', role: 'Runs it before it ships',
    does: ['Ecosystem-native simulation: forks, local validators, transaction blocks', 'A Scenario Lab for multi-step attacks generated from the threat model', 'Records evidence for every simulation'] },
  { name: 'Deployer', role: 'Prepares, never signs',
    does: ['Builds native transaction payloads and estimates costs', 'Shows the expected state changes', 'Creates unsigned transactions and requests a wallet signature', 'Tracks the transaction and reconciles chain state'],
    reads: ['Approved artifact', 'Security gate', 'Deployment configuration'], writes: ['Unsigned transaction payload', 'Deployment status'],
    cannot: ['Access private keys', 'Broadcast independently', 'Bypass the gate'] },
  { name: 'Verification', role: 'Checks what is live',
    does: ['Compares source, metadata and bytecode or program artifacts', 'Compares compiler configuration and deployed state', 'Verifies authority, ownership and initialization', 'Publishes to explorers where the adapter supports it'] },
  { name: 'Incident and Monitor', role: 'Watches the live system',
    does: ['Watches transactions, role changes, upgrades and oracle anomalies', 'Detects drift from the approved specification', 'Opens incidents, collects evidence and can replay them'],
    reads: ['Live chain data', 'Deployed artifacts', 'Monitoring events'], writes: ['Alerts', 'Incident reports'], note: 'Read-only with respect to blockchain state' }
];

export const SCOPE_FAMILIES = {
  assets: { name: 'Tokens and assets', c: '#E4DEFF', blurb: 'Asset issuance and custody: fungible and non-fungible standards, multi-token systems, vesting schedules, launch mechanics and tokenized real-world assets. The Threat Model agent centers on mint authority, supply invariants and transfer restrictions before a line of code exists.' },
  yield: { name: 'Staking and yield', c: '#C7BDFF', blurb: 'Capital that earns: staking, liquid staking, restaking, vaults, lending and borrowing. The Economic Security agent checks collateralization, liquidation incentives, insolvency paths and oracle bounds ahead of the security gate.' },
  markets: { name: 'Markets and trading', c: '#9C8CFF', blurb: 'Price discovery and execution: AMMs, DEXs, order books, aggregators, routers, derivatives, perpetuals, options and prediction markets. Fork and local-validator simulation exercises real trade paths before anything reaches the policy gate.' },
  commerce: { name: 'Payments and commerce', c: '#7A67FF', blurb: 'Value moving between people: escrow, payments, subscriptions, auctions, lotteries and marketplaces. Threat models here focus on custody, settlement finality and griefing scenarios.' },
  governance: { name: 'Governance and access', c: '#4B3DFF', blurb: 'Who can do what: DAOs, governance, treasuries, timelocks, multisig, access control and identity. Every privileged role is mapped by the Threat Model agent before the Architect designs around it.' },
  infra: { name: 'Infra and cross-chain', c: '#3CD6C0', blurb: 'The connective tissue: oracle-integrated protocols, cross-contract and cross-program systems, bridges, messaging, on-chain registries and naming. The Cross-Chain agent traces message flows and replay protection across every hop.' },
  systems: { name: 'Systems architecture', c: '#FFB35C', blurb: 'How the whole thing is built: permissioned systems, upgradeable contracts, modular protocols, factories and plugin architectures. Upgrade paths get their own migration analysis before they ship.' },
  custom: { name: 'Gaming and custom logic', c: '#FF6A55', blurb: 'Everything a fixed category list was never going to capture, plus on-chain gaming systems. If it can be described, the Requirement agent can turn it into a specification, and the Coder agent can implement it natively.' }
};

export const SCOPE_ITEMS = [
  ['Fungible tokens', 'assets'], ['NFTs', 'assets'], ['Multi-token systems', 'assets'], ['Token vesting', 'assets'], ['Token launch systems', 'assets'], ['Stablecoins', 'assets'], ['RWA systems', 'assets'],
  ['Staking', 'yield'], ['Liquid staking', 'yield'], ['Restaking', 'yield'], ['Yield vaults', 'yield'], ['Lending', 'yield'], ['Borrowing', 'yield'],
  ['AMMs', 'markets'], ['DEXs', 'markets'], ['Order books', 'markets'], ['Aggregators', 'markets'], ['Routers', 'markets'], ['Derivatives', 'markets'], ['Perpetuals', 'markets'], ['Options', 'markets'], ['Prediction markets', 'markets'],
  ['Escrow', 'commerce'], ['Payments', 'commerce'], ['Subscriptions', 'commerce'], ['Auctions', 'commerce'], ['Lotteries', 'commerce'], ['Marketplaces', 'commerce'],
  ['DAOs', 'governance'], ['Governance', 'governance'], ['Treasury systems', 'governance'], ['Timelocks', 'governance'], ['Multisig systems', 'governance'], ['Access-control systems', 'governance'], ['Identity systems', 'governance'],
  ['Oracle-integrated protocols', 'infra'], ['Cross-contract systems', 'infra'], ['Cross-program systems', 'infra'], ['Cross-module systems', 'infra'], ['Bridges and messaging', 'infra'], ['On-chain registries', 'infra'], ['Naming systems', 'infra'],
  ['Permissioned systems', 'systems'], ['Upgradeable systems', 'systems'], ['Modular protocols', 'systems'], ['Factory systems', 'systems'], ['Plugin architectures', 'systems'],
  ['Gaming systems', 'custom'], ['Custom business logic', 'custom']
];

export const RULES = [
  { rule: 'AI cannot directly access private keys.', by: 'Universal Wallet Layer',
    why: 'The wallet layer holds signing authority. Agents only ever see an unsigned transaction preview, never a key or a seed phrase.' },
  { rule: 'AI cannot bypass deterministic deployment gates.', by: 'Deployment Policy Engine',
    why: 'The gate is a separate deterministic system outside every agent call. It can only be satisfied by tool output, never by an agent\u2019s own claim.' },
  { rule: 'AI cannot mark an unverified claim as verified.', by: 'Evidence System',
    why: 'Every claim carries one of five states, and only deterministic tool evidence can move a claim out of unverified.' },
  { rule: 'Deployment requires explicit user authorization.', by: 'Transaction Preview and Wallet Approval',
    why: 'x0a prepares an unsigned transaction with a full preview. Only your signature in your own wallet broadcasts it.' },
  { rule: 'Security evidence is immutable and auditable.', by: 'Evidence System and Execution ID',
    why: 'Every action carries the same execution ID, so evidence behind a claim can be traced but never edited after the fact.' },
  { rule: 'Generated code executes in isolated workers.', by: 'Build and Sandbox System',
    why: 'Untrusted generated code runs in disposable, ephemeral containers with no master secrets and no wallet credentials.' },
  { rule: 'Worker credentials are scoped.', by: 'Agent Permission System',
    why: 'Each worker receives only the narrow credentials its current step needs, never a standing key to the platform.' },
  { rule: 'Deployment retries require chain reconciliation.', by: 'Deployer Agent',
    why: 'An unknown transaction outcome is checked against chain state before anything is retried, so nothing deploys twice by accident.' },
  { rule: 'Every major action has an execution ID.', by: 'Execution ID system',
    why: 'One ID threads intent through code, tests, deployment and monitoring, so any step can be traced back to its origin.' },
  { rule: 'Every artifact has an integrity identity.', by: 'Artifact Integrity and Build Manifest',
    why: 'A source hash and a reproducible build manifest let the deployed artifact be checked against exactly what was reviewed.' },
  { rule: 'Ecosystem-specific semantics are preserved.', by: 'Universal Contract Model',
    why: 'The abstraction layer normalizes concepts across chains without erasing the native security semantics of each VM.' },
  { rule: 'New chains join through adapters, without rewriting the core.', by: 'Adapter SDK',
    why: 'A new chain registers an ecosystem, VM, language and toolchain profile. The core lifecycle engine itself never changes.' },
  { rule: 'Existing features are never removed when new adapters arrive.', by: 'Adapter conformance tests',
    why: 'Every adapter passes the same conformance suite before it ships, so older ecosystems keep working exactly as they did before.' }
];

export const JOURNEYS = [
  { name: 'A new EVM DeFi protocol', sub: 'From a sentence to mainnet',
    steps: ['Describe the protocol', 'Clarify requirements', 'Lock the specification', 'Threat model', 'Architecture', 'Solidity and Foundry project', 'Compile', 'Tests', 'Fuzzing', 'Slither', 'Red team', 'Economic analysis', 'Fork simulation', 'Security gate', 'Transaction preview', 'Wallet signature', 'Deployment', 'Verification', 'Monitoring'] },
  { name: 'A Solana program', sub: 'Accounts, PDAs and CPIs, done natively',
    steps: ['Describe the program', 'Account and state model', 'Anchor and Rust architecture', 'Generate the program', 'Compile', 'Tests', 'PDA and account security analysis', 'CPI analysis', 'Local validator simulation', 'Compute cost analysis', 'Wallet approval', 'Deployment', 'Program verification', 'Monitoring'] },
  { name: 'An existing contract', sub: 'Import, reconstruct, audit, monitor',
    steps: ['Import an address or source', 'Reconstruct the system', 'Threat model', 'Static analysis', 'Dependency analysis', 'Adversarial analysis', 'Simulation', 'Security report', 'Monitoring'] },
  { name: 'A cross-chain protocol', sub: 'One system, several native implementations',
    steps: ['Describe the intent', 'Multi-chain requirements', 'Chain graph', 'Cross-chain threat model', 'Native implementation per chain', 'Message flow simulation', 'Replay protection analysis', 'Deployment per chain', 'Verification', 'Cross-chain monitoring'] }
];

export const ARCH_P = {
  ai: { name: 'AI reasons', c: '#E4DEFF' },
  det: { name: 'Deterministic systems verify', c: '#C7BDFF' },
  chain: { name: 'The blockchain confirms', c: '#9C8CFF' },
  user: { name: 'The user authorizes', c: '#7A67FF' },
  proof: { name: 'Evidence proves', c: '#4B3DFF' }
};

export const ARCH = [
  { band: 'Reasoning', nodes: [
    { t: 'You and the frontend', d: 'Describe a project, pick an ecosystem and network, or import what already exists.', p: 'user', more: 'A prompt-first home, a project workspace, and import paths for source, ZIPs, repositories and deployed addresses.' },
    { t: 'Orchestrator', d: 'Coordinates agents, permissions, budgets and retries.', p: 'ai', more: 'Inspects project state, selects the agents, orders execution and chooses verification depth. It cannot bypass deterministic security gates.' },
    { t: 'Specialist agents', d: 'Requirements, architecture, threat models, code, security and more.', p: 'ai', more: 'Requirement, Architect, Threat Model, Coder, Tester and Security, Red Team, Economic Security, Simulation, Deployer, Verification, and Incident and Monitor. Permissions are enforced outside the LLM.' } ] },
  { band: 'Native engineering', nodes: [
    { t: 'Universal Contract Model', d: 'One ecosystem-neutral way to describe a contract system.', p: 'det', more: 'A neutral description of assets, roles, state and rules that each ecosystem adapter translates into its own native design.' },
    { t: 'Chain and VM adapters', d: 'EVM, Solana, Move, Cosmos, Starknet, NEAR, Polkadot, Cardano and more.', p: 'det', more: 'One adapter per ecosystem exposes native languages, SDKs, tools, transaction and fee models. New chains join through the Adapter SDK without rewriting the core.' },
    { t: 'Isolated workers', d: 'Disposable and scoped, with no master secrets.', p: 'det', more: 'Ephemeral containers with pinned toolchains, non-root execution, limited resources and no wallet credentials. Generated code never runs anywhere else.' } ] },
  { band: 'Proof and control', nodes: [
    { t: 'Evidence engine', d: 'Hashes, logs and results tied to an execution ID.', p: 'proof', more: 'Evidence is immutable and auditable. An AI claim without evidence is marked unverified and can never count as a pass.' },
    { t: 'Security gate', d: 'A deterministic policy engine, separate from the AI.', p: 'det', more: 'Decides whether deployment may proceed: no critical or high findings, tests, invariants and simulation passing, artifact integrity matching. Policy changes are auditable.' },
    { t: 'Wallet abstraction', d: 'You authorize in your own wallet.', p: 'user', more: 'Prepares unsigned transactions and a full preview. You sign in your own wallet, and x0a never sees private keys or seed phrases.' } ] },
  { band: 'On chain and after', nodes: [
    { t: 'Blockchain', d: 'The transaction confirms.', p: 'chain', more: 'The transaction is broadcast, followed to finality and reconciled with chain state. An unknown transaction is never silently retried.' },
    { t: 'Verification and monitoring', d: 'Artifact and state checks, then a live watch.', p: 'proof', more: 'Compares what was built with what is on chain, then watches live behavior and drift from the specification. Read-only with respect to chain state.' },
    { t: 'Incident system', d: 'Replay, postmortem and a recommended response.', p: 'proof', more: 'Detects and classifies incidents, preserves forensic evidence, can replay them in isolation, and recommends a response that waits for your approval.' },
    { t: 'Security memory', d: 'Rules and regression tests that feed every future run.', p: 'proof', more: 'Every confirmed incident becomes a root cause, a regression test, a security rule and a threat model update, checked automatically in future runs.' } ] }
];

export const LEVEL_TEXT = [
  'Registry \u2014 the network is known but no adapter executes against it yet.',
  'Read \u2014 x0a can read chain state and inspect existing deployments.',
  'Build \u2014 the Coder agent can generate and compile native code for this ecosystem.',
  'Test \u2014 native test frameworks and security tooling run against generated code.',
  'Simulate \u2014 ecosystem-native simulation is available: forks, local validators or transaction blocks.',
  'Deploy \u2014 x0a can prepare a transaction and wait for your wallet authorization on real networks.',
  'Verify \u2014 deployed artifacts and on-chain state are checked against what was built.',
  'Monitor \u2014 continuous monitoring and incident detection run against live deployments.',
  'Full engineering \u2014 the complete lifecycle, including upgrades, migration, cross-chain analysis and incident replay.'
];

export const PROMPTS = [
  { q: 'Build a lending protocol.', tags: ['EVM', 'Solidity', 'Foundry', 'Fork simulation'] },
  { q: 'Create a Solana staking program.', tags: ['Solana', 'Anchor', 'PDA analysis', 'Local validator'] },
  { q: 'Create a Move-based asset protocol.', tags: ['Move', 'Objects', 'Capabilities'] },
  { q: 'Create an NFT marketplace.', tags: ['Asks which chain', 'Asks about custody'] },
  { q: 'Build a cross-chain treasury.', tags: ['Cross-chain', 'Replay protection', 'Finality assumptions'] }
];

export const WS_ECO = {
  evm: { name: 'EVM', family: 'EVM', lang: 'Solidity', file: 'Vault.sol', tools: 'Foundry, Slither',
    consensus: 'Proof of stake \u00b7 ~12s blocks', explorer: 'Etherscan', gas: 'ETH',
    net: { Devnet: 'Local Anvil devnet', Testnet: 'Sepolia testnet', Mainnet: 'Ethereum mainnet' },
    fee: { Devnet: 'Free \u00b7 local chain', Testnet: '~0.004 test ETH', Mainnet: '~0.004 ETH' },
    target: '0x8a1f\u2026b3d2', finding: 'Reentrancy in withdraw', rule: 'Update state before external calls',
    cmd: { build: ['forge build', 'Compiler run successful'], test: ['forge test --fuzz-runs 256', 'Suite result: ok. 24 passed, 0 failed'], scan: ['slither .', '1 result found: reentrancy-eth (high)'], fix: ['forge test --match-test Reentrancy', '[PASS] test_ReentrancyRegression()'], sim: ['forge test --fork-url $RPC', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'function withdraw(uint a) external {'], [' ', '  require(bal[msg.sender] >= a);'], ['-', '  (bool ok,) = msg.sender.call{value: a}("");'], ['-', '  bal[msg.sender] -= a;'], ['+', '  bal[msg.sender] -= a;'], ['+', '  (bool ok,) = msg.sender.call{value: a}("");'], ['+', '  require(ok);'], [' ', '}']],
    files: ['src/Vault.sol', 'test/Vault.t.sol', 'foundry.toml'], deps: ['forge-std, pinned', 'openzeppelin-contracts, pinned'] },
  solana: { name: 'Solana', family: 'SVM', lang: 'Anchor and Rust', file: 'lib.rs', tools: 'Anchor, local validator',
    consensus: 'Proof of history \u00b7 ~400ms slots', explorer: 'Solscan', gas: 'SOL',
    net: { Devnet: 'Solana devnet', Testnet: 'Solana testnet', Mainnet: 'Solana mainnet-beta' },
    fee: { Devnet: 'Free \u00b7 faucet funded', Testnet: '~0.002 test SOL', Mainnet: '~0.002 SOL' },
    target: '7Hk2\u2026pQ9w', finding: 'Missing signer check on authority', rule: 'Require a signer on every authority account',
    cmd: { build: ['anchor build', 'Finished release target(s)'], test: ['anchor test', '24 passing'], scan: ['account analysis --pda --cpi', '1 finding: authority is not a Signer (high)'], fix: ['anchor test --grep signer', '1 passing: signer_required'], sim: ['solana-test-validator', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'pub struct Withdraw<\'info> {'], ['-', '  pub authority: AccountInfo<\'info>,'], ['+', '  pub authority: Signer<\'info>,'], [' ', '  #[account(mut, has_one = authority)]'], [' ', '  pub vault: Account<\'info, Vault>,'], [' ', '}']],
    files: ['programs/vault/src/lib.rs', 'tests/vault.ts', 'Anchor.toml'], deps: ['anchor-lang, pinned', 'anchor-spl, pinned'] },
  sui: { name: 'Sui', family: 'Move \u00b7 objects', lang: 'Move', file: 'vault.move', tools: 'Sui CLI',
    consensus: 'Mysticeti BFT \u00b7 sub-second finality', explorer: 'Suiscan', gas: 'SUI',
    net: { Devnet: 'Sui devnet', Testnet: 'Sui testnet', Mainnet: 'Sui mainnet' },
    fee: { Devnet: 'Free \u00b7 faucet funded', Testnet: '~0.003 test SUI', Mainnet: '~0.003 SUI' },
    target: '0x4d2c\u2026e07a', finding: 'Capability can be copied out', rule: 'Never give capabilities the store ability',
    cmd: { build: ['sui move build', 'Build Successful'], test: ['sui move test', 'Test result: OK. Total tests: 24; passed: 24'], scan: ['capability analysis', '1 finding: AdminCap has store (high)'], fix: ['sui move test --filter cap', 'Test result: OK. Total tests: 1; passed: 1'], sim: ['transaction block simulation', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'module vault::vault {'], ['-', '  public struct AdminCap has key, store { id: UID }'], ['+', '  public struct AdminCap has key { id: UID }'], [' ', '  // capability stays where it was created'], [' ', '}']],
    files: ['sources/vault.move', 'tests/vault_tests.move', 'Move.toml'], deps: ['Sui framework, pinned'] },
  aptos: { name: 'Aptos', family: 'Move \u00b7 resources', lang: 'Move', file: 'vault.move', tools: 'Aptos CLI',
    consensus: 'AptosBFT \u00b7 sub-second finality', explorer: 'Aptos Explorer', gas: 'APT',
    net: { Devnet: 'Aptos devnet', Testnet: 'Aptos testnet', Mainnet: 'Aptos mainnet' },
    fee: { Devnet: 'Free \u00b7 faucet funded', Testnet: '~0.001 test APT', Mainnet: '~0.001 APT' },
    target: '0x2f61\u20269c14', finding: 'Resource can be dropped instead of stored', rule: 'Give vault resources the key ability only, never drop',
    cmd: { build: ['aptos move compile', 'Compilation succeeded'], test: ['aptos move test', 'Test result: OK. 24 passed'], scan: ['resource analysis --ability-check', '1 finding: Vault has drop (high)'], fix: ['aptos move test --filter ability', '1 passing: ability_required'], sim: ['aptos move simulate', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'module vault::vault {'], ['-', '  struct Vault has key, drop {'], ['+', '  struct Vault has key {'], [' ', '    balance: u64,'], [' ', '  }'], [' ', '}']],
    files: ['sources/vault.move', 'tests/vault_tests.move', 'Move.toml'], deps: ['AptosFramework, pinned'] },
  cosmos: { name: 'Cosmos', family: 'CosmWasm', lang: 'Rust (CosmWasm)', file: 'contract.rs', tools: 'cosmwasm-check, cw-multi-test',
    consensus: 'Tendermint BFT \u00b7 ~6s blocks', explorer: 'Mintscan', gas: 'ATOM',
    net: { Devnet: 'Local CosmWasm devnet', Testnet: 'Public Cosmos testnet', Mainnet: 'Cosmos Hub mainnet' },
    fee: { Devnet: 'Free \u00b7 local chain', Testnet: '~0.01 test ATOM', Mainnet: '~0.01 ATOM' },
    target: 'cosmos1\u20267xqe', finding: 'Unbounded iteration over deposits map', rule: 'Cap or paginate storage iteration in execute handlers',
    cmd: { build: ['cargo wasm', 'Compiling contract v0.1.0, finished'], test: ['cargo unit-test', 'test result: ok. 24 passed'], scan: ['cosmwasm-check target/wasm32/contract.wasm', '1 finding: unbounded iteration (high)'], fix: ['cargo unit-test pagination', 'test result: ok. 1 passed'], sim: ['cw-multi-test scenario', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'pub fn execute_withdraw_all(deps: DepsMut) -> Result {'], ['-', '  for (a, bal) in DEPOSITS.range(deps.storage, None, None, Order::Ascending) {'], ['+', '  for (a, bal) in DEPOSITS.range(deps.storage, None, None, Order::Ascending).take(PAGE_SIZE) {'], [' ', '    // settle a'], [' ', '  }'], [' ', '}']],
    files: ['src/contract.rs', 'src/msg.rs', 'Cargo.toml'], deps: ['cosmwasm-std, pinned', 'cw-storage-plus, pinned'] },
  starknet: { name: 'Starknet', family: 'Cairo VM', lang: 'Cairo', file: 'vault.cairo', tools: 'Scarb, Starknet Foundry',
    consensus: 'Sequencer, proof-settled on L1', explorer: 'Starkscan', gas: 'STRK',
    net: { Devnet: 'Local devnet (devnet-rs)', Testnet: 'Starknet Sepolia testnet', Mainnet: 'Starknet mainnet' },
    fee: { Devnet: 'Free \u00b7 local chain', Testnet: '~0.0009 test ETH', Mainnet: '~0.0009 ETH' },
    target: '0x03f7\u20261a2d', finding: 'Upgrade entrypoint skips signature validation', rule: 'Validate signatures on every privileged entrypoint, including upgrades',
    cmd: { build: ['scarb build', 'Compiling vault v0.1.0, finished'], test: ['snforge test', 'Tests: 24 passed'], scan: ['cairo-analyzer .', '1 finding: unauthenticated upgrade (high)'], fix: ['snforge test --filter upgrade_auth', '1 passed: upgrade_requires_signature'], sim: ['starknet-devnet fork-run', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {'], ['-', '  // no signature check'], ['+', '  self.account.assert_only_owner();'], [' ', '  replace_class_syscall(new_class_hash);'], [' ', '}']],
    files: ['src/vault.cairo', 'tests/vault_test.cairo', 'Scarb.toml'], deps: ['starknet, pinned', 'openzeppelin_account, pinned'] },
  near: { name: 'NEAR', family: 'WASM \u00b7 accounts', lang: 'Rust (near-sdk)', file: 'lib.rs', tools: 'near-cli-rs, cargo-near',
    consensus: 'Nightshade sharding \u00b7 ~1s blocks', explorer: 'NearBlocks', gas: 'NEAR',
    net: { Devnet: 'Local NEAR sandbox', Testnet: 'NEAR testnet', Mainnet: 'NEAR mainnet' },
    fee: { Devnet: 'Free \u00b7 local chain', Testnet: '~0.0007 test NEAR', Mainnet: '~0.0007 NEAR' },
    target: 'vault.x0a-demo.near', finding: 'Cross-contract result trusted before callback check', rule: 'Validate promise results in the callback before mutating state',
    cmd: { build: ['cargo near build', 'Contract built, wasm optimized'], test: ['cargo test', '24 passed'], scan: ['promise analysis --callbacks', '1 finding: unchecked promise result (high)'], fix: ['cargo test callback_guard', '1 passed: callback_result_checked'], sim: ['near sandbox-run', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', '#[private]'], [' ', 'pub fn on_transfer_complete(&mut self, amount: U128) {'], ['-', '  self.balance += amount.0;'], ['+', '  if is_promise_success() { self.balance += amount.0; }'], [' ', '}']],
    files: ['src/lib.rs', 'src/tests.rs', 'Cargo.toml'], deps: ['near-sdk, pinned'] },
  polkadot: { name: 'Polkadot', family: 'PolkaVM \u00b7 Substrate', lang: 'ink! (Rust)', file: 'lib.rs', tools: 'cargo-contract',
    consensus: 'Nominated PoS \u00b7 ~6s blocks', explorer: 'Subscan', gas: 'DOT',
    net: { Devnet: 'Local Substrate devnet', Testnet: 'Paseo testnet', Mainnet: 'Polkadot Hub' },
    fee: { Devnet: 'Free \u00b7 local chain', Testnet: '~0.015 test DOT', Mainnet: '~0.015 DOT' },
    target: '5FHn\u20268mRq', finding: 'State write happens before the XCM message is confirmed', rule: 'Only mutate state after the cross-chain message is confirmed',
    cmd: { build: ['cargo contract build', 'Original wasm size, optimized'], test: ['cargo test', '24 passed'], scan: ['xcm analysis', '1 finding: state write before ack (high)'], fix: ['cargo test xcm_ack', '1 passed: state_after_ack'], sim: ['substrate-contracts-node --dev', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'fn on_xcm_message(&mut self, ack: bool) {'], ['-', '  self.balance += self.pending;'], ['+', '  if ack { self.balance += self.pending; }'], [' ', '}']],
    files: ['lib.rs', 'tests.rs', 'Cargo.toml'], deps: ['ink!, pinned'] },
  cardano: { name: 'Cardano', family: 'eUTxO', lang: 'Aiken', file: 'vault.ak', tools: 'Aiken, Ogmios',
    consensus: 'Ouroboros PoS \u00b7 ~20s slots', explorer: 'Cardanoscan', gas: 'ADA',
    net: { Devnet: 'Local Cardano devnet', Testnet: 'Cardano preview testnet', Mainnet: 'Cardano mainnet' },
    fee: { Devnet: 'Free \u00b7 local chain', Testnet: '~0.3 test ADA', Mainnet: '~0.3 ADA' },
    target: 'addr1\u20269zke', finding: 'Datum not checked against redeemer on spend', rule: 'Always validate the datum matches the expected redeemer path',
    cmd: { build: ['aiken build', 'Compiled 1 validator'], test: ['aiken check', '24 passed'], scan: ['aiken audit --datum-checks', '1 finding: unchecked datum (high)'], fix: ['aiken check --match datum_guard', '1 passed: datum_matches_redeemer'], sim: ['ogmios simulate', 'Scenario lab: 6 of 6 passed'] },
    diff: [[' ', 'validator vault {'], [' ', '  spend(datum, redeemer, ctx) {'], ['-', '    True'], ['+', '    datum.owner == redeemer.signer'], [' ', '  }'], [' ', '}']],
    files: ['validators/vault.ak', 'lib/vault_types.ak', 'aiken.toml'], deps: ['aiken-lang/stdlib, pinned'] }
};

export const WS_STEPS = [
  { ph: 0, who: 'Orchestrator', msg: () => 'inspecting project state, selecting agents', st: 'Planning', tab: 'stream' },
  { ph: 0, who: 'Requirement', msg: () => 'specification locked as SPEC-v2', tree: ['spec'], gate: ['g-spec'], key: 'spec' },
  { ph: 0, who: 'Threat Model', msg: () => 'security invariants defined', tree: ['threat'], key: 'threat' },
  { ph: 0, who: 'Architect', msg: (e: any) => `module boundaries recorded for ${e.lang}`, tree: ['arch', 'adr'], key: 'arch' },
  { ph: 1, who: 'Coder', msg: (e: any) => `native ${e.lang} project generated`, tree: ['src', 'deps'], st: 'Building', key: 'src' },
  { ph: 1, who: 'Build worker', msg: () => 'compiled in isolation, artifact hash recorded', tree: ['build', 'art'], gate: ['g-art'], term: 'build', tab: 'terminal', key: 'build' },
  { ph: 1, who: 'Tester', msg: () => 'unit, integration and invariant tests passed', tree: ['test'], gate: ['g-tests', 'g-inv'], term: 'test', tab: 'tests', st: 'Testing and auditing', key: 'test' },
  { ph: 2, who: 'Security', msg: (e: any) => `1 high finding: ${e.finding}`, warn: 1, tree: ['find'], sec: ['1 high open', 'is-bad'], term: 'scan', tab: 'diff', diff: 'found', key: 'find' },
  { ph: 2, who: 'Auto-fix', msg: () => 'attempt 1 of 3, patch applied and re-tested', warn: 1, tree: ['patch'], term: 'fix', tab: 'diff', diff: 'patched', key: 'patch' },
  { ph: 2, who: 'Security', msg: () => 'no critical or high findings, regression test added', gate: ['g-sev'], sec: ['Clear', 'is-good'], tab: 'tests', key: 'find' },
  { ph: 2, who: 'Simulation', msg: () => 'scenario lab passed', tree: ['sim'], gate: ['g-sim'], term: 'sim', st: 'Simulating', tab: 'terminal', key: 'sim' },
  { ph: 3, who: 'Policy gate', msg: () => 'every automated check passed', st: 'Ready to deploy', tab: 'stream' },
  { ph: 3, who: 'Deployer', msg: () => 'unsigned transaction ready for your wallet', ready: 1, wait: 1, st: 'Awaiting your signature', tab: 'stream', key: 'art' },
  { ph: 3, who: 'Wallet', msg: () => 'transaction signed', gate: ['g-wallet'], st: 'Deploying', key: 'art' },
  { ph: 3, who: 'Deployer', msg: () => 'broadcast, tracking confirmations', tree: ['dep'], conf: 1, key: 'dep' },
  { ph: 3, who: 'Deployer', msg: () => 'finalized, chain state reconciled', conf: 3, key: 'dep' },
  { ph: 4, who: 'Verification', msg: () => 'source, bytecode and state match the build', tree: ['ver'], st: 'Verified', key: 'ver' },
  { ph: 4, who: 'Monitor', msg: () => 'live monitoring started, read-only', mon: 1, st: 'Monitoring', tab: 'stream', hold: 1 },
  { ph: 4, who: 'Monitor', msg: () => 'drift: a non-Treasury role withdrew funds', warn: 1, mon: 2, st: 'Incident detected', sec: ['Drift alert', 'is-bad'] },
  { ph: 4, who: 'Incident', msg: () => 'evidence preserved, replay ready, response awaits your approval', warn: 1, tree: ['inc'], key: 'inc' },
  { ph: 4, who: 'Memory', msg: (e: any) => `rule added: ${e.rule.toLowerCase()}`, tree: ['audit'], mem: 1, st: 'Learned', sec: ['Rule added', 'is-good'], key: 'audit' }
];

export const WS_TREE_GROUPS = [
  ['Understand', [['spec', 'Specification'], ['threat', 'Threat model'], ['arch', 'Architecture'], ['adr', 'ADRs']]],
  ['Build', [['src', 'Source tree'], ['deps', 'Dependencies'], ['build', 'Build evidence'], ['test', 'Test evidence']]],
  ['Prove', [['find', 'Security findings'], ['patch', 'Patches'], ['sim', 'Simulation scenarios']]],
  ['Ship', [['art', 'Artifacts'], ['dep', 'Deployment records']]],
  ['Operate', [['ver', 'Verification'], ['inc', 'Incidents'], ['audit', 'Audit trail']]]
];

export const WS_GATE = [
  ['g-spec', 'Specification approved', 'SPEC-v2 is locked and approved. Every artifact references it.'],
  ['g-tests', 'Required tests pass', 'Unit, integration and regression suites passed on the real build.'],
  ['g-inv', 'Invariants pass', 'Every invariant from the threat model holds under test.'],
  ['g-sev', 'No critical or high findings', 'The high finding was patched and a regression test was added.'],
  ['g-sim', 'Simulation passes', 'The Scenario Lab ran six multi-step scenarios natively.'],
  ['g-art', 'Artifact integrity matches', 'The artifact hash matches the build manifest.'],
  ['g-wallet', 'Wallet authorization', 'Only you can provide this, in your own wallet.']
];

export const WS_TESTS = [
  ['Compilation', 5], ['Unit', 6], ['Integration', 6], ['Regression', 8],
  ['Property', 6], ['Invariant', 6], ['Fuzz', 6], ['Differential', 10],
  ['Static analysis', 7], ['Dependency analysis', 7], ['Adversarial', 10],
  ['Economic attack', 10], ['Chain-specific checks', 10]
];
