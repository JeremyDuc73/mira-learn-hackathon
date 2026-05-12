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

// ─── Types authentifiés ───────────────────────────────────────────────────────

export interface ApiProfile {
  id: string;
  display_name: string;
  headline: string;
  bio: string;
  avatar_url: string | null;
  current_country: string | null;
  community_visibility: "public" | "private";
  preferred_destinations: string[];
  target_skills: string[];
  learning_horizon: string | null;
}

export interface ApiStep {
  id: string;
  position: number;
  skill_id: string;
  recommended_class_ids: string[];
  justification: string;
  estimated_duration_hours: number;
  status: "pending" | "in_progress" | "validated" | "skipped";
}

export interface ApiLearningPath {
  id: string;
  name: string;
  target_skills: string[];
  target_horizon: string;
  total_steps: number;
  estimated_duration_hours: number;
  completion_pct: number;
  status: "active" | "completed" | "abandoned";
  steps?: ApiStep[];
}

export interface ApiEnrolmentIntent {
  id: string;
  class_id: string;
  session_id: string;
  status: string;
  submitted_at: string | null;
  application_data: Record<string, unknown>;
}

// ─── Fetchers authentifiés (demo-anna) ───────────────────────────────────────

const DEMO_TOKEN = "demo-anna";

async function apiAuthFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEMO_TOKEN}`,
      ...((opts?.headers as object) ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return json.data as T;
}

export async function fetchMyProfile(): Promise<ApiProfile> {
  return apiAuthFetch("/students/me");
}

export async function updateMyProfile(data: Partial<ApiProfile>): Promise<ApiProfile> {
  return apiAuthFetch("/students/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function fetchMyEnrolmentIntents(): Promise<{ items: ApiEnrolmentIntent[] }> {
  return apiAuthFetch("/students/me/enrolment-intents");
}

export async function fetchMyActivePath(): Promise<ApiLearningPath | null> {
  const data = await apiAuthFetch<{ items: ApiLearningPath[] }>("/students/me/learning-paths");
  const active = data.items.find((p) => p.status === "active") ?? null;
  if (!active) return null;
  const detail = await apiAuthFetch<ApiLearningPath>(`/students/me/learning-paths/${active.id}`);
  return detail;
}

export async function fetchClassById(id: string): Promise<ApiClassDetail> {
  return apiFetch(`/classes/${id}`);
}
