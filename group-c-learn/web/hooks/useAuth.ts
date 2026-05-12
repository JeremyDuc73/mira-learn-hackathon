"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export const DEMO_USER = {
  id: "b4278adc-15cc-4585-a6fa-4ddb262c24e8",
  email: "anna.lopez@hackathon.test",
} as unknown as User;

export function useAuth(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem("demo_logged_in");
    setUser(logged === "true" ? DEMO_USER : null);
    setLoading(false);
  }, []);

  return { user, loading };
}
