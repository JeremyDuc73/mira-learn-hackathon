import { test, expect } from "@playwright/test";

// Injecte la session démo avant chaque test de ce fichier
test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("demo_logged_in", "true"));
});

test.describe("Profil /me (authentifié)", () => {
  test("affiche le profil d'Anna", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByText(/anna/i)).toBeVisible({ timeout: 10_000 });
  });

  test("affiche la section Mon parcours", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByText(/parcours/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("affiche la navbar avec Déconnexion", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByRole("button", { name: /déconnexion/i })).toBeVisible();
  });

  test("déconnexion redirige vers /login", async ({ page }) => {
    await page.goto("/me");
    await page.getByRole("button", { name: /déconnexion/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
