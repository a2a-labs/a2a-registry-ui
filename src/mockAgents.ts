import type { AgentInstance, RegisteredAgent } from "./types";

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
const expiresAfter = (minutesAgo: number, ttlSeconds: number) =>
  new Date(now - minutesAgo * 60_000 + ttlSeconds * 1_000).toISOString();

function mockAgent(input: {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  color: string;
  minutesAgo: number;
  skills: string[];
  capabilities?: Record<string, boolean>;
  instanceCount?: number;
}): RegisteredAgent {
  const ttlSeconds = 3600;
  const zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"];
  const instances: AgentInstance[] = Array.from({ length: input.instanceCount ?? 1 }, (_, index) => {
    const minutesAgo = Math.min(input.minutesAgo + index * 3, 48);
    const instanceId = zones[index] ?? `replica-${index + 1}`;
    return {
      instanceId,
      endpoint: `https://${input.id}-${instanceId}.agents.example/a2a`,
      ttlSeconds,
      registeredAt: new Date(now - (4 + index) * 86_400_000).toISOString(),
      updatedAt: ago(minutesAgo),
      lastSeen: ago(minutesAgo),
      expiresAt: expiresAfter(minutesAgo, ttlSeconds),
      metadata: {
        owner: input.owner,
        category: input.category,
        color: input.color,
        environment: "Production",
        zone: instanceId,
      },
      revision: input.minutesAgo + index + 100,
    };
  });
  const primary = instances[0]!;
  return {
    id: input.id,
    name: input.name,
    agentCard: {
      name: input.name,
      description: input.description,
      version: "1.0.0",
      supportedInterfaces: [{ url: `https://${input.id}.agents.example/a2a`, protocolBinding: "HTTP+JSON", protocolVersion: "1.0" }],
      capabilities: { streaming: true, pushNotifications: false, stateTransitionHistory: true, ...input.capabilities },
      skills: input.skills.map((skill, index) => ({ id: skill.toLowerCase().replaceAll(" ", "-"), name: skill, tags: [input.category.toLowerCase()] , description: `${skill} for your team.` })),
    },
    instances,
    instanceCount: instances.length,
    endpoint: primary.endpoint,
    ttlSeconds: primary.ttlSeconds,
    registeredAt: instances.at(-1)!.registeredAt,
    updatedAt: primary.updatedAt,
    lastSeen: primary.lastSeen,
    expiresAt: primary.expiresAt,
    metadata: primary.metadata,
    revision: Math.max(...instances.map((instance) => instance.revision)),
  };
}

export const MOCK_AGENTS: RegisteredAgent[] = [
  mockAgent({ id: "agent_01HR7ZQ8F5", name: "Code Refactorer", description: "Refactors code for readability, maintainability, and performance while preserving behavior.", category: "Code Intelligence", owner: "dev-team", color: "violet", minutesAgo: 2, skills: ["Code Analysis", "Refactoring", "Static Analysis", "Linting", "Dependency Review", "Best Practices"], capabilities: { streaming: true, pushNotifications: true }, instanceCount: 3 }),
  mockAgent({ id: "agent_01HR6YJ9K2", name: "Doc Summarizer", description: "Turns long documents into clear, structured summaries and key actions.", category: "Knowledge", owner: "platform-team", color: "blue", minutesAgo: 5, skills: ["Summarization", "Knowledge Extraction"], capabilities: { streaming: true }, instanceCount: 2 }),
  mockAgent({ id: "agent_01HR4X0M3N", name: "Test Generator", description: "Creates focused unit and integration tests from existing code and acceptance criteria.", category: "Quality Engineering", owner: "qa-team", color: "green", minutesAgo: 12, skills: ["Test Generation", "Quality Analysis"], capabilities: { streaming: false, pushNotifications: true } }),
  mockAgent({ id: "agent_01HR2V8P7T", name: "API Spec Builder", description: "Designs and validates API contracts from product requirements.", category: "Platform", owner: "platform-team", color: "indigo", minutesAgo: 21, skills: ["API Design", "Contract Testing"], capabilities: { streaming: true }, instanceCount: 2 }),
  mockAgent({ id: "agent_01HR0W6B1D", name: "DB Query Assistant", description: "Explains, optimizes, and safely composes analytical database queries.", category: "Data", owner: "data-team", color: "teal", minutesAgo: 27, skills: ["SQL", "Query Optimization"], capabilities: { streaming: true, pushNotifications: true }, instanceCount: 2 }),
  mockAgent({ id: "agent_01HQZ9L2C4", name: "Release Notes Writer", description: "Converts merged changes into useful, audience-aware release notes.", category: "Documentation", owner: "devrel-team", color: "gold", minutesAgo: 34, skills: ["Release Notes", "Technical Writing"], capabilities: { streaming: false } }),
  mockAgent({ id: "agent_01HQT7K0R9", name: "Security Scanner", description: "Finds common security risks and explains practical remediation steps.", category: "Security", owner: "sec-team", color: "red", minutesAgo: 39, skills: ["Security Review", "Threat Modeling"], capabilities: { streaming: true, pushNotifications: false }, instanceCount: 3 }),
  mockAgent({ id: "agent_01HQQ3F6S8", name: "Infra Advisor", description: "Helps teams reason about resilient cloud infrastructure and operations.", category: "Operations", owner: "ops-team", color: "slate", minutesAgo: 45, skills: ["Cloud Architecture", "Incident Response"], capabilities: { streaming: false, pushNotifications: false } }),
];
