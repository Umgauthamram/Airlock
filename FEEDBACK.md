# Airlock: Nebius Token Factory & NVIDIA Tooling Feedback

*Hackathon Running Feedback Log — Nebius x NVIDIA Global AI Hackathon (Coding & Agentic Engineering Track)*

## 1. Executive Summary & Context
Airlock was built during the Nebius x NVIDIA Global AI Hackathon as an active defense gateway for autonomous AI agents using Model Context Protocol (MCP) tool servers. The project utilizes Nebius Token Factory as the primary inference engine, assigning specialized tasks across three NVIDIA Nemotron model tiers:
- **`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`**: Semantic tool tag classification and concise operator explanations for held scripts.
- **`nvidia/nemotron-3-super-120b-a12b`**: Primary agent plan generator, synthesizing structured JavaScript scripts from natural language intents.
- **`nvidia/Nemotron-3-Ultra-550b-a55b`**: High-complexity policy evaluation explainability and single-attempt script repair when AST analysis identifies non-malicious syntax slips.

---

## 2. Token Factory API Strengths & Developer Experience
1. **Seamless OpenAI-Compatible Surface**:
   - The `/v1/chat/completions` endpoint adhered strictly to OpenAI specification, allowing integration with standard HTTP clients without requiring proprietary SDK wrappers.
2. **Accurate & Transparent Token Usage Metrics**:
   - The returned `usage` payload (`prompt_tokens`, `completion_tokens`, `total_tokens`) was reliable and consistent. This was essential for driving Airlock's empirical benchmark measurements, confirming a **94.7% token reduction** when moving from classic multi-turn tool catalogs to Airlock script-mode gating.
3. **Model Tier Latency & Responsiveness**:
   - Nano-30B provided exceptional throughput and low latency, making it ideal for background semantic tagging of newly registered upstream tool servers without slowing down gateway responsiveness.

---

## 3. Findings, Gotchas & Observations
1. **Reasoning Effort Parameter Variations**:
   - As observed in testing, passing explicit reasoning parameters (`reasoning_effort: none`) on Nano-30B can occasionally trigger empty responses or parameter validation mismatches. We standardized on standard temperature (`0.2`) and max token parameters for consistent deterministic output.
2. **Structured Script Generation Quality**:
   - Nemotron-3-Super exhibited strong adherence to JavaScript syntax when prompted with declaration interfaces (`declare const tools: ...`), rarely emitting non-standard syntax.
   - When coupled with Acorn AST validation, any attempt by the model to introduce dynamic tricks (`eval`, `process`, prototype traversal) was cleanly trapped and surfaced as structured line-level errors.

---

## 4. Feature Requests & Future Suggestions for Token Factory
1. **Native Pre-Execution Code Sandboxing / Tool Gateways**:
   - Built-in sandboxed evaluation environments directly within Nebius Token Factory would pair naturally with code-mode agents, reducing the operational overhead of running standalone isolate containers on Nebius VMs.
2. **Model Context Protocol (MCP) Upstream Integration**:
   - Native support for upstream MCP server definitions within the Token Factory console would accelerate enterprise adoption of autonomous coding and agentic workflows.
