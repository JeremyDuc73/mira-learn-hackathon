"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

/**
 * Layout du groupe de routes `(authenticated)`.
 * Force l'authentification — redirige vers /login si pas de session.
 *
 * MIGRATION HINT (post-hackathon) :
 *   En prod Hello Mira, l'auth check passe par un middleware Next.js qui inspecte
 *   le cookie cross-subdomain `hlmr_jwt` sur `.hello-mira.com`. Voir pattern
 *   `account-web/middleware.ts`. Pas besoin de check client-side.
 */
export default function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  function handleSignOut() {
    localStorage.removeItem("demo_logged_in");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!user) {
    return null; // redirection en cours
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-xl font-bold text-primary">
            Mira Learn
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/classes" className="text-sm text-foreground hover:text-primary">
              Catalogue
            </Link>
            <Link href="/me" className="text-sm text-foreground hover:text-primary">
              Mon profil
            </Link>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="secondary" onClick={handleSignOut}>
              Déconnexion
            </Button>
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </>
  );
}
