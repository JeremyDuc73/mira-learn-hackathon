import { test, expect } from "@playwright/test";
import { isBackendUp } from "./helpers";

test.describe("Détail classe /classes/[slug]", () => {
  test("ouvre le détail depuis le catalogue", async ({ page }) => {
    test.skip(!(await isBackendUp()), "Backend non disponible");
    await page.goto("/classes");
    await expect(page.getByText("Chargement des classes...")).not.toBeVisible({ timeout: 10_000 });

    const firstCard = page.locator("a[href^='/classes/']").first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();

    await expect(page).toHaveURL(new RegExp(href!.replace("/", "\\/")));
    await expect(page.getByText(/heures|sessions|mentor/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("affiche le bouton Candidater", async ({ page }) => {
    test.skip(!(await isBackendUp()), "Backend non disponible");
    await page.goto("/classes");
    await expect(page.getByText("Chargement des classes...")).not.toBeVisible({ timeout: 10_000 });
    await page.locator("a[href^='/classes/']").first().click();
    await expect(page.getByRole("link", { name: /candidater|postuler|s'inscrire/i })).toBeVisible({ timeout: 10_000 });
  });
});
