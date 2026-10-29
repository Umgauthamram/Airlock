# Airlock: Nebius Token Factory & NVIDIA Tooling Feedback

*Hackathon Running Feedback Log — Nebius x NVIDIA Global AI Hackathon (Coding & Agentic Engineering Track)*

## 1. Environment & Setup
- **Platform**: Nebius Token Factory & Nebius AI Cloud
- **Models Targeted**:
  - `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` (Tool tagging & concise explanations)
  - `nvidia/nemotron-3-super-120b-a12b` (Code mode reference agent / script generation)
  - `nvidia/Nemotron-3-Ultra-550b-a55b` (Script repair & deep policy evaluation explanations)

## 2. Token Factory API Observations & Findings
- **API Compatibility**: OpenAI-compatible endpoint format (`https://api.tokenfactory.nebius.com/v1/`).
- **Model Discovery**: Tier mapping validated against model listings (`/v1/models`).
- **Usage Fields**: Token usage metrics extracted directly from the response `usage` field to drive precise per-call token accounting and benchmark comparisons.
- **Gotchas / Parameter notes**:
  - Verification on parameter constraints (e.g. `reasoning_effort` compatibility across Nano vs Super vs Ultra).

## 3. Suggestions & Feature Requests
- *(To be updated during integration and benchmark phases)*
