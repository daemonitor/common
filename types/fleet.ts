// Shared TypeScript types for the observatory fleet dashboard.
// These match the data-backbone contract — other agents depend on these field names.
//
// Canonical home is @daemonitor/common so external consumers (e.g. the HERETIC
// portal) can import the exact same Service contract the daemonitor frontend
// renders. The frontend re-exports this from ~/types/fleet.

export type Level = 'ok' | 'warn' | 'crit' | 'standby'

export interface Unit {
  name: string
  state: string
  value: string
  level: Level
  // Optional type label (e.g. "Cloudflare · Pages", "Node · PM2", "Web check")
  // — used to disambiguate members in a group's health popover.
  kind?: string
}

export interface Metric {
  label: string
  value: string
  level: Level
}

// One real (physical/attached) drive on a host.
export interface DiskInfo {
  mount: string
  fstype: string
  pct: number
  used: number
  total: number
}

// A named service process group (nginx, php-fpm, mysql, …) on a host or in a
// container — aggregated across all its workers.
export interface ProcessInfo {
  name: string
  count: number
  cpu: number
  mem: number
}

export interface EventLine {
  time: string
  severity: Level
  message: string
}

// An outbound deep link for a service: the live thing it monitors (`site`) or
// an external admin/console surface (`admin`, e.g. the Cloudflare dashboard).
export interface ServiceLink {
  label: string
  href: string
  kind: 'site' | 'admin'
  icon?: string
}

export interface Service {
  id: string
  name: string
  stack: string // stack id
  env: 'production' | 'staging' | 'shared'
  kindLabel: string
  badge: string
  level: Level
  hasBars: boolean
  cpu: number
  mem: number
  ping: number
  age: number
  statusWord: string
  unitLabel: string
  units: Unit[]
  metrics?: Metric[]
  sparkline: number[]
  load: number[]
  // Rolling disk% history for host (os) services — powers the card's DISK
  // sparkline. Populated client-side by the fleet store (seeded from the DB),
  // like sparkline (cpu) and load (mem).
  diskSpark?: number[]
  events: EventLine[]
  ip?: string
  region?: string
  agent?: string
  // Storage: fullest real-drive usage % (for the bar), plus the per-drive list.
  disk?: number
  disks?: DiskInfo[]
  // Named service processes (nginx/php-fpm/db/…) on the host or in the container.
  processes?: ProcessInfo[]
  // For container services (docker/lxc): the host's disk %, inherited from the
  // sibling OS service on the same system (containers share the host disk).
  hostDisk?: number
  plugins: string[]
  lastReport: string
  // Outbound deep links (live site, Cloudflare dashboard, etc.). May be empty.
  links?: ServiceLink[]
  // Optional override for the card's click target. Regular services link to
  // /systems/<id>; a group item links to /groups.
  href?: string
  // Marks a synthetic item that stands in for a whole group (not a real service).
  isGroup?: boolean
  // Owning account (system.user_id, or the group's owner for group items). Used
  // by the "group by account" view mode. Undefined for orphan/pseudo services.
  ownerId?: string
  // Detailed Cloudflare zone security/caching breakdown (cloudflare-domain
  // services only), surfaced on the detail page. Optional/best-effort.
  cf?: CloudflareDetail
  // User has hidden this entity from the fleet views (local preference). Hidden
  // items are filtered out unless the global "show hidden" toggle is on, in
  // which case they render dimmed.
  hidden?: boolean
}

