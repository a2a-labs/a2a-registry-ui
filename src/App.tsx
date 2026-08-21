import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { getAgent, getRegistryInfo, listAgents } from "./api";
import type { AgentActivity, AgentCard, AgentInstance, RegisteredAgent, RegistryInfo } from "./types";
import "./styles.css";

type IconName =
  | "activity" | "agents" | "chevron" | "close" | "copy" | "database" | "document"
  | "filter" | "menu" | "refresh" | "search" | "shield" | "spark" | "terminal";

function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactElement> = {
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    agents: <><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M9 9h.01M15 9h.01M8 14h8M12 2v3" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    filter: <><path d="M4 5h16M7 12h10M10 19h4" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    refresh: <><path d="M20 11a8 8 0 1 0 1 5" /><path d="M20 4v7h-7" /></>,
    search: <><circle cx="10.7" cy="10.7" r="6.8" /><path d="m16 16 5 5" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function activityForInstance(instance: AgentInstance): AgentActivity {
  const ageSeconds = Math.max(0, Date.now() - Date.parse(instance.lastSeen)) / 1000;
  if (ageSeconds > instance.ttlSeconds * 0.55) return "idle";
  return "active";
}

function activityFor(agent: RegisteredAgent): AgentActivity {
  return agent.instances.some((instance) => activityForInstance(instance) === "active") ? "active" : "idle";
}

function formatRelative(date: string): string {
  const delta = Math.max(0, Date.now() - Date.parse(date));
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.valueOf()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function formatDuration(date: string): string {
  const remaining = Math.max(0, Date.parse(date) - Date.now());
  const minutes = Math.floor(remaining / 60_000);
  if (minutes < 1) return "under 1m";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function categoryFor(agent: RegisteredAgent): string {
  return agent.metadata.category ?? agent.agentCard.skills?.[0]?.name ?? "General";
}

function ownerFor(agent: RegisteredAgent): string {
  const metadata = Object.keys(agent.metadata).length > 0 ? agent.metadata : agent.instances[0]?.metadata ?? {};
  return metadata.owner ?? metadata.ownerTeam ?? metadata.team ?? "Unassigned";
}

function cardSkills(card: AgentCard): string[] {
  return (card.skills ?? []).flatMap((skill) => typeof skill === "object" && skill ? [skill.name ?? skill.id ?? "Unnamed skill"] : []).filter(Boolean);
}

function cardTags(card: AgentCard): string[] {
  return (card.skills ?? []).flatMap((skill) => typeof skill === "object" && skill ? skill.tags ?? [] : []).filter(Boolean);
}

function capEnabled(card: AgentCard, key: string): boolean {
  const value = card.capabilities?.[key];
  return value === true;
}

function capabilityLabel(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (value) => value.toUpperCase());
}

function AgentAvatar({ agent, large = false }: { agent: RegisteredAgent; large?: boolean }) {
  const color = agent.metadata.color ?? "slate";
  const icon = categoryFor(agent).toLowerCase().includes("data") ? "database" : categoryFor(agent).toLowerCase().includes("security") ? "shield" : categoryFor(agent).toLowerCase().includes("document") ? "document" : categoryFor(agent).toLowerCase().includes("code") ? "activity" : "spark";
  return <div className={`agent-avatar agent-avatar-${color} ${large ? "agent-avatar-large" : ""}`}><Icon name={icon as IconName} size={large ? 30 : 20} strokeWidth={1.7} /></div>;
}

function ActivityBadge({ activity }: { activity: AgentActivity }) {
  const label = activity[0]!.toUpperCase() + activity.slice(1);
  return <span className={`activity-badge activity-${activity}`}><span className="activity-dot" />{label}</span>;
}

function Sidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return <>
    <div className={`sidebar-backdrop ${expanded ? "is-open" : ""}`} onClick={onToggle} aria-hidden="true" />
    <aside className={`sidebar ${expanded ? "is-expanded" : "is-mini"}`} aria-label="Main navigation">
      <div className="sidebar-brand"><button type="button" className="brand-mark" aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={expanded} onClick={onToggle}><Icon name="terminal" size={21} /></button><span>A2A Registry</span></div>
      <nav><button className="nav-item is-selected" type="button"><Icon name="agents" size={18} /><span>Agents</span></button></nav>
    </aside>
  </>;
}

function ServerStatusBar({ info }: { info: RegistryInfo | null }) {
  const status = info?.status === "ready" ? "ready" : info ? "not ready" : "unavailable";
  return <section className="server-status-bar" aria-label="Server information">
    <div className="server-status-heading"><span className={`server-status-dot server-status-${status.replace(" ", "-")}`} />Server <strong>{status}</strong></div>
    {info ? <dl className="server-status-facts">
      <div><dt>URL</dt><dd title={info.url}>{info.url}</dd></div>
      <div><dt>Version</dt><dd>{info.version}</dd></div>
      <div><dt>API</dt><dd>{info.apiVersion}</dd></div>
      <div><dt>Store</dt><dd>{info.store}</dd></div>
    </dl> : <p className="server-status-empty">Server details unavailable</p>}
    {info ? <a className="server-status-docs" href={info.documentation} target="_blank" rel="noreferrer">API documentation <Icon name="chevron" size={13} /></a> : null}
  </section>;
}

function FilterPanel({ open, skill, tag, capability, protocol, setSkill, setTag, setCapability, setProtocol, clear }: {
  open: boolean; skill: string; tag: string; capability: string; protocol: string;
  setSkill: (value: string) => void; setTag: (value: string) => void; setCapability: (value: string) => void; setProtocol: (value: string) => void; clear: () => void;
}) {
  if (!open) return null;
  return <div className="filter-panel" role="region" aria-label="Additional filters">
    <label>Skill<input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="e.g. summarization" /></label>
    <label>Tag<input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="e.g. knowledge" /></label>
    <label>Capability<select value={capability} onChange={(event) => setCapability(event.target.value)}><option value="">Any capability</option><option value="streaming">Streaming</option><option value="pushNotifications">Push notifications</option><option value="stateTransitionHistory">State history</option></select></label>
    <label>Protocol<select value={protocol} onChange={(event) => setProtocol(event.target.value)}><option value="">Any protocol</option><option value="HTTP+JSON">HTTP+JSON</option><option value="JSONRPC">JSON-RPC</option><option value="GRPC">gRPC</option></select></label>
    <button type="button" className="link-button" onClick={clear}>Clear filters</button>
  </div>;
}

function EmptyState({ clear }: { clear: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="filter" size={28} /></span><h3>No agents match your filters</h3><p>Try adjusting your search or status filters.</p><button type="button" className="secondary-button" onClick={clear}>Clear filters</button></div>;
}

function ConnectionError({ message, retry }: { message: string; retry: () => void }) {
  return <div className="empty-state connection-error" role="alert"><span className="empty-icon"><Icon name="database" size={28} /></span><h3>Unable to connect to registry-server</h3><p>{message}</p><button type="button" className="secondary-button" onClick={retry}>Retry connection</button></div>;
}

function DetailsPanel({ agent, onClose }: { agent: RegisteredAgent; onClose: () => void }) {
  const [copied, setCopied] = useState("");
  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1500); } catch { /* clipboard is optional */ }
  };
  const activity = activityFor(agent);
  const skills = cardSkills(agent.agentCard);
  const capabilities = Object.entries(agent.agentCard.capabilities ?? {})
    .filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean");
  return <aside className="details-panel" aria-label={`Details for ${agent.name}`}>
    <div className="details-heading"><h2>{agent.name}</h2><button type="button" className="icon-button" aria-label="Close details" onClick={onClose}><Icon name="close" size={21} /></button><p>{agent.id} <button type="button" className="copy-button" onClick={() => void copy(agent.id, "id")} aria-label="Copy agent ID"><Icon name="copy" size={15} /></button>{copied === "id" && <span className="copied-label">Copied</span>}</p></div>
    <div className="details-identity"><AgentAvatar agent={agent} large /><dl className="identity-list"><div><dt>Status</dt><dd><ActivityBadge activity={activity} /></dd></div><div><dt>Instances</dt><dd>{agent.instanceCount} active</dd></div><div><dt>Owner</dt><dd>{ownerFor(agent)}</dd></div><div><dt>Registered</dt><dd>{formatDate(agent.registeredAt)}</dd></div><div><dt>Last seen</dt><dd>{formatRelative(agent.lastSeen)}</dd></div></dl></div>
    <section className="details-section"><h3>Description</h3><p className="description">{agent.agentCard.description ?? "No description provided."}</p></section>
    <section className="details-section"><h3>Skills</h3><div className="skill-list">{skills.length ? skills.map((skill) => <span key={skill}>{skill}</span>) : <span className="muted">No skills listed</span>}</div></section>
    {capabilities.length > 0 ? <section className="details-section"><h3>Published capabilities</h3><div className="capability-grid">{capabilities.map(([key, enabled]) => <div className="capability" key={key}><span className="capability-icon"><Icon name={key === "streaming" ? "activity" : "spark"} size={16} /></span><span>{capabilityLabel(key)}</span><strong className={enabled ? "is-yes" : "is-no"}>{enabled ? "Yes" : "No"}</strong></div>)}</div></section> : null}
    <section className="details-section instances-section"><div className="section-heading"><h3>Active instances</h3><span className="instance-total">{agent.instanceCount}</span></div><div className="instance-list">{agent.instances.map((instance) => {
      const copyKey = `endpoint-${instance.instanceId}`;
      const location = instance.metadata.zone ?? instance.metadata.region;
      return <article className="instance-card" key={instance.instanceId}>
        <div className="instance-heading"><div><strong>{instance.instanceId}</strong>{location ? <span>{location}</span> : null}</div><ActivityBadge activity={activityForInstance(instance)} /></div>
        <div className="instance-endpoint"><code>{instance.endpoint}</code><button type="button" className="copy-button" aria-label={`Copy endpoint for ${instance.instanceId}`} onClick={() => void copy(instance.endpoint, copyKey)}><Icon name="copy" size={14} /></button></div>
        {copied === copyKey ? <span className="copied-label copied-block">Copied</span> : null}
        <dl className="instance-facts"><div><dt>Last seen</dt><dd>{formatRelative(instance.lastSeen)}</dd></div><div><dt>Lease expires</dt><dd>in {formatDuration(instance.expiresAt)}</dd></div></dl>
      </article>;
    })}</div></section>
  </aside>;
}

