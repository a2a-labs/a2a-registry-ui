export interface AgentCard {
  name?: string;
  description?: string;
  version?: string;
  url?: string;
  supportedInterfaces?: Array<{
    url?: string;
    protocolBinding?: string;
    protocolVersion?: string;
  }>;
  capabilities?: Record<string, boolean | unknown>;
  skills?: Array<{
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
  }>;
  [key: string]: unknown;
}

export interface AgentInstance {
  instanceId: string;
  endpoint: string;
  ttlSeconds: number;
  registeredAt: string;
  updatedAt: string;
  lastSeen: string;
  expiresAt: string;
  metadata: Record<string, string>;
  revision: number;
}

export interface RegisteredAgent {
  id: string;
  name: string;
  agentCard: AgentCard;
  instances: AgentInstance[];
  instanceCount: number;

  /** Compatibility projection of the default or first active instance. */
  endpoint: string;
  ttlSeconds: number;
  registeredAt: string;
  updatedAt: string;
  lastSeen: string;
  expiresAt: string;
  metadata: Record<string, string>;
  revision: number;
}

export interface AgentPage {
  agents: RegisteredAgent[];
  total: number;
  nextCursor?: string;
  revision: number;
}

export type AgentActivity = "active" | "idle";
