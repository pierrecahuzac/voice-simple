import { test, expect } from "@playwright/test";

test("home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Voice Simple")).toBeVisible();
});

test("join room shows participant", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Pseudo").fill("alice");
  await page.getByRole("button", { name: "Rejoindre" }).click();
  await expect(page.getByText("Salon: general")).toBeVisible();
  await expect(page.getByText(/alice \(vous\)/)).toBeVisible();
});
