import { test, expect } from "@playwright/test";

test.describe("Login /login", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("login démo avec identifiants Anna redirige vers /me/path", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("anna.lopez@hackathon.test").fill("anna.lopez@hackathon.test");
    await page.locator('input[type="password"]').fill("Hackathon2026!");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/\/me\/path/, { timeout: 8_000 });
  });

  test("identifiants incorrects affiche une erreur", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("anna.lopez@hackathon.test").fill("mauvais@test.com");
    await page.locator('input[type="password"]').fill("wrongpass");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByText(/introuvable/i)).toBeVisible({ timeout: 5_000 });
  });

  test("non authentifié sur /me redirige vers /login", async ({ page }) => {
    await page.goto("/me");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
