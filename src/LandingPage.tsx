import React, { useEffect, useRef } from 'react';
import './landing.css';
import { runLandingEngine } from './landing/landingEngine';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    runLandingEngine(onLaunchApp);
  }, [onLaunchApp]);

  return (
    <div ref={containerRef} className="landing-scope">
      <a className="skip" href="#main">Skip to content</a>

      <div className="loader" id="loader" aria-hidden="true">
        <div className="loader__word"><span>x0a</span></div>
        <div className="loader__count"><span id="count">0</span><span>%</span></div>
        <div className="loader__bar"><i></i></div>
      </div>

      <div className="progress" id="progress"></div>
      <div className="spy" id="spy" aria-hidden="true">
        <span className="spy__num" id="spyNum">01</span>
        <span className="spy__bar"></span>
        <span className="spy__name" id="spyName">Intro</span>
      </div>
      <canvas id="gl" aria-hidden="true"></canvas>

      <header className="nav" id="nav">
        <a className="nav__logo" href="#top" data-goto="#top" data-label="x0a" aria-label="x0a, back to top">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          </svg>
          <span>x0a</span>
        </a>
        <div className="nav__right">
          <ul className="nav__links">
            <li><a href="#lifecycle" data-goto="#lifecycle" data-label="Lifecycle" data-roll>Lifecycle</a></li>
            <li><a href="#agents" data-goto="#agents" data-label="Agents" data-roll>Agents</a></li>
            <li><a href="#ecosystems" data-goto="#ecosystems" data-label="Ecosystems" data-roll>Ecosystems</a></li>
            <li><a href="#scope" data-goto="#scope" data-label="Scope" data-roll>Scope</a></li>
            <li><a href="#gate" data-goto="#gate" data-label="Safety" data-roll>Safety</a></li>
          </ul>
          <button
            type="button"
            className="nav__cta"
            data-roll
            data-magnetic
            onClick={onLaunchApp}
          >
            Launch x0a
          </button>
          <button className="nav__menu" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu">
            Menu
          </button>
        </div>
      </header>

      <nav className="menu" id="menu" aria-label="Menu">
        <a href="#lifecycle" data-goto="#lifecycle" data-label="Lifecycle">Lifecycle</a>
        <a href="#agents" data-goto="#agents" data-label="Agents">Agents</a>
        <a href="#ecosystems" data-goto="#ecosystems" data-label="Ecosystems">Ecosystems</a>
        <a href="#scope" data-goto="#scope" data-label="Scope">Scope</a>
        <a href="#gate" data-goto="#gate" data-label="Safety">Safety</a>
        <a href="#app" onClick={(e) => { e.preventDefault(); onLaunchApp(); }}>Launch x0a</a>
      </nav>

      <main id="main">
        <section className="hero" id="top">
          <p className="hero__badge"><i></i>The AI engineer for on-chain software</p>
          <h1 className="hero__title display" aria-label="Ship smart contracts you can prove.">
            <span className="line" aria-hidden="true"><span className="line__in">Ship smart</span></span>
            <span className="line" aria-hidden="true"><span className="line__in">contracts you</span></span>
            <span className="line" aria-hidden="true"><span className="line__in">can prove.</span></span>
          </h1>
          <div className="prompt" aria-hidden="true">
            <div className="prompt__box glass">
              <span className="prompt__tag">Try</span>
              <span className="prompt__text" id="promptText"></span>
              <i className="prompt__caret"></i>
            </div>
            <ul className="prompt__chips" id="promptChips"></ul>
          </div>
          <div className="hero__foot">
            <p className="hero__lede">
              x0a is an AI smart contract engineer for every major chain. From a plain-language idea to a tested, reviewed, wallet-approved and monitored deployment, with evidence at every step.
            </p>
            <div className="hero__actions">
              <a className="btn btn--solid" href="#lifecycle" data-goto="#lifecycle" data-label="Lifecycle" data-roll data-magnetic>
                See the lifecycle
              </a>
              <button
                type="button"
                className="link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                onClick={onLaunchApp}
              >
                Launch x0a
              </button>
            </div>
          </div>
          <p className="hero__hint" id="hint">Move your cursor across the orb</p>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track" id="marqueeTrack"></div>
          <div className="marquee__track marquee__track--b" id="marqueeTrackB"></div>
        </div>

        <section className="manifesto" id="manifesto">
          <div className="manifesto__grid split">
            <div className="manifesto__head gate__aside">
              <h2 className="h2 display reveal">
                <span className="line"><span className="line__in">The manifesto,</span></span>
                <span className="line"><span className="line__in">in one sentence</span></span>
              </h2>
              <p>Everything else on this page is how x0a keeps this promise, from a first prompt to a signed transaction.</p>
            </div>
            <div className="manifesto__body">
              <p className="manifesto__text" id="manifestoText">
                x0a is not another code generator. <span className="pill"></span> It is an AI engineering control plane for on-chain software: the AI reasons, deterministic tools verify, the chain confirms, you authorize, and evidence proves. <span className="pill pill--b"></span> An agent saying a contract is safe is never enough.
              </p>
              <div className="manifesto__more">
                <p>What can it build? Anything that runs on a chain. The category picker only helps clarify requirements and never limits what x0a can build.</p>
                <ul className="tags">
                  <li>Tokens</li><li>Staking</li><li>Lending</li><li>AMMs and DEXs</li><li>Perpetuals</li><li>Stablecoins</li><li>NFTs</li><li>DAOs</li><li>Escrow</li><li>Bridges</li><li>Prediction markets</li><li>RWA</li><li>Games</li><li>Custom logic</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="life" id="lifecycle" data-theme="dark" aria-label="The lifecycle">
          <div className="life__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">From intent to</span></span>
              <span className="line"><span className="line__in">incident response</span></span>
            </h2>
            <div className="life__side">
              <div className="life__now" aria-hidden="true">
                <span id="stageNum">01</span>
                <span className="life__of">/ 18</span>
                <span className="life__phase" id="stagePhase">Understand</span>
              </div>
              <p className="life__hint">Eighteen stages, one lifecycle. Scroll sideways and select a stage for the detail.</p>
            </div>
          </div>
          <div className="life__track" id="lifecycleTrack"></div>
        </section>

        <section className="sec agents" id="agents">
          <div className="sec__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">A team of</span></span>
              <span className="line"><span className="line__in">specialist agents</span></span>
            </h2>
            <p className="sec__lede">
              x0a is not one chat window. An Orchestrator coordinates specialist agents, each with explicit permissions, and every agent calls deterministic tools instead of touching infrastructure directly. Select an agent to see what it can and cannot do.
            </p>
          </div>
          <div className="agents__grid split">
            <ul className="agents__list" id="agentList"></ul>
            <div className="agents__panel glass" id="agentPanel" aria-live="polite"></div>
          </div>
          <p className="agents__more">Also on the team: Dependency Intelligence, Upgradeability, Formal Verification, Cross-Chain, Migration and Autonomous Debugging agents, plus an AI Review Board. Tool permissions are enforced outside the LLM.</p>
        </section>

        <section className="sec evi" id="evidence" data-theme="dark">
          <div className="evi__grid split">
            <div className="evi__text">
              <h2 className="h2 display reveal">
                <span className="line"><span className="line__in">AI says it.</span></span>
                <span className="line"><span className="line__in">Evidence decides.</span></span>
              </h2>
              <p>An agent believing a function is protected is not enough. Every important claim references evidence, and unverified AI reasoning can never unlock deployment.</p>
              <ul className="tags">
                <li>Source hash</li><li>Code diff</li><li>Compiler output</li><li>Test output</li><li>Fuzz result</li><li>Static scan</li><li>Dependency scan</li><li>Simulation result</li><li>Transaction hash</li><li>Artifact hash</li><li>Explorer verification</li><li>State snapshot</li><li>Tool version</li><li>Execution ID</li>
              </ul>
            </div>
            <div className="ledger glass" id="ledger">
              <p className="ledger__cap">Illustrative claims ledger</p>
              <div className="claim" data-final="verified">
                <p className="claim__text">Only the admin role can mint.</p>
                <span className="claim__pill"><i className="p-from">Unverified</i><i className="p-to">Verified</i></span>
                <ul className="claim__ev"><li>Static scan</li><li>Authorization test</li><li>Invariant</li></ul>
              </div>
              <div className="claim" data-final="partial">
                <p className="claim__text">Users cannot withdraw more than their balance.</p>
                <span className="claim__pill"><i className="p-from">Unverified</i><i className="p-to">Partially verified</i></span>
                <ul className="claim__ev"><li>Fuzz result</li><li>Simulation</li><li className="is-pending">Adversarial test</li></ul>
              </div>
              <div className="claim" data-final="unverified">
                <p className="claim__text">The pool is safe from oracle manipulation.</p>
                <span className="claim__pill"><i className="p-from">Unverified</i><i className="p-to">Unverified</i></span>
                <ul className="claim__ev"><li className="is-none">AI analysis only</li></ul>
              </div>
              <div className="claim" data-final="failed">
                <p className="claim__text">The upgrade authority is the project multisig.</p>
                <span className="claim__pill"><i className="p-from">Unverified</i><i className="p-to">Failed</i></span>
                <ul className="claim__ev"><li className="is-fail">State snapshot</li></ul>
              </div>
              <p className="ledger__foot">Every claim carries one of five states: verified, partially verified, unverified, failed or not applicable.</p>
            </div>
          </div>
          <div className="evi__chainwrap">
            <h3 className="chain__title">One execution ID follows the work</h3>
            <ol className="chain">
              <li>Intent</li><li>Spec</li><li>Threat model</li><li>Architecture</li><li>Code</li><li>Build</li><li>Test</li><li>Scan</li><li>Patch</li><li>Simulation</li><li>Deployment</li><li>Verification</li><li>Monitoring</li>
            </ol>
          </div>
        </section>

        <section className="sec gate" id="gate">
          <div className="gate__grid split">
            <div className="gate__aside">
              <h2 className="h2 display reveal">
                <span className="line"><span className="line__in">Nothing ships</span></span>
                <span className="line"><span className="line__in">on an AI's word</span></span>
              </h2>
              <p>Deployment is decided by a deterministic policy engine that sits outside the AI agents, and then by you. There is no silent mainnet deployment.</p>
            </div>
            <div className="steps" id="steps">
              <div className="steps__line"><div className="steps__fill"></div></div>
              <article className="step">
                <span className="step__dot" aria-hidden="true">1</span>
                <h3>Policy gate</h3>
                <p className="step__when">Deterministic</p>
                <p>Tests, invariants, fuzzing and simulation must pass, with no critical or high findings. The gate is separate from the AI agents and every policy change is auditable.</p>
              </article>
              <article className="step">
                <span className="step__dot" aria-hidden="true">2</span>
                <h3>Transaction preview</h3>
                <p className="step__when">You read it</p>
                <p>Before signing you see the network, target, parameters, expected state changes, fees, artifact hash and simulation result.</p>
              </article>
              <article className="step">
                <span className="step__dot" aria-hidden="true">3</span>
                <h3>Wallet approval</h3>
                <p className="step__when">You sign</p>
                <p>x0a never asks for private keys or seed phrases, and never broadcasts without your explicit authorization.</p>
              </article>
              <article className="step">
                <span className="step__dot" aria-hidden="true">4</span>
                <h3>Deployment</h3>
                <p className="step__when">On chain</p>
                <p>The transaction is tracked and chain state is reconciled. An unknown transaction is never retried silently.</p>
              </article>
              <article className="step">
                <span className="step__dot" aria-hidden="true">5</span>
                <h3>Verify and monitor</h3>
                <p className="step__when">Continuous</p>
                <p>The deployed artifact and state are verified, then watched for anomalies and drift from the specification. If something breaks, the incident can be replayed with its evidence.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="sec rules" id="rules">
          <div className="sec__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">Rules x0a enforces</span></span>
              <span className="line"><span className="line__in">on itself</span></span>
            </h2>
            <p className="sec__lede">These invariants hold for the platform, whatever an agent, a prompt or an uploaded file says.</p>
          </div>
          <p className="sec__lede" style={{ marginTop: '-.5rem' }}>Select a rule to see what enforces it and why it can’t be talked around.</p>
          <ol className="rules__list" id="rulesList"></ol>
        </section>

        <section className="sec lab" id="workspace" data-theme="dark">
          <div className="sec__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">One workspace for</span></span>
              <span className="line"><span className="line__in">the whole lifecycle</span></span>
            </h2>
            <p className="sec__lede">Drive a real project through every stage, on any of nine ecosystems and three networks. Read the artifacts, watch the agents work, and check what backs each gate as the lifecycle runs itself.</p>
          </div>
          <div className="ws glass" id="ws"></div>
          <p className="lab__cap">Interactive preview. Pick an ecosystem and a network, press Run and watch the full lifecycle play out on its own, open any artifact along the way, or simulate an incident.</p>
        </section>

        <section className="sec arch" id="architecture" data-theme="dark">
          <div className="arch__grid split">
            <div className="gate__aside">
              <h2 className="h2 display reveal">
                <span className="line"><span className="line__in">How it fits</span></span>
                <span className="line"><span className="line__in">together</span></span>
              </h2>
              <p>An ecosystem-neutral core, native adapters underneath, and a loop that feeds what x0a learns back into every future run.</p>
              <div className="arch__legend" id="archLegend" role="group" aria-label="Filter layers by principle"></div>
            </div>
            <div className="steps" id="archSteps"></div>
          </div>
        </section>

        <section className="sec eco" id="ecosystems">
          <div className="eco__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">Native to</span></span>
              <span className="line"><span className="line__in">every chain</span></span>
            </h2>
            <p className="eco__lede">Solana is not treated like the EVM, and Sui is not treated like Solana. Each ecosystem gets a native adapter, so the semantics that matter for security stay intact. Hover a row and the orb changes shape. Open one for detail.</p>
          </div>
          <ul className="eco__list">
            <li className="svc" data-mood="evm" data-level="8">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-evm">
                <span className="svc__name">EVM chains</span><span className="svc__level">L8 · Full engineering</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-evm" role="region"><div className="svc__inner">
                <p>Ethereum and the L1s and L2s around it, including Base, Arbitrum, Optimism, Polygon and BNB Chain. Solidity workflows with fork simulation and native EVM security tooling.</p>
                <ul className="tags"><li>Solidity</li><li>Foundry</li><li>Slither</li><li>Fork simulation</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="solana" data-level="8">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-solana">
                <span className="svc__name">Solana and SVM</span><span className="svc__level">L8 · Full engineering</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-solana" role="region"><div className="svc__inner">
                <p>Modeled as programs, accounts, instructions, PDAs and CPIs instead of being squeezed into an EVM shape. Includes PDA and CPI analysis and local validator simulation.</p>
                <ul className="tags"><li>Anchor</li><li>Rust</li><li>PDA analysis</li><li>CPI analysis</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="move" data-level="7">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-move">
                <span className="svc__name">Move: Sui and Aptos</span><span className="svc__level">L7 · Monitor</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-move" role="region"><div className="svc__inner">
                <p>Object, resource and capability semantics are kept intact rather than mapped onto EVM contracts.</p>
                <ul className="tags"><li>Sui</li><li>Aptos</li><li>Objects</li><li>Capabilities</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="cosmos" data-level="7">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-cosmos">
                <span className="svc__name">Cosmos and CosmWasm</span><span className="svc__level">L7 · Monitor</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-cosmos" role="region"><div className="svc__inner">
                <p>CosmWasm contracts, IBC-aware deployments and chain-specific message and fee models. Cosmos EVM chains go through the EVM adapter.</p>
                <ul className="tags"><li>CosmWasm</li><li>IBC</li><li>Fee models</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="starknet" data-level="6">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-starknet">
                <span className="svc__name">Starknet and Cairo</span><span className="svc__level">L6 · Simulate</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-starknet" role="region"><div className="svc__inner">
                <p>Cairo contracts, account abstraction concepts and Starknet-native transaction and fee behavior.</p>
                <ul className="tags"><li>Cairo</li><li>Account abstraction</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="near" data-level="6">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-near">
                <span className="svc__name">NEAR and WASM</span><span className="svc__level">L6 · Simulate</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-near" role="region"><div className="svc__inner">
                <p>Rust contracts on WASM, with the account and subaccount model, storage economics and cross-contract calls.</p>
                <ul className="tags"><li>Rust</li><li>WASM</li><li>Storage costs</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="polkadot" data-level="5">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-polkadot">
                <span className="svc__name">Polkadot</span><span className="svc__level">L5 · Deploy</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-polkadot" role="region"><div className="svc__inner">
                <p>Polkadot Hub environments, both EVM-compatible and PolkaVM paths, with XCM-aware interoperability analysis.</p>
                <ul className="tags"><li>PolkaVM</li><li>EVM</li><li>XCM</li></ul>
              </div></div>
            </li>
            <li className="svc" data-mood="cardano" data-level="5">
              <button className="svc__head" type="button" aria-expanded="false" aria-controls="svc-cardano">
                <span className="svc__name">Cardano</span><span className="svc__level">L5 · Deploy</span><span className="svc__plus" aria-hidden="true"></span>
              </button>
              <div className="svc__body" id="svc-cardano" role="region"><div className="svc__inner">
                <p>Validators, redeemers and datums under the eUTxO model, with Plutus and Aiken workflows where the toolchain supports them.</p>
                <ul className="tags"><li>Plutus</li><li>Aiken</li><li>eUTxO</li></ul>
              </div></div>
            </li>
          </ul>
          <p className="eco__note">And more through the Adapter SDK, such as Internet Computer, Tezos, Algorand, Hedera, Fuel, Stellar Soroban and TON. New chains, VMs and languages plug in without rewriting the core.</p>

          <div className="levels">
            <h3 className="levels__title">Honest about maturity</h3>
            <p className="levels__lede">A network is not fully supported just because x0a can write code for it. Each one shows its level, from a known registry entry to full lifecycle engineering. Select a level to see what it unlocks and which ecosystems above have reached it.</p>
            <ol className="levels__list" id="levelsList">
              <li><button type="button" data-lv="0" aria-pressed="false"><span>0</span>Registry</button></li>
              <li><button type="button" data-lv="1" aria-pressed="false"><span>1</span>Read</button></li>
              <li><button type="button" data-lv="2" aria-pressed="false"><span>2</span>Build</button></li>
              <li><button type="button" data-lv="3" aria-pressed="false"><span>3</span>Test</button></li>
              <li><button type="button" data-lv="4" aria-pressed="false"><span>4</span>Simulate</button></li>
              <li><button type="button" data-lv="5" aria-pressed="false"><span>5</span>Deploy</button></li>
              <li><button type="button" data-lv="6" aria-pressed="false"><span>6</span>Verify</button></li>
              <li><button type="button" data-lv="7" aria-pressed="false"><span>7</span>Monitor</button></li>
              <li><button type="button" data-lv="8" aria-pressed="false"><span>8</span>Full engineering</button></li>
            </ol>
            <p className="levels__out" id="levelsOut" aria-live="polite">Level 0 means the network is registered but not yet executable. Level 8 covers the complete lifecycle, including upgrades, migration and incident replay.</p>
          </div>
        </section>

        <section className="sec scope" id="scope">
          <div className="sec__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">Built for almost</span></span>
              <span className="line"><span className="line__in">anything on-chain</span></span>
            </h2>
            <p className="sec__lede">Forty-nine system types below, grouped into eight families. Filter by family, or pick any single item to see how x0a would approach it. None of this narrows what the Coder agent can actually build.</p>
          </div>
          <div className="scope__filters" id="scopeFilters" role="group" aria-label="Filter by family"></div>
          <div className="scope__layout split">
            <ul className="scope__list" id="scopeList"></ul>
            <div className="scope__panel glass" id="scopePanel" aria-live="polite"></div>
          </div>
          <p className="scope__note">The category is a requirement-engineering aid, never a limit. Describe something that isn’t listed here, and the Requirement agent still turns it into a specification, a threat model and a native implementation.</p>
        </section>

        <section className="sec jr" id="journeys">
          <div className="sec__head">
            <h2 className="h2 display reveal">
              <span className="line"><span className="line__in">Four ways in</span></span>
            </h2>
            <p className="sec__lede">Start from a sentence, from source code, or from a contract that is already live. Pick a journey to see the path it takes.</p>
          </div>
          <div className="jr__grid split">
            <ul className="jr__tabs" id="jrTabs"></ul>
            <div className="jr__panel glass" id="jrPanel" aria-live="polite"></div>
          </div>
          <p className="jr__note">You can also bring what you already have: paste source, upload a ZIP, import a repository, or point x0a at a deployed address. Existing systems can skip code generation and enter at import.</p>
        </section>

        <section className="sec cta" id="start" data-theme="dark">
          <div className="cta__content">
            <h2 className="cta__title display reveal" aria-label="Have a contract in mind? Describe it.">
              <span className="line" aria-hidden="true"><span className="line__in">Have a contract</span></span>
              <span className="line" aria-hidden="true"><span className="line__in">in mind?</span></span>
              <span className="line" aria-hidden="true"><span className="line__in">Describe it.</span></span>
            </h2>
            <div className="cta__row" id="ctaRow">
              <button
                type="button"
                className="btn btn--solid"
                data-roll
                data-magnetic
                onClick={onLaunchApp}
              >
                Launch x0a
              </button>
              <a className="link" href="#lifecycle" data-goto="#lifecycle" data-label="Lifecycle">
                See how it works
              </a>
            </div>
          </div>
          <footer className="foot">
            <div>
              <p className="foot__label">x0a</p>
              <p>AI Smart Contract Engineer and Lifecycle Platform.</p>
            </div>
            <div>
              <p className="foot__label">Explore</p>
              <ul>
                <li><a className="link" href="#lifecycle" data-goto="#lifecycle" data-label="Lifecycle" data-roll>Lifecycle</a></li>
                <li><a className="link" href="#agents" data-goto="#agents" data-label="Agents" data-roll>Agents</a></li>
                <li><a className="link" href="#ecosystems" data-goto="#ecosystems" data-label="Ecosystems" data-roll>Ecosystems</a></li>
                <li><a className="link" href="#gate" data-goto="#gate" data-label="Safety" data-roll>Safety</a></li>
              </ul>
            </div>
            <div>
              <p className="foot__label">The principle</p>
              <p>AI reasons. Deterministic systems verify. The blockchain confirms. The user authorizes. Evidence proves.</p>
            </div>
            <div>
              <button type="button" className="link" data-goto="#top" data-label="Top" data-roll>Back to top</button>
              <p className="foot__label" style={{ marginTop: '.8rem' }}>&copy; 2026 x0a</p>
            </div>
          </footer>
          <div className="mega" aria-hidden="true"><span>x0a</span></div>
        </section>
      </main>

      <div className="case" id="case" role="dialog" aria-modal="true" aria-label="Stage details" aria-hidden="true">
        <div className="case__bg" id="caseBg"></div>
        <div className="case__grid">
          <div className="case__slot" id="caseSlot"></div>
          <div className="case__panel" id="casePanel" data-native-scroll tabIndex={-1}>
            <div className="case__top case__anim">
              <p className="case__idx"><span id="caseNum">01</span><span className="case__of">/ 18</span><span className="case__phase" id="casePhase">Understand</span></p>
              <button className="case__close" id="caseClose" type="button">Close</button>
            </div>
            <div className="case__body case__anim">
              <h3 className="case__title display" id="caseTitle"></h3>
              <p className="case__agent" id="caseAgent"></p>
              <p className="case__hint">Move over the illustration to shift its layers. Click it to replay.</p>
              <p className="case__text" id="caseText"></p>
              <div className="case__out"><p className="case__sub">Produces</p><p id="caseOut"></p></div>
              <p className="case__sub">What it covers</p>
              <ul className="tags case__chips" id="caseChips"></ul>
            </div>
            <div className="case__nav case__anim">
              <button type="button" className="case__step" id="casePrev"><span>Previous</span><b></b></button>
              <button type="button" className="case__step" id="caseNext"><span>Next</span><b></b></button>
            </div>
          </div>
        </div>
        <div className="case__cover" id="caseCover"></div>
      </div>

      <div className="wipe" id="wipe" aria-hidden="true"><span className="wipe__label" id="wipeLabel"></span></div>

      <div className="cursor" id="cursor" aria-hidden="true">
        <div className="cursor__ring" id="cursorRing"><div className="cursor__disc"><span className="cursor__label" id="cursorLabel">View</span></div></div>
        <div className="cursor__dot" id="cursorDot"></div>
      </div>
      <div className="grain" aria-hidden="true"></div>
    </div>
  );
}
