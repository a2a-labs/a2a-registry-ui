import type { RegisteredAgent } from "./types";

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
const expires = (minutes: number) => new Date(now + minutes * 60_000).toISOString();

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
}): RegisteredAgent {
  return {
    id: input.id,
    name: input.name,
    endpoint: `https://${input.id}.agents.example/a2a`,
    ttlSeconds: 3600,
    agentCard: {
      name: input.name,
      description: input.description,
      version: "1.0.0",
      supportedInterfaces: [{ url: `https://${input.id}.agents.example/a2a`, protocolBinding: "HTTP+JSON", protocolVersion: "1.0" }],
      capabilities: { streaming: true, pushNotifications: false, stateTransitionHistory: true, ...input.capabilities },
      skills: input.skills.map((skill, index) => ({ id: skill.toLowerCase().replaceAll(" ", "-"), name: skill, tags: [input.category.toLowerCase()] , description: `${skill} for your team.` })),
    },
    registeredAt: new Date(now - 4 * 86_400_000).toISOString(),
    updatedAt: ago(input.minutesAgo),
    lastSeen: ago(input.minutesAgo),
    expiresAt: expires(3600 - input.minutesAgo),
    metadata: { owner: input.owner, category: input.category, color: input.color, environment: "Production" },
    revision: input.minutesAgo + 100,
  };
}

export const MOCK_AGENTS: RegisteredAgent[] = [
  mockAgent({ id: "agent_01HR7ZQ8F5", name: "Code Refactorer", description: "Refactors code for readability, maintainability, and performance while preserving behavior.", category: "Code Intelligence", owner: "dev-team", color: "violet", minutesAgo: 2, skills: ["Code Analysis", "Refactoring", "Static Analysis", "Linting", "Dependency Review", "Best Practices"], capabilities: { streaming: true, pushNotifications: true, fileAccess: true, humanInTheLoop: false } }),
  mockAgent({ id: "agent_01HR6YJ9K2", name: "Doc Summarizer", description: "Turns long documents into clear, structured summaries and key actions.", category: "Knowledge", owner: "platform-team", color: "blue", minutesAgo: 5, skills: ["Summarization", "Knowledge Extraction"], capabilities: { streaming: true, fileAccess: true } }),
  mockAgent({ id: "agent_01HR4X0M3N", name: "Test Generator", description: "Creates focused unit and integration tests from existing code and acceptance criteria.", category: "Quality Engineering", owner: "qa-team", color: "green", minutesAgo: 12, skills: ["Test Generation", "Quality Analysis"], capabilities: { streaming: false, pushNotifications: true } }),
  mockAgent({ id: "agent_01HR2V8P7T", name: "API Spec Builder", description: "Designs and validates API contracts from product requirements.", category: "Platform", owner: "platform-team", color: "indigo", minutesAgo: 35, skills: ["API Design", "Contract Testing"], capabilities: { streaming: true, fileAccess: false } }),
  mockAgent({ id: "agent_01HR0W6B1D", name: "DB Query Assistant", description: "Explains, optimizes, and safely composes analytical database queries.", category: "Data", owner: "data-team", color: "teal", minutesAgo: 60, skills: ["SQL", "Query Optimization"], capabilities: { streaming: true, pushNotifications: true } }),
  mockAgent({ id: "agent_01HQZ9L2C4", name: "Release Notes Writer", description: "Converts merged changes into useful, audience-aware release notes.", category: "Documentation", owner: "devrel-team", color: "gold", minutesAgo: 120, skills: ["Release Notes", "Technical Writing"], capabilities: { streaming: false, fileAccess: true } }),
  mockAgent({ id: "agent_01HQT7K0R9", name: "Security Scanner", description: "Finds common security risks and explains practical remediation steps.", category: "Security", owner: "sec-team", color: "red", minutesAgo: 180, skills: ["Security Review", "Threat Modeling"], capabilities: { streaming: true, pushNotifications: false } }),
  mockAgent({ id: "agent_01HQQ3F6S8", name: "Infra Advisor", description: "Helps teams reason about resilient cloud infrastructure and operations.", category: "Operations", owner: "ops-team", color: "slate", minutesAgo: 1440, skills: ["Cloud Architecture", "Incident Response"], capabilities: { streaming: false, pushNotifications: false } }),
];
