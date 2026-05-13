import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("demo_logged_in", "true"));
});

test.describe("Profil /me (authentifié)", () => {
  test("affiche le profil d'Anna", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByText(/anna/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("affiche la navbar avec Déconnexion", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByRole("button", { name: /déconnexion/i })).toBeVisible();
  });

  test("affiche les liens de navigation", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByRole("link", { name: /catalogue/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /profil|mon profil/i })).toBeVisible();
  });

  test("déconnexion redirige vers /login", async ({ page }) => {
    await page.goto("/me");
    await page.getByRole("button", { name: /déconnexion/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });

  // Nécessite backend : les données de parcours viennent de fetchMyProfile()
  test("affiche les données du profil chargées depuis backend", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByText(/chargement/i)).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/anna lopez/i)).toBeVisible({ timeout: 10_000 });
  });
});
