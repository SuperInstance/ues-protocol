export type UESEventType = 
  | 'THINK' 
  | 'SPEAK' 
  | 'ACT' 
  | 'DONE' 
  | 'TRUST_UPDATE'
  | 'GOAL'
  | 'DISCOVERY'
  | 'EMIT';

export interface UESEventBase {
  type: UESEventType;
  timestamp: string;
  agent_id: string;
  session_id: string;
  parent_event_id: string | null;
}

export interface ThinkPayload {
  content: string;
  reasoning_trace?: string[];
}

export interface SpeakPayload {
  text: string;
  channel?: string;
}

export interface ActPayload {
  tool_name: string;
  input: Record<string, any>;
  output?: Record<string, any> | null;
  error?: string;
}

export interface DonePayload {
  summary: string;
  tokens_used: number;
  trust_delta: number;
}

export interface TrustUpdatePayload {
  increments: {
    reliability: number;
    competence: number;
    alignment: number;
    cooperation: number;
    transparency: number;
    efficiency: number;
    adaptability: number;
    security: number;
    privacy: number;
    fairness: number;
    accountability: number;
    sustainability: number;
  };
}

export interface GoalPayload {
  goal_id: string;
  status: 'submitted' | 'decomposed' | 'done' | 'failed';
  description: string;
  subgoals?: string[];
  result?: string;
}

export interface DiscoveryPayload {
  capabilities: string[];
  agent_version: string;
  supported_tools: string[];
}

export interface EmitPayload {
  channel: string;
  data: Record<string, any>;
}

export type UESPayload = 
  | ThinkPayload
  | SpeakPayload
  | ActPayload
  | DonePayload
  | TrustUpdatePayload
  | GoalPayload
  | DiscoveryPayload
  | EmitPayload;

export interface UESEvent extends UESEventBase {
  payload: UESPayload;
}

export interface UESProducer {
  emitThink(content: string, reasoning_trace?: string[]): void;
  emitSpeak(text: string, channel?: string): void;
  emitAct(tool_name: string, input: Record<string, any>, output?: Record<string, any> | null, error?: string): void;
  emitDone(summary: string, tokens_used: number, trust_delta: number): void;
  emitTrustUpdate(increments: TrustUpdatePayload['increments']): void;
  emitGoal(goal_id: string, status: GoalPayload['status'], description: string, subgoals?: string[], result?: string): void;
  emitDiscovery(capabilities: string[], agent_version: string, supported_tools: string[]): void;
  emitEmit(channel: string, data: Record<string, any>): void;
}

export interface UESConsumer {
  onThink(handler: (event: UESEvent & { type: 'THINK', payload: ThinkPayload }) => void): void;
  onSpeak(handler: (event: UESEvent & { type: 'SPEAK', payload: SpeakPayload }) => void): void;
  onAct(handler: (event: UESEvent & { type: 'ACT', payload: ActPayload }) => void): void;
  onDone(handler: (event: UESEvent & { type: 'DONE', payload: DonePayload }) => void): void;
  onTrustUpdate(handler: (event: UESEvent & { type: 'TRUST_UPDATE', payload: TrustUpdatePayload }) => void): void;
  onGoal(handler: (event: UESEvent & { type: 'GOAL', payload: GoalPayload }) => void): void;
  onDiscovery(handler: (event: UESEvent & { type: 'DISCOVERY', payload: DiscoveryPayload }) => void): void;
  onEmit(handler: (event: UESEvent & { type: 'EMIT', payload: EmitPayload }) => void): void;
}

