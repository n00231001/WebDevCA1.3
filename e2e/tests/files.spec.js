import { expect, test } from "@playwright/test";

test("shows the example files", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Isle of Skye.jpg")).toBeVisible();
});

test("registers a new user", async ({ page }) => {
  const email = `testuser${Date.now()}@example.com`;

  await page.goto("/register");

  await page.getByLabel("First name").fill("Test");
  await page.getByLabel("Last name").fill("User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");

  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/");

  await page.reload();

  await expect(page).toHaveURL("/");
});

test("uploads a file", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText("Isle of Skye.jpg")).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles("../backend/tests/fixtures/example.jpg");

  await expect(page.getByText("example.jpg", { exact: true })).toBeVisible();

  await page.reload();

  await expect(page.getByText("example.jpg", { exact: true })).toBeVisible();
});

test("shows an error for incorrect login credentials", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel("Password").fill("wrongpassword");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Email or password is incorrect",
  );

  await expect(page).toHaveURL("/login");
});