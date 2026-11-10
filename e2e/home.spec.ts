import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renderiza o botão shadcn e não tem violações de acessibilidade", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "ExoOps Mission Control" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Abrir painel" }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
