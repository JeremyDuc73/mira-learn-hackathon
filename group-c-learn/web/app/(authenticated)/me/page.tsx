"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { SkillChip } from "@/components/SkillChip";
import {
  fetchMyProfile,
  fetchMyEnrolmentIntents,
  fetchSkills,
  updateMyProfile,
  type ApiProfile,
  type ApiEnrolmentIntent,
  type ApiSkill,
} from "@/lib/api";

const COUNTRIES = [
  "Portugal", "France", "Espagne", "Allemagne", "Royaume-Uni", "Brésil",
  "États-Unis", "Mexique", "Thaïlande", "Japon", "Australie", "Autre",
];

export default function MePage() {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [intents, setIntents] = useState<ApiEnrolmentIntent[]>([]);
  const [loading, setLoading] = useState(true);

  const [editDraft, setEditDraft] = useState<Partial<ApiProfile>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([fetchMyProfile(), fetchMyEnrolmentIntents(), fetchSkills()])
      .then(([prof, intentData, skillData]) => {
        setProfile(prof);
        setEditDraft(prof);
        setIntents(intentData.items);
        setSkills(skillData.items);
        // build class name map from intents (we'll fetch class titles separately if needed)
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateMyProfile(editDraft);
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex gap-12">
        <nav className="hidden w-44 flex-shrink-0 md:block" />
        <div className="flex-1 py-20 text-center text-muted-foreground text-sm">Chargement…</div>
      </div>
    );
  }

  const allSkillNames = skills.map((s) => s.name);
  const targetSkillNames: string[] = (profile.target_skills ?? [])
    .map((id) => skills.find((s) => s.id === id)?.name ?? id);
  const remaining = allSkillNames.filter((n) => !targetSkillNames.includes(n));

  async function addSkill(name: string) {
    if (!name || !profile) return;
    const skill = skills.find((s) => s.name === name);
    if (!skill) return;
    const newIds = [...(profile.target_skills ?? []), skill.id];
    const updated = await updateMyProfile({ target_skills: newIds });
    setProfile(updated);
    setAdding(false);
  }

  async function removeSkill(name: string) {
    if (!profile) return;
    const skill = skills.find((s) => s.name === name);
    if (!skill) return;
    const newIds = (profile.target_skills ?? []).filter((id) => id !== skill.id);
    const updated = await updateMyProfile({ target_skills: newIds });
    setProfile(updated);
  }

  async function setVisibility(v: "public" | "private") {
    if (!profile) return;
    const updated = await updateMyProfile({ community_visibility: v });
    setProfile(updated);
  }

  return (
    <div className="flex gap-12">
      {/* Sidebar */}
      <nav className="hidden w-44 flex-shrink-0 md:block">
        <ul className="space-y-1 text-sm">
          {[
            { href: "/me", label: "Mon profil" },
            { href: "/me/path", label: "Mon parcours" },
            { href: "/me/path/generate", label: "Générer" },
          ].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block rounded-lg px-3 py-2 font-medium text-foreground hover:bg-beige-deep">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-10 min-w-0">
        {/* Header profil */}
        {editing ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Modifier le profil</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nom affiché</label>
                <input
                  type="text"
                  value={editDraft.display_name ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, display_name: e.target.value }))}
                  className="min-h-[44px] w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-2 focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Titre (headline)</label>
                <input
                  type="text"
                  value={editDraft.headline ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, headline: e.target.value }))}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
                <textarea
                  value={editDraft.bio ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, bio: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-2 focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Pays actuel</label>
                <select
                  value={editDraft.current_country ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, current_country: e.target.value }))}
                  className="min-h-[44px] w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-2 focus:border-primary"
                >
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={saveProfile} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button variant="ghost" onClick={() => { setEditDraft(profile); setEditing(false); }}>Annuler</Button>
            </div>
          </section>
        ) : (
          <header className="flex items-start gap-6">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="h-24 w-24 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-beige-deep font-bold text-xl text-foreground">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl font-bold text-foreground">{profile.display_name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{profile.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">{profile.current_country}</p>
              {profile.bio && (
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground">{profile.bio}</p>
              )}
            </div>
            <Button variant="secondary" onClick={() => { setEditDraft(profile); setEditing(true); }}>
              Modifier le profil
            </Button>
          </header>
        )}

        {/* Skills cibles */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mes skills cibles</h2>
          {targetSkillNames.length === 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-soft bg-card p-5">
              <p className="flex-1 text-sm text-foreground">Définis tes skills cibles pour qu'on te génère ton parcours.</p>
              <Link href="/me/path/generate"><Button variant="primary" className="text-sm">Définir mes skills →</Button></Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {targetSkillNames.map((s) => (
                <SkillChip key={s} label={s} removable onRemove={() => removeSkill(s)} />
              ))}
              {adding ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-muted-soft px-3 py-1">
                  <select onChange={(e) => addSkill(e.target.value)} defaultValue="" className="border-0 bg-transparent text-xs text-foreground outline-none">
                    <option value="" disabled>Choisir…</option>
                    {remaining.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-primary">×</button>
                </span>
              ) : (
                <button onClick={() => setAdding(true)} className="rounded-full border border-dashed border-muted-soft px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  + Ajouter
                </button>
              )}
            </div>
          )}
        </section>

        {/* Skills validées */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mes skills validées</h2>
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-soft bg-card p-5">
            <p className="text-sm text-foreground">Passe des QCM pour valider tes skills sur l'app mobile. Ca apparaît ici.</p>
          </div>
        </section>

        {/* Visibilité */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Visibilité</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex gap-4">
              {([
                { id: "public" as const, label: "Public", desc: "Apparais sur la carte de la communauté Mira." },
                { id: "private" as const, label: "Privé", desc: "Ton profil reste invisible aux autres apprenants." },
              ]).map((opt) => (
                <label key={opt.id} className={`flex flex-1 cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${profile.community_visibility === opt.id ? "border-foreground bg-background" : "border-border bg-card"}`}>
                  <input type="radio" name="visibility" checked={profile.community_visibility === opt.id} onChange={() => setVisibility(opt.id)} className="mt-1 accent-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Mon parcours */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mon parcours</h2>
          <div className="rounded-2xl bg-foreground p-8 text-primary-foreground">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-soft">Mira AI</p>
            <h3 className="font-serif text-2xl font-bold">Génère ton parcours <span className="italic text-primary">sur mesure.</span></h3>
            <p className="mt-3 max-w-md text-sm text-muted-soft">On t'aide à passer du point A au point B en 4 étapes max. ~15 secondes pour générer.</p>
            <Link href="/me/path/generate" className="mt-6 inline-block"><Button variant="primary">Générer</Button></Link>
          </div>
        </section>

        {/* Inscriptions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Mes candidatures</h2>
          {intents.length === 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-muted-soft bg-card p-5">
              <p className="text-sm text-foreground">Tu n'as pas encore postulé à une Mira Class.</p>
              <Link href="/classes"><Button variant="primary" className="text-sm">Voir le catalogue →</Button></Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {intents.map((e, i) => (
                <div key={e.id} className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Candidature soumise</p>
                    <p className="text-xs text-muted-foreground">
                      {e.submitted_at ? new Date(e.submitted_at).toLocaleDateString("fr-FR") : "En attente"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    e.status === "submitted" ? "bg-gold/20 text-gold" : "bg-sage-soft text-success"
                  }`}>
                    {e.status === "submitted" ? "En attente" : e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
