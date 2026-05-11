export type ExampleStatus = "draft" | "active" | "archived";

export interface Example {
  id: string;
  title: string;
  description: string;
  status: ExampleStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedList<T> {
  items: T[];
  pagination: { limit: number; offset: number; total: number; returned: number };
}

export interface MiraMentor {
  id: string;
  name: string;
  headline: string;
  rating: number;
  reviews: number;
  classCount: number;
}

export interface MiraModule {
  n: number;
  title: string;
  desc: string;
  dur: string;
}

export interface MiraSession {
  id: string;
  mode: "physical" | "virtual";
  location: string;
  dates: string;
  seats: number;
  enrolled: number;
}

export interface MiraClass {
  slug: string;
  photo?: string;
  title: string;
  subtitle: string;
  description: string;
  mentorId: string;
  format: string;
  category: string;
  durationWeeks: number;
  priceEur: number;
  skills: string[];
  primarySkill: string;
  cohortSize: number;
  rating: number;
  reviews: number;
  modules: MiraModule[];
  sessions: MiraSession[];
}

export interface CommunityMember {
  id: string;
  name: string;
  city: string;
  flag: string;
  since: string;
  target: string[];
  validated: string[];
  completed: boolean;
  lat: number;
  lng: number;
}

export interface StudentProfile {
  display_name: string;
  headline: string;
  bio: string;
  current_country: string;
  city: string;
  flag: string;
  visibility: "public" | "private";
  learning_horizon: "3_months" | "6_months" | "1_year" | null;
}

export interface PathStep {
  idx: number;
  status: "locked" | "in_progress" | "completed";
  skill: string;
  classSlug: string;
  rationale: string;
  applied: boolean;
}
