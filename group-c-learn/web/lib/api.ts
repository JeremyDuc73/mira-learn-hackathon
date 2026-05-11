const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + "/v1";

// ─── Raw backend types ────────────────────────────────────────────────────────

export interface ApiSkill {
  id: string;
  slug: string;
  name: string;
  category: string;
}

export interface ApiClassItem {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  skills_taught: string[];
  total_hours: number;
  format_envisaged: "physical" | "virtual" | "both";
  recommended_price_per_hour_collective_cents: number;
  mentor_display_name: string;
  mentor_avatar_url: string | null;
}

export interface ApiModule {
  id: string;
  position: number;
  title: string;
  summary: string;
}

export interface ApiSession {
  id: string;
  title: string;
  starts_at: string | null;
  spots_available: number;
  format_envisaged: "physical" | "virtual" | "both";
}

export interface ApiMentor {
  id: string;
  slug: string;
  display_name: string;
  headline: string;
  avatar_url: string | null;
  aggregate_rating: number | null;
  rating_count: number;
  classes_given_count: number;
}

export interface ApiClassDetail extends Omit<ApiClassItem, "mentor_display_name" | "mentor_avatar_url"> {
  total_hours_collective: number;
  total_hours_individual: number;
  recommended_price_per_hour_individual_cents: number;
  rythm_pattern: string | null;
  modules: ApiModule[];
  sessions: ApiSession[];
  mentor: ApiMentor;
}

export interface ApiLearner {
  profile_id: string;
  display_name: string;
  headline: string;
  avatar_url: string | null;
  current_country: string | null;
  preferred_destinations: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatLabel(f: "physical" | "virtual" | "both"): string {
  if (f === "physical") return "Physique";
  if (f === "virtual") return "Virtuel";
  return "Hybride";
}

export function computePrice(centsPerHour: number, hours: number): number {
  return Math.round((centsPerHour / 100) * hours);
}

export function buildSkillMap(skills: ApiSkill[]): Map<string, string> {
  return new Map(skills.map((s) => [s.id, s.name]));
}

export function resolveSkills(ids: string[], map: Map<string, string>): string[] {
  return ids.map((id) => map.get(id) ?? id);
}

export function formatSessionDate(iso: string | null): string {
  if (!iso) return "À venir";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 30 }, ...opts });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return json.data as T;
}

export async function fetchClasses(params?: {
  format?: string;
  limit?: number;
}): Promise<{ items: ApiClassItem[]; pagination: { total: number } }> {
  const q = new URLSearchParams({ limit: String(params?.limit ?? 50) });
  if (params?.format) q.set("format_envisaged", params.format);
  return apiFetch(`/classes?${q}`);
}

export async function fetchClassBySlug(slug: string): Promise<ApiClassDetail> {
  return apiFetch(`/classes/slug/${slug}`);
}

export async function fetchSkills(): Promise<{ items: ApiSkill[] }> {
  return apiFetch("/skills?limit=200");
}

export async function fetchCommunityLearners(): Promise<{ items: ApiLearner[] }> {
  return apiFetch("/community/learners?limit=50");
}
