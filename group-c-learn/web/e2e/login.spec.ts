import { test, expect } from "@playwright/test";

test.describe("Login /login", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /connecter|connexion|continuer/i })).toBeVisible();
  });

  test("login démo avec identifiants Anna redirige vers /me/path", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("anna.lopez@hackathon.test");
    await page.getByPlaceholder(/mot de passe|password/i).fill("Hackathon2026!");
    await page.getByRole("button", { name: /se connecter|connexion/i }).click();
    await expect(page).toHaveURL(/\/me\/path/, { timeout: 8_000 });
  });

  test("identifiants incorrects affiche une erreur", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("mauvais@test.com");
    await page.getByPlaceholder(/mot de passe|password/i).fill("wrongpass");
    await page.getByRole("button", { name: /se connecter|connexion/i }).click();
    await expect(page.getByText(/introuvable|incorrect|erreur/i)).toBeVisible();
  });

  test("non authentifié sur /me redirige vers /login", async ({ page }) => {
    await page.goto("/me");
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });
  });
});
