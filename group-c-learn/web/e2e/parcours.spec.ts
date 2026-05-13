import { test, expect } from "@playwright/test";
import { isBackendUp } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("demo_logged_in", "true"));
});

test.describe("Parcours /me/path (authentifié)", () => {
  test("affiche la page parcours", async ({ page }) => {
    await page.goto("/me/path");
    await expect(page).toHaveURL(/\/me\/path/, { timeout: 8_000 });
  });
});

test.describe("Génération /me/path/generate (authentifié)", () => {
  test("affiche le formulaire de génération", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByText(/génère ton parcours/i)).toBeVisible({ timeout: 8_000 });
  });

  test("affiche la section skills cibles", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByText(/Tes skills cibles/i)).toBeVisible({ timeout: 5_000 });
  });

  test("affiche les options d'horizon (3 mois, 6 mois, 1 an)", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByText("3 mois")).toBeVisible();
    await expect(page.getByText("6 mois")).toBeVisible();
    await expect(page.getByText("1 an")).toBeVisible();
  });

  test("affiche le bouton Générer mon parcours", async ({ page }) => {
    await page.goto("/me/path/generate");
    await expect(page.getByRole("button", { name: /générer/i })).toBeVisible({ timeout: 5_000 });
  });

  test("bouton Générer actif quand skills chargées depuis backend", async ({ page }) => {
    test.skip(!(await isBackendUp()), "Backend non disponible");
    await page.goto("/me/path/generate");
    await expect(page.getByRole("button", { name: /générer/i })).not.toBeDisabled({ timeout: 10_000 });
  });
});
