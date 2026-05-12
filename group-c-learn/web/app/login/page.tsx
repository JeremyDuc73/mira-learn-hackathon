"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Démo hackathon : login Anna Lopez sans Supabase
    if (
      email === "anna.lopez@hackathon.test" &&
      password === "Hackathon2026!"
    ) {
      localStorage.setItem("demo_logged_in", "true");
      router.push("/me/path");
      return;
    }

    setError("Compte introuvable. Utilise les identifiants Anna Lopez ci-dessous.");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-8 text-center">
        <span className="font-serif text-3xl font-bold text-primary">Mira Learn</span>
        <p className="mt-2 text-sm text-muted-foreground">Connecte-toi pour accéder à ton parcours.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-8"
      >
        <h1 className="font-serif text-2xl font-bold text-foreground">Se connecter</h1>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="anna.lopez@hackathon.test"
            className="min-h-[44px] w-full rounded-lg border-2 border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="min-h-[44px] w-full rounded-lg border-2 border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full text-base">
          {loading ? "Connexion en cours…" : "Se connecter"}
        </Button>

        <div className="rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">Compte test Anna Lopez :</p>
          <p>Email : <code className="text-primary">anna.lopez@hackathon.test</code></p>
          <p>Mot de passe : <code className="text-primary">Hackathon2026!</code></p>
        </div>
      </form>
    </main>
  );
}