export default function App() {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AgentActivity>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [skill, setSkill] = useState("");
  const [tag, setTag] = useState("");
  const [capability, setCapability] = useState("");
  const [protocol, setProtocol] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RegisteredAgent | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => typeof window === "undefined" || !window.matchMedia("(max-width: 980px)").matches);
  const [registryInfo, setRegistryInfo] = useState<RegistryInfo | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await listAgents();
      setAgents(page.agents);
      setSelectedId((current) => current && page.agents.some((agent) => agent.id === current) ? current : page.agents[0]?.id ?? null);
      try {
        setRegistryInfo(await getRegistryInfo());
      } catch {
        setRegistryInfo(null);
      }
    } catch {
      setError("Make sure registry-server is running and reachable, then try again.");
      setAgents([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    const local = agents.find((agent) => agent.id === selectedId);
    setDetail(local ?? null);
    void getAgent(selectedId).then(setDetail).catch(() => { /* list data is enough for the panel */ });
  }, [selectedId, agents]);

  const filteredAgents = useMemo(() => agents.filter((agent) => {
    const instanceValues = agent.instances.flatMap((instance) => [
      instance.instanceId,
      instance.endpoint,
      ...Object.values(instance.metadata),
    ]);
    const haystack = [agent.id, agent.name, agent.agentCard.description, ownerFor(agent), categoryFor(agent), ...cardSkills(agent.agentCard), ...cardTags(agent.agentCard), ...Object.values(agent.metadata), ...instanceValues].join(" ").toLowerCase();
    if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return false;
    if (status !== "all" && activityFor(agent) !== status) return false;
    if (skill.trim() && !cardSkills(agent.agentCard).some((value) => value.toLowerCase().includes(skill.trim().toLowerCase()))) return false;
    if (tag.trim() && !cardTags(agent.agentCard).some((value) => value.toLowerCase().includes(tag.trim().toLowerCase()))) return false;
    if (capability && !capEnabled(agent.agentCard, capability)) return false;
    if (protocol && !(agent.agentCard.supportedInterfaces ?? []).some((item) => item.protocolBinding?.toLowerCase() === protocol.toLowerCase())) return false;
    return true;
  }), [agents, query, status, skill, tag, capability, protocol]);

  const clearFilters = () => { setQuery(""); setStatus("all"); setSkill(""); setTag(""); setCapability(""); setProtocol(""); };
  const activeFilters = [skill, tag, capability, protocol].filter(Boolean).length;
  return <div className={`app-shell ${detail ? "has-details" : ""}`}>
    <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((expanded) => !expanded)} />
    <main className="main-content">
      <ServerStatusBar info={registryInfo} />
      <section className="workspace" aria-label="Agent discovery">
        <div className="toolbar"><label className="search-field"><Icon name="search" size={19} /><span className="sr-only">Search agents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents by name, id, or owner…" /></label><label className="status-select"><span>Status:</span><select value={status} onChange={(event) => setStatus(event.target.value as "all" | AgentActivity)}><option value="all">All</option><option value="active">Active</option><option value="idle">Idle</option></select></label><button type="button" className={`filter-button ${filterOpen || activeFilters ? "is-active" : ""}`} onClick={() => setFilterOpen((open) => !open)}><Icon name="filter" size={17} />More filters{activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}</button><button type="button" className="refresh-button icon-button" aria-label="Refresh agents" onClick={() => void load()} disabled={loading}><Icon name="refresh" size={18} /></button></div>
        <FilterPanel open={filterOpen} skill={skill} tag={tag} capability={capability} protocol={protocol} setSkill={setSkill} setTag={setTag} setCapability={setCapability} setProtocol={setProtocol} clear={clearFilters} />
        <div className="results-heading"><span>{loading ? "Loading agents…" : error ? "Registry unavailable" : `${filteredAgents.length} ${filteredAgents.length === 1 ? "agent" : "agents"}`}</span>{!error && (query || status !== "all" || activeFilters > 0) && <button type="button" className="clear-inline" onClick={clearFilters}>Clear filters</button>}</div>
        {loading ? <div className="loading-list" aria-label="Loading agents">{Array.from({ length: 5 }).map((_, index) => <div className="skeleton-row" key={index}><span /><span /><span /><span /></div>)}</div> : error ? <ConnectionError message={error} retry={() => void load()} /> : filteredAgents.length === 0 ? <EmptyState clear={clearFilters} /> : <div className="agent-table" role="table" aria-label="Registered agents"><div className="table-head" role="row"><span>Agent name</span><span>Agent ID</span><span>Status</span><span>Instances</span><span>Owner</span><span>Last seen</span><span /></div>{filteredAgents.map((agent) => <button type="button" role="row" className={`agent-row ${selectedId === agent.id ? "is-selected" : ""}`} key={agent.id} onClick={() => setSelectedId(agent.id)}><span className="agent-name-cell"><AgentAvatar agent={agent} /><span><strong>{agent.name}</strong><small>{categoryFor(agent)}</small></span></span><span className="agent-id">{agent.id}</span><span><ActivityBadge activity={activityFor(agent)} /></span><span className="instance-count"><strong>{agent.instanceCount}</strong><small>{agent.instanceCount === 1 ? "instance" : "instances"}</small></span><span className="owner-cell">{ownerFor(agent)}</span><span className="last-seen">{formatRelative(agent.lastSeen)}</span><span className="row-arrow"><Icon name="chevron" size={18} /></span></button>)}</div>}
      </section>
    </main>
    {detail && <DetailsPanel agent={detail} onClose={() => setSelectedId(null)} />}
  </div>;
}