export interface CloudflareDetail {
  cacheHitRatio?: number
  bandwidthSaved?: number
  encryptedShare?: number
  errorRate?: number
  serverErrorRate?: number
  statusClasses?: Record<string, number>
  topCountries?: { country: string; requests: number; threats: number }[]
  security?: {
    window?: string
    totalEvents?: number
    mitigated?: number
    byAction?: Record<string, number>
    // Which Cloudflare security product handled the event (waf, firewallrules,
    // ratelimit, botFight, …) — the "what stopped it" view alongside byAction.
    bySource?: Record<string, number>
    topCountries?: { country: string; count: number }[]
    topSources?: { source: string; count: number }[]
    // Top individual WAF/firewall rules that fired (ruleId + its source). The
    // grouped dataset carries no human rule name, so ruleId is shown as-is.
    topRules?: { ruleId: string; source: string; count: number }[]
    error?: string
    /**
     * Set instead of querying when the reporter knows the answer in advance:
     * firewall events need Pro or above, so on a Free zone there is nothing to
     * ask for. Distinct from `error`, which means we asked and it failed.
     */
    unavailable?: 'plan' | 'disabled'
    /** What would make it available, e.g. "Pro". */
    requires?: string
  }
  // Bot Management score distribution (Enterprise-only; undefined otherwise).
  bot?: { window?: string; total?: number; bySource?: Record<string, number>; error?: string }
  // Real Web-Analytics (RUM) figures, when the zone has Web Analytics enabled.
  pageviews?: number
  visits?: number
  // Per-bucket traffic history (from detailedAnalytics.timeseries) for the zone
  // detail traffic chart. Newest last.
  timeseries?: { timestamp?: string; requests?: number; bandwidth?: number; threats?: number; uniques?: number }[]
  cache?: {
    window?: string
    total?: number
    byStatus?: Record<string, number>
    error?: string
  }
  // Turnstile challenge stats for this zone. Only present when the reporter runs
  // with INCLUDE_TURNSTILE and the zone has widgets.
  //
  // The zone rollup is TurnstileStats across every widget on the zone; `widgets`
  // carries the same shape per widget.
  //
  // The per-widget breakdown matters because a zone can host several widgets on
  // different hostnames (jobs.x.com, shop.x.com) with wildly different solve
  // rates, and consumers group by hostname — showing them the zone rollup would be
  // silently wrong. Narrowing by widget (rather than by the `hostnames` map) is
  // also the only way to keep verified/failed, since siteverify events are raised
  // server-side and carry no hostname.
  turnstile?: TurnstileStats & {
    window?: string
    widgets?: TurnstileStats[]
    error?: string
  }
}

/**
 * Turnstile challenge stats — used both for a single widget and for a zone-wide
 * rollup across widgets.
 */
export interface TurnstileStats {
  // Identity — set on per-widget entries, absent on a zone rollup.
  sitekey?: string
  name?: string
  mode?: string
  domains?: string[]

  // Challenges served to visitors.
  issued?: number
  // Solved in-browser. Excludes siteverify (see `verified`) — those are separate
  // events for the same challenge, so adding them would push solveRate over 100%.
  solved?: number
  // Solves the site's server confirmed via /siteverify.
  verified?: number
  // siteverify rejections (e.g. invalid token).
  failed?: number
  // Solves that required a visitor interaction vs ones that passed silently —
  // the bot-vs-human signal.
  interactive?: number
  nonInteractive?: number
  // solved/issued and interactive/(interactive+nonInteractive), as percentages.
  solveRate?: number | null
  interactiveRate?: number | null
  // Per-hostname challenge counts. Server-side siteverify events carry no
  // hostname, so these cover browser-side events only.
  hostnames?: Record<string, number>
  byHour?: { t: string; issued: number; solved: number; failed: number }[]
}

export interface StackGroup {
  id: string
  name: string
  // Owning account (auth user id). Used to show an account chip in All-accounts mode.
  ownerId?: string
  env: 'production' | 'staging' | 'shared'
  level: Level
  services: Service[]
  counts: { ok: number; warn: number; crit: number }
  serviceCount: number
  instanceCount: number
  rollup: { ok: number; warn: number; crit: number }
  topIssue: { level: Level; text: string } | null
  // Group/stack tile hidden by the user (group items only, keyed by group id).
  hidden?: boolean
}

export interface Group {
  id: string
  user_id?: string
  name: string
  description?: string | null
  cf_zone?: string | null
  color?: string | null
  sort?: number
}

export interface GroupMember {
  id: string
  group_id: string
  service_id: string
  label?: string | null
}

// A resolved group rollup. Extends StackGroup so existing stack cards/sections
// render it unchanged, plus the group's own metadata.
export interface GroupView extends StackGroup {
  description?: string | null
  cf_zone?: string | null
}

export interface Incident {
  id: string
  level: Level
  title: string
  stack: string
  detail: string
  time: string
  ack: boolean
}

export interface Notification {
  id: string
  level: Level
  title: string
  source: string
  message: string
  time: string
  day: 'TODAY' | 'YESTERDAY'
  read: boolean
}

export interface ApiKey {
  id: string
  name: string
  masked: string
  scopes: string[]
  lastUsed: string
}

export interface Channel {
  id: string
  kind: 'email' | 'slack' | 'webhook'
  value: string
  enabled: boolean
}
