import type { AgentPage, RegisteredAgent } from "./types";

const configuredBase = (import.meta.env.VITE_REGISTRY_API_URL as string | undefined)?.trim();
export const API_BASE = (configuredBase ?? "").replace(/\/$/, "");

export class RegistryApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "RegistryApiError";
    this.status = status;
    this.code = code;
  }
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("a2a-registry-write-token")?.trim() ??
    (import.meta.env.VITE_REGISTRY_WRITE_TOKEN as string | undefined)?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...authHeaders(),
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new RegistryApiError(error instanceof Error ? error.message : "Registry could not be reached", 0);
  }

  if (!response.ok) {
    let detail = `Registry request failed (${response.status})`;
    let code: string | undefined;
    try {
      const body = await response.json() as { detail?: string; title?: string };
      detail = body.detail ?? body.title ?? detail;
      code = body.title;
    } catch {
      // Keep the useful status message when the response is not JSON.
    }
    throw new RegistryApiError(detail, response.status, code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listAgents(params?: {
  name?: string;
  skill?: string;
  tag?: string;
  capability?: string;
  protocolBinding?: string;
}): Promise<AgentPage> {
  const query = new URLSearchParams({ limit: "100" });
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value?.trim()) query.set(key, value.trim());
  }
  return request<AgentPage>(`/v1/agents?${query.toString()}`);
}

export async function getAgent(id: string): Promise<RegisteredAgent> {
  const response = await request<{ agent: RegisteredAgent }>(`/v1/agents/${encodeURIComponent(id)}`);
  return response.agent;
}

export async function blockAgent(id: string, token?: string): Promise<void> {
  const trimmed = token?.trim();
  if (trimmed) window.localStorage.setItem("a2a-registry-write-token", trimmed);
  await request<void>(`/v1/agents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: trimmed ? { Authorization: `Bearer ${trimmed}` } : undefined,
  });
}

