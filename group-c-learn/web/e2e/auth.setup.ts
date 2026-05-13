import { test as setup } from "@playwright/test";

// Injecte la session démo Anna dans le localStorage avant les tests authentifiés
setup("demo login", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("demo_logged_in", "true"));
});
