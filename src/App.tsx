import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { blockAgent, getAgent, listAgents, RegistryApiError } from "./api";
import { MOCK_AGENTS } from "./mockAgents";
import type { AgentActivity, AgentCard, RegisteredAgent } from "./types";
import "./styles.css";

type IconName =
  | "activity" | "agents" | "arrow" | "calendar" | "check" | "chevron" | "close" | "code" | "copy"
  | "database" | "document" | "filter" | "folder" | "home" | "key" | "menu" | "moon" | "refresh"
  | "search" | "settings" | "shield" | "spark" | "terminal" | "user" | "x";

function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactElement> = {
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    agents: <><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M9 9h.01M15 9h.01M8 14h8M12 2v3" /></>,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    filter: <><path d="M4 5h16M7 12h10M10 19h4" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M10 20v-6h4v6" /></>,
    key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l2 2M15 8l2 2" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5z" />,
    refresh: <><path d="M20 11a8 8 0 1 0 1 5" /><path d="M20 4v7h-7" /></>,
    search: <><circle cx="10.7" cy="10.7" r="6.8" /><path d="m16 16 5 5" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05-1.4 1.4-.05-.05a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.65V20h-2v-.31a1.8 1.8 0 0 0-1.08-1.65 1.8 1.8 0 0 0-2 .36l-.05.05-1.4-1.4.05-.05a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.08H7.2v-2h.31a1.8 1.8 0 0 0 1.65-1.08 1.8 1.8 0 0 0-.36-2l-.05-.05 1.4-1.4.05.05a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 13.28 6V5.7h2V6a1.8 1.8 0 0 0 1.08 1.65 1.8 1.8 0 0 0 2-.36l.05-.05 1.4 1.4-.05.05a1.8 1.8 0 0 0-.36 2A1.8 1.8 0 0 0 21.05 12h.31v2h-.31A1.8 1.8 0 0 0 19.4 15z" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function activityFor(agent: RegisteredAgent): AgentActivity {
  const ageSeconds = Math.max(0, Date.now() - Date.parse(agent.lastSeen)) / 1000;
  if (Date.parse(agent.expiresAt) <= Date.now()) return "inactive";
  if (ageSeconds > agent.ttlSeconds * 0.55) return "idle";
  return "active";
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
  return agent.metadata.owner ?? agent.metadata.ownerTeam ?? agent.metadata.team ?? "Unassigned";
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

function AgentAvatar({ agent, large = false }: { agent: RegisteredAgent; large?: boolean }) {
  const color = agent.metadata.color ?? "slate";
  const icon = categoryFor(agent).toLowerCase().includes("data") ? "database" : categoryFor(agent).toLowerCase().includes("security") ? "shield" : categoryFor(agent).toLowerCase().includes("document") ? "document" : categoryFor(agent).toLowerCase().includes("code") ? "activity" : "spark";
  return <div className={`agent-avatar agent-avatar-${color} ${large ? "agent-avatar-large" : ""}`}><Icon name={icon as IconName} size={large ? 30 : 20} strokeWidth={1.7} /></div>;
}

function ActivityBadge({ activity }: { activity: AgentActivity }) {
  const label = activity[0]!.toUpperCase() + activity.slice(1);
  return <span className={`activity-badge activity-${activity}`}><span className="activity-dot" />{label}</span>;
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const navigation: Array<{ label: string; icon: IconName; selected?: boolean }> = [
    { label: "Overview", icon: "home" },
    { label: "Agents", icon: "agents", selected: true },
    { label: "Leases", icon: "calendar" },
    { label: "Requests", icon: "document" },
    { label: "Keys", icon: "key" },
    { label: "Audit Log", icon: "activity" },
    { label: "Policies", icon: "shield" },
    { label: "Settings", icon: "settings" },
  ];
  return <>
    <div className={`sidebar-backdrop ${mobileOpen ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
    <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Main navigation">
      <div className="sidebar-brand"><span className="brand-mark"><Icon name="terminal" size={21} /></span><span>A2A Registry</span></div>
      <nav>
        {navigation.map((item) => <button className={`nav-item ${item.selected ? "is-selected" : ""}`} key={item.label} type="button" onClick={onClose}><Icon name={item.icon} size={18} /><span>{item.label}</span></button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="environment"><span>Environment</span><strong>Production</strong><Icon name="chevron" size={14} /></div>
        <div className="profile"><span className="profile-avatar">AD</span><span><strong>Alex Dev</strong><small>Platform Admin</small></span><Icon name="chevron" size={14} /></div>
        <button className="collapse-button" type="button" onClick={onClose}><span>‹</span> Collapse</button>
      </div>
    </aside>
  </>;
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

function DetailsPanel({ agent, onClose, onBlock }: { agent: RegisteredAgent; onClose: () => void; onBlock: () => void }) {
  const [copied, setCopied] = useState("");
  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); window.setTimeout(() => setCopied(""), 1500); } catch { /* clipboard is optional */ }
  };
  const activity = activityFor(agent);
  const skills = cardSkills(agent.agentCard);
  const capabilities: Array<[string, string]> = [["Streaming", "streaming"], ["Long running", "longRunningTasks"], ["Push notifications", "pushNotifications"], ["Sandboxed", "sandboxed"], ["File access", "fileAccess"], ["Human-in-the-loop", "humanInTheLoop"]];
  return <aside className="details-panel" aria-label={`Details for ${agent.name}`}>
    <div className="details-heading"><h2>{agent.name}</h2><button type="button" className="icon-button" aria-label="Close details" onClick={onClose}><Icon name="close" size={21} /></button><p>{agent.id} <button type="button" className="copy-button" onClick={() => void copy(agent.id, "id")} aria-label="Copy agent ID"><Icon name="copy" size={15} /></button>{copied === "id" && <span className="copied-label">Copied</span>}</p></div>
    <div className="details-identity"><AgentAvatar agent={agent} large /><dl className="identity-list"><div><dt>Status</dt><dd><ActivityBadge activity={activity} /></dd></div><div><dt>Lease status</dt><dd><span className="lease-dot" />Leased</dd></div><div><dt>Owner</dt><dd>{ownerFor(agent)}</dd></div><div><dt>Registered</dt><dd>{formatDate(agent.registeredAt)}</dd></div><div><dt>Last seen</dt><dd>{formatRelative(agent.lastSeen)}</dd></div></dl></div>
    <section className="details-section"><div className="section-heading"><h3>Endpoint</h3><button type="button" className="copy-button" aria-label="Copy endpoint" onClick={() => void copy(agent.endpoint, "endpoint")}><Icon name="copy" size={15} /></button></div><div className="endpoint-box">{agent.endpoint}</div>{copied === "endpoint" && <span className="copied-label copied-block">Copied</span>}</section>
    <section className="details-section"><h3>Description</h3><p className="description">{agent.agentCard.description ?? "No description provided."}</p></section>
    <section className="details-section"><h3>Skills</h3><div className="skill-list">{skills.length ? skills.map((skill) => <span key={skill}>{skill}</span>) : <span className="muted">No skills listed</span>}</div></section>
    <section className="details-section"><h3>Capabilities</h3><div className="capability-grid">{capabilities.map(([label, key]) => <div className="capability" key={key}><span className="capability-icon"><Icon name={key === "streaming" ? "activity" : key === "fileAccess" ? "folder" : key === "sandboxed" ? "shield" : key === "humanInTheLoop" ? "user" : key === "pushNotifications" ? "spark" : "moon"} size={16} /></span><span>{label}</span><strong className={capEnabled(agent.agentCard, key) ? "is-yes" : "is-no"}>{capEnabled(agent.agentCard, key) ? "Yes" : "No"}</strong></div>)}</div></section>
    <section className="details-section lease-section"><h3>Lease</h3><dl className="lease-list"><div><dt>Lease ID</dt><dd>{agent.id.slice(0, 12)} <button type="button" className="copy-button" aria-label="Copy lease ID" onClick={() => void copy(agent.id, "lease")}><Icon name="copy" size={14} /></button></dd></div><div><dt>Leased by</dt><dd>{ownerFor(agent)}</dd></div><div><dt>Since</dt><dd>{formatDate(agent.updatedAt)} ({formatRelative(agent.updatedAt)})</dd></div><div><dt>Expires</dt><dd>{formatDate(agent.expiresAt)} (in {formatDuration(agent.expiresAt)})</dd></div></dl></section>
    <div className="block-area"><button type="button" className="block-button" onClick={onBlock}><Icon name="shield" size={17} />Block agent</button><p>Blocking this agent will remove it from discovery.</p></div>
  </aside>;
}

function BlockModal({ agent, token, setToken, error, onCancel, onConfirm, isBlocking }: { agent: RegisteredAgent; token: string; setToken: (value: string) => void; error: string; onCancel: () => void; onConfirm: () => void; isBlocking: boolean }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="block-title"><div className="modal-icon"><Icon name="shield" size={22} /></div><button type="button" className="modal-close icon-button" aria-label="Close dialog" onClick={onCancel}><Icon name="close" size={18} /></button><h2 id="block-title">Block {agent.name}?</h2><p>This unregisters <strong>{agent.id}</strong> and removes it from discovery. The agent can register again later with a new lease.</p><label className="token-label">Registry write token <span>(optional)</span><input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Required when REGISTRY_WRITE_TOKEN is enabled" autoComplete="off" /></label>{error && <p className="modal-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="button" className="danger-button" onClick={onConfirm} disabled={isBlocking}>{isBlocking ? "Blocking…" : "Block agent"}</button></div></div></div>;
}

export default function App() {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
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
  const [mobileNav, setMobileNav] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [blockToken, setBlockToken] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await listAgents();
      setAgents(page.agents);
      setDemoMode(false);
      setSelectedId((current) => current && page.agents.some((agent) => agent.id === current) ? current : page.agents[0]?.id ?? null);
    } catch (loadError) {
      const message = loadError instanceof RegistryApiError ? loadError.message : "Registry could not be reached";
      setError(message);
      setAgents(MOCK_AGENTS);
      setDemoMode(true);
      setSelectedId((current) => current ?? MOCK_AGENTS[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    const local = agents.find((agent) => agent.id === selectedId);
    setDetail(local ?? null);
    if (demoMode) return;
    void getAgent(selectedId).then(setDetail).catch(() => { /* list data is enough for the panel */ });
  }, [selectedId, agents, demoMode]);

  const filteredAgents = useMemo(() => agents.filter((agent) => {
    const haystack = [agent.id, agent.name, agent.agentCard.description, ownerFor(agent), categoryFor(agent), ...cardSkills(agent.agentCard), ...cardTags(agent.agentCard), ...Object.values(agent.metadata)].join(" ").toLowerCase();
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
  const openBlock = () => { setBlockError(""); setBlockToken(window.localStorage.getItem("a2a-registry-write-token") ?? ""); setModalOpen(true); };
  const performBlock = async () => {
    if (!detail) return;
    setBlocking(true); setBlockError("");
    try {
      if (demoMode) {
        setAgents((current) => current.filter((agent) => agent.id !== detail.id));
      } else {
        await blockAgent(detail.id, blockToken);
        setAgents((current) => current.filter((agent) => agent.id !== detail.id));
      }
      setSelectedId(null); setDetail(null); setModalOpen(false); setToast(`${detail.name} was blocked and removed from discovery.`); window.setTimeout(() => setToast(""), 4500);
    } catch (blockErrorValue) {
      setBlockError(blockErrorValue instanceof RegistryApiError ? blockErrorValue.message : "The agent could not be blocked.");
    } finally { setBlocking(false); }
  };

  return <div className="app-shell">
    <Sidebar mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />
    <main className="main-content">
      <header className="page-header"><button type="button" className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Icon name="menu" size={22} /></button><div><h1>Agent Registry</h1><p>Discover and manage registered A2A agents in your organization.</p></div><button type="button" className="theme-button icon-button" aria-label="Toggle theme"><Icon name="moon" size={19} /></button></header>
      {demoMode && <div className="demo-banner" role="status"><Icon name="spark" size={17} /><span><strong>Demo data</strong> — the registry API is unavailable, so you’re viewing sample agents.</span><button type="button" onClick={() => void load()}>Retry connection</button></div>}
      {error && !demoMode && <div className="error-banner" role="alert">{error}</div>}
      <section className="workspace" aria-label="Agent discovery">
        <div className="toolbar"><label className="search-field"><Icon name="search" size={19} /><span className="sr-only">Search agents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents by name, id, or owner…" /></label><label className="status-select"><span>Status:</span><select value={status} onChange={(event) => setStatus(event.target.value as "all" | AgentActivity)}><option value="all">All</option><option value="active">Active</option><option value="idle">Idle</option><option value="inactive">Inactive</option></select></label><button type="button" className={`filter-button ${filterOpen || activeFilters ? "is-active" : ""}`} onClick={() => setFilterOpen((open) => !open)}><Icon name="filter" size={17} />More filters{activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}</button><button type="button" className="refresh-button icon-button" aria-label="Refresh agents" onClick={() => void load()} disabled={loading}><Icon name="refresh" size={18} /></button></div>
        <FilterPanel open={filterOpen} skill={skill} tag={tag} capability={capability} protocol={protocol} setSkill={setSkill} setTag={setTag} setCapability={setCapability} setProtocol={setProtocol} clear={clearFilters} />
        <div className="results-heading"><span>{loading ? "Loading agents…" : `${filteredAgents.length} ${filteredAgents.length === 1 ? "agent" : "agents"}`}</span>{(query || status !== "all" || activeFilters > 0) && <button type="button" className="clear-inline" onClick={clearFilters}>Clear filters</button>}</div>
        {loading ? <div className="loading-list" aria-label="Loading agents">{Array.from({ length: 5 }).map((_, index) => <div className="skeleton-row" key={index}><span /><span /><span /><span /></div>)}</div> : filteredAgents.length === 0 ? <EmptyState clear={clearFilters} /> : <div className="agent-table" role="table" aria-label="Registered agents"><div className="table-head" role="row"><span>Agent name</span><span>Agent ID</span><span>Status</span><span>Lease status</span><span>Owner</span><span>Last seen <span className="sort-mark">↕</span></span><span /></div>{filteredAgents.map((agent) => <button type="button" role="row" className={`agent-row ${selectedId === agent.id ? "is-selected" : ""}`} key={agent.id} onClick={() => setSelectedId(agent.id)}><span className="agent-name-cell"><AgentAvatar agent={agent} /><span><strong>{agent.name}</strong><small>{categoryFor(agent)}</small></span></span><span className="agent-id">{agent.id}</span><span><ActivityBadge activity={activityFor(agent)} /></span><span className="lease-cell"><span className="lease-dot" />Leased</span><span className="owner-cell">{ownerFor(agent)}</span><span className="last-seen">{formatRelative(agent.lastSeen)}</span><span className="row-arrow"><Icon name="chevron" size={18} /></span></button>)}</div>}
      </section>
    </main>
    {detail && <DetailsPanel agent={detail} onClose={() => setSelectedId(null)} onBlock={openBlock} />}
    {modalOpen && detail && <BlockModal agent={detail} token={blockToken} setToken={setBlockToken} error={blockError} onCancel={() => setModalOpen(false)} onConfirm={() => void performBlock()} isBlocking={blocking} />}
    {toast && <div className="toast" role="status"><Icon name="check" size={17} />{toast}</div>}
  </div>;
}
