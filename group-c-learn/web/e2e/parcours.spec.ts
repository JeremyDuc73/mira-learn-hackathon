import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("demo_logged_in", "true"));
});

test.describe("Parcours /me/path (authentifié)", () => {
  test("affiche la page parcours ou redirige vers generate", async ({ page }) => {
    await page.goto("/me/path");
    await expect(page).toHaveURL(/\/me\/path/, { timeout: 8_000 });
    // soit un parcours existe, soit on propose d'en générer un
    const hasPath = await page.getByText(/étape|step|skill/i).isVisible().catch(() => false);
    const hasGenerate = await page.getByText(/génère|générer|parcours/i).isVisible().catch(() => false);
    expect(hasPath || hasGenerate).toBeTruthy();
  });
});

test.describe("Génération /me/path/generate (authentifié)", () => {
  test("affiche le formulaire de génération", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByText(/génère ton parcours/i)).toBeVisible({ timeout: 8_000 });
  });

  test("affiche les skills cibles pré-sélectionnées", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByText(/pitch|funding/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test("affiche les options d'horizon (3 mois, 6 mois, 1 an)", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByText("3 mois")).toBeVisible();
    await expect(page.getByText("6 mois")).toBeVisible();
    await expect(page.getByText("1 an")).toBeVisible();
  });

  test("bouton Générer est actif quand une skill est sélectionnée", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByRole("button", { name: /générer/i })).not.toBeDisabled({ timeout: 8_000 });
  });
});
