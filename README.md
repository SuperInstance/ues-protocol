# Universal Event Stream (UES)

![Cocapn](https://img.shields.io/badge/cocapn-vessel-purple) ![Protocol](https://img.shields.io/badge/type-specification-blue)

**HTTP for cognition — the universal agent communication protocol.**

The UES is the result of two independent systems (CheetahClaws event streaming and Cocapn emergence-bus) converging on the same fundamental pattern: agents communicate through typed events, not APIs.

## The Four Operations

| Operation | Maps From | Purpose |
|-----------|-----------|---------|
| **THINK** | CheetahClaws ThinkingChunk | Internal reasoning with optional probability estimates |
| **SPEAK** | CheetahClaws TextChunk | Text output for human or agent consumption |
| **ACT** | CheetahClaws ToolStart/ToolEnd | Tool invocation with structured input/output |
| **DONE** | CheetahClaws TurnDone | Turn completion with metadata (tokens, trust delta) |

## Fleet Extensions

| Event | Maps From | Purpose |
|-------|-----------|---------|
| **TRUST_UPDATE** | INCREMENTS trust engine | Trust score changes (12 parameters) |
| **GOAL** | context-broker | Goal lifecycle (submitted/decomposed/done/failed) |
| **DISCOVERY** | vessel.json | Agent capability advertisement |
| **EMIT** | emergence-bus | Pub/sub events (10 types) |

## Event Structure

Every UES event has:
- `type`: one of 8 event types
- `timestamp`: ISO 8601
- `agent_id`: globally unique
- `session_id`: conversation continuity
- `parent_event_id`: causal chaining
- `payload`: type-specific data

## Transport Independence

UES events can flow over any reliable byte stream:
- **stdio**: Agent CLI communication
- **HTTP**: REST API integration
- **WebSocket**: Real-time bidirectional
- **KV**: Cloudflare Workers pub/sub
- **MQTT**: IoT/edge devices

## What This Enables

The UES makes the [Cognition Mesh](#) possible: any agent from any framework can communicate with any other, using the same four operations. CheetahClaws, Cocapn vessels, git-claw, agentkernel — all speak the same language.

## Files

- `ues-spec.ts` — Complete TypeScript specification (271 lines)
- `increments-trust.ts` — INCREMENTS trust module (188 lines)
- `UES-PAPER.md` — Research paper: "HTTP for Cognition"
- `FLEET-ACTION-PLAN.md` — Concrete action plan for fleet integration

## Origin

Synthesized from the [CheetahClaws Reverse-Actualization Ideation Library](https://github.com/SuperInstance/cheetahclaws) (25 rounds, 100 years, 9 projects) and the Cocapn fleet architecture (150+ vessels).

---

<i>Built with [Cocapn](https://github.com/Lucineer/cocapn-ai).</i>
<i>Part of the [Lucineer fleet](https://github.com/Lucineer).</i>

Superinstance & Lucineer (DiGennaro et al.)
