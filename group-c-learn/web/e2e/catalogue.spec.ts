import { test, expect } from "@playwright/test";

test.describe("Catalogue /classes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/classes");
  });

  test("affiche le titre du catalogue", async ({ page }) => {
    await expect(page.getByText(/Mira Classes/i)).toBeVisible();
  });

  test("charge et affiche des cards de classes", async ({ page }) => {
    // attend que le chargement soit terminé (spinner disparaît)
    await expect(page.getByText("Chargement des classes...")).not.toBeVisible({ timeout: 10_000 });
    const cards = page.locator("a[href^='/classes/']");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("filtre par format Virtuel réduit les résultats", async ({ page }) => {
    await expect(page.getByText("Chargement des classes...")).not.toBeVisible({ timeout: 10_000 });
    const totalBefore = await page.locator("a[href^='/classes/']").count();

    await page.getByRole("button", { name: "Virtuel" }).first().click();

    const totalAfter = await page.locator("a[href^='/classes/']").count();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test("reset réinitialise les filtres", async ({ page }) => {
    await expect(page.getByText("Chargement des classes...")).not.toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Virtuel" }).first().click();
    await page.getByRole("button", { name: /réinitialiser/i }).first().click();
    const cards = page.locator("a[href^='/classes/']");
    expect(await cards.count()).toBeGreaterThan(0);
  });
});