export class UESValidator {
  static validate(event: any): event is UESEvent {
    if (!event || typeof event !== 'object') return false;
    if (!event.type || !event.timestamp || !event.agent_id || !event.session_id) return false;
    if (event.parent_event_id !== null && typeof event.parent_event_id !== 'string') return false;
    if (!event.payload || typeof event.payload !== 'object') return false;

    switch (event.type) {
      case 'THINK':
        return typeof event.payload.content === 'string';
      case 'SPEAK':
        return typeof event.payload.text === 'string';
      case 'ACT':
        return typeof event.payload.tool_name === 'string' && 
               typeof event.payload.input === 'object';
      case 'DONE':
        return typeof event.payload.summary === 'string' &&
               typeof event.payload.tokens_used === 'number' &&
               typeof event.payload.trust_delta === 'number';
      case 'TRUST_UPDATE':
        if (!event.payload.increments || typeof event.payload.increments !== 'object') return false;
        const inc = event.payload.increments;
        return typeof inc.reliability === 'number' &&
               typeof inc.competence === 'number' &&
               typeof inc.alignment === 'number' &&
               typeof inc.cooperation === 'number' &&
               typeof inc.transparency === 'number' &&
               typeof inc.efficiency === 'number' &&
               typeof inc.adaptability === 'number' &&
               typeof inc.security === 'number' &&
               typeof inc.privacy === 'number' &&
               typeof inc.fairness === 'number' &&
               typeof inc.accountability === 'number' &&
               typeof inc.sustainability === 'number';
      case 'GOAL':
        return typeof event.payload.goal_id === 'string' &&
               typeof event.payload.status === 'string' &&
               typeof event.payload.description === 'string';
      case 'DISCOVERY':
        return Array.isArray(event.payload.capabilities) &&
               typeof event.payload.agent_version === 'string' &&
               Array.isArray(event.payload.supported_tools);
      case 'EMIT':
        return typeof event.payload.channel === 'string' &&
               typeof event.payload.data === 'object';
      default:
        return false;
    }
  }
}

export function cheetahToUES(chunk: any, agent_id: string, session_id: string, parent_event_id: string | null): UESEvent | null {
  const timestamp = new Date().toISOString();
  
  if (chunk.type === 'ThinkingChunk') {
    return {
      type: 'THINK',
      timestamp,
      agent_id,
      session_id,
      parent_event_id,
      payload: { content: chunk.content, reasoning_trace: chunk.trace }
    };
  } else if (chunk.type === 'TextChunk') {
    return {
      type: 'SPEAK',
      timestamp,
      agent_id,
      session_id,
      parent_event_id,
      payload: { text: chunk.text, channel: chunk.channel }
    };
  }
  return null;
}

export function emergenceToUES(event: any, agent_id: string, session_id: string, parent_event_id: string | null): UESEvent | null {
  const timestamp = new Date().toISOString();
  
  if (event.type === 'pubsub') {
    return {
      type: 'EMIT',
      timestamp,
      agent_id,
      session_id,
      parent_event_id,
      payload: { channel: event.channel, data: event.data }
    };
  }
  return null;
}

export const UES_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "UESEvent",
  type: "object",
  required: ["type", "timestamp", "agent_id", "session_id", "parent_event_id", "payload"],
  properties: {
    type: { type: "string", enum: ["THINK", "SPEAK", "ACT", "DONE", "TRUST_UPDATE", "GOAL", "DISCOVERY", "EMIT"] },
    timestamp: { type: "string", format: "date-time" },
    agent_id: { type: "string" },
    session_id: { type: "string" },
    parent_event_id: { type: ["string", "null"] },
    payload: { type: "object" }
  }
};

export class StdioTransport {
  static send(event: UESEvent): void {
    console.log(JSON.stringify(event));
  }
  
  static receive(handler: (event: UESEvent) => void): void {
    process.stdin.on('data', (data) => {
      try {
        const event = JSON.parse(data.toString());
        if (UESValidator.validate(event)) {
          handler(event);
        }
      } catch (e) {}
    });
  }
}

export class HTTPTransport {
  static async send(url: string, event: UESEvent): Promise<Response> {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  }
  
  static createServer(port: number, handler: (event: UESEvent) => void): void {
    // Implementation would use http module
    console.log(`HTTP server would start on port ${port}`);
  }
}

export class KVTransport {
  private store: Map<string, UESEvent[]> = new Map();
  
  push(key: string, event: UESEvent): void {
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }
    this.store.get(key)!.push(event);
  }
  
  pop(key: string): UESEvent | null {
    const events = this.store.get(key);
    if (!events || events.length === 0) return null;
    return events.shift()!;
  }
  
  getAll(key: string): UESEvent[] {
    return this.store.get(key) || [];
  }
}