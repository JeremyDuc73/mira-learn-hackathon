import { test, expect } from "@playwright/test";

test.describe("Landing /", () => {
  test("affiche le titre Mira Learn", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mira Learn")).toBeVisible();
  });

  test("lien Catalogue pointe vers /classes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /catalogue/i }).first().click();
    await expect(page).toHaveURL(/\/classes/);
  });
});
