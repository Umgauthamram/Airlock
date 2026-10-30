Devpost
Join a hackathon 
Host a hackathon 
Resources 
 
gauthamram-um
Notifications
Loading...

Nebius x NVIDIA Global AI Hackathon
Overview
My projects
Participants (29672)
Resources
Rules
Project gallery
Updates
FAQs
Ghost rider
Draft
2/5 steps done
about 3 hours to deadline
Preview 
Manage team
Project overview
Project details
Additional info
Submit
Additional info
For judges and organizers

Unless noted, additional info is for judges and hackathon organizers and will not appear on your public project page.

Upload a File
Upload a file as part of your submission - e.g., zip, pdf, word, apk, etc. To upload multiple files, put them in a zip file and upload the zip file. Limit: 35 MB.

No file chosen
* Submitter Type

Team
* Organization Name (if applicable)
"N/A" if you're not representing an organization

N/A
* Submitter Country of Residence
Appears in project gallery


India
* If you or any team members reside in Canada, please indicate the province below.
"N/A" if you don't reside in Canada.

N/A
* Which track are you submitting your project into?

Coding and agentic engineering
* Is your project new or existing prior to August 26, 2026?

New
If your project is existing, explain how you significantly updated your project with Nebius tools.

* Provide a URL to your public code repository for judging and testing on either GitHub, GitLab or Bitbucket.
Must include: approved OSI license, README with setup instructions, highlight how you’ve used NVIDIA Nemotron or other NVIDIA open source models and where Token Factory accelerated your workflow and any other Nebius Tools or Services used.

https://github.com/Umgauthamram/Airlock.git
Provide a URL to a working demo, hosted application, or test build of your Project.
Not required for Physical AI submissions

https://airlocks.vercel.app
* Which model(s) did you use, and why did you choose that size/variant?
e.g., Nemotron-4 340B, Nemotron-Mini, etc.

Nano 30B for fast tagging and explanations, Super 120B for plan generation, Ultra 550B for hard policy explanations and repair.
* How would you rate Nemotron's output quality for your use case? (1 = Poor, 10 = Excellent)
Please share what worked well or fell short — e.g., reasoning, instruction-following, domain knowledge, multilingual support.

9/10. Nemotron-3-Super (120B) demonstrated exceptional instruction-following and structured syntax generation. It reliably synthesized typed JavaScript execution plans strictly adhering to tool interfaces without hallucinating non-existent parameters. Nemotron-3-Nano (30B) delivered rapid, accurate data-flow tagging (reads_untrusted, writes_external) and human-readable incident summaries for security operators. Ultra (550B) excelled at AST repair and contextual policy explanation. Minor feedback: occasional verbosity on simple policy rejections, easily tuned with temperature.

* Did you fine-tune, prompt-engineer, or use Nemotron out of the box? What was your approach?

We used Nemotron out of the box with structured prompt engineering. We provided strict TypeScript interface stubs (retrieved dynamically via the gateway's search_tools endpoint) alongside explicit data boundary constraints. Nemotron was prompted to output single-shot execution scripts using an async IIFE format rather than multi-turn conversational tool calls, drastically minimizing latency and token consumption.

* How did Nemotron's performance compare to other models you've used for similar tasks?

Compared to generic LLMs, Nemotron showed significantly stronger compliance with API contracts and schema boundaries. On code generation for agent plans, it produced valid, parseable JavaScript ASTs across our benchmark suite, avoiding the conversational drift and parameter hallucinations common in general-purpose models.

* Which Nebius platform capabilities were most valuable to your project and how?
Please include detail on how you leveraged Nebius infrastructure to run Nemotron (e.g., GPU instance types, deployment setup, API access, scaling).

Nebius Token Factory was the core enabler. Having OpenAI-compatible endpoint access to multiple Nemotron tiers (Nano 30B, Super 120B, Ultra 550B) under a unified endpoint made it effortless to implement tiered intelligence: routing real-time tagging and human-review summaries to low-latency Nano, while routing complex script synthesis to Super and deep policy explanations to Ultra without managing separate GPU clusters.

* How likely are you to recommend running Nemotron on Nebius to other developers? (1 = Unlikely, 10 = Highly Likely)
Please share why or provide additional feedback.

10/10. Token Factory eliminates the overhead of provisioning, managing, and autoscaling dedicated GPU instances for open models. Fast time-to-first-token, stable streaming, and standard API compatibility made prototyping and benchmarking feel seamless.

* How would you rate your experience running Nemotron inference on Nebius compared to previous cloud or local development environments? (1 = Poor, 10 = Excellent)
Please share why or provide additional feedback.

9/10. Significantly faster and more convenient than provisioning self-hosted vLLM or Triton pods on raw cloud VMs. Token Factory gave us immediate scale and predictable low latency out of the box.

* What additional features or improvements would have made the Nemotron on Nebius experience more effective for your project?

Native support for structured JSON schema or grammar-constrained decoding (e.g., Outlines / Guidance / constrained sampling) directly at the endpoint level would guarantee valid AST outputs 100% of the time, avoiding the need for client-side retries.

* What do you most hope to see from the Nemotron team next?

Continued focus on agentic reasoning and specialized tool-calling checkpoints, especially models pre-trained on AST verification, static analysis semantics, and secure coding patterns.

* Did you use Tavily in your project?
To qualify: your project must make a functional, runtime call to the Tavily API as part of its solution.

Yes

Details:
Airlock integrates Tavily Search API (https://api.tavily.com/search) as a real-time, runtime-called MCP tool (tavily.web_search) executing on the gateway host. We use Tavily for autonomous research agents that retrieve live web intelligence. Airlock classifies Tavily output with the data-flow tag 'reads_untrusted', allowing benign research while deterministically blocking or holding exfiltration attacks when untrusted web search results are piped into external sinks.

* Builders & Brews - IRL Events City
If you're attending one of the 20 participating IRL hackathon events, select your city to be eligible for the City Winner Award.

N/A (Online participant)

* I, and, if applicable, all of my teammates, are at least the age of majority where I reside (e.g. 18 in the US).
[x] Yes

* I, and, if applicable, all of my teammates, are not employees, representatives nor agents of the Promotion Entities of this hackathon (sponsor, administrator. or any affiliates).
[x] Yes

* Which AI tools have you leveraged while working on this project?
Google Antigravity, Claude, Nebius Token Factory (NVIDIA Nemotron-3 Nano, Super, Ultra).

* Describe the level of learning you/your team derived from the project
Significant learning (Deep dive into AST static analysis, Node.js worker thread memory isolation, deterministic policy evaluation, and enterprise LLM inference infrastructure on Nebius).

* Did you gain AI value that you can use in your career?
Yes, absolutely.

Save & continue Cancel

Devpost
About
Careers
Contact
Help
Hackathons
Browse hackathons
Explore projects
Host a hackathon
Hackathon guides
Portfolio
Your projects
Your hackathons
Settings
Connect
 Twitter
 Discord
 Facebook
 LinkedIn
© 2026 Devpost, Inc. All rights reserved.
Community guidelines
Security
CA notice
Privacy policy
Terms of service
