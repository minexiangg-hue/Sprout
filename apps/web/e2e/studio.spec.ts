import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
const screenshots = path.resolve(process.cwd(), "../../docs/screenshots");
async function create(page: Page, template: string) {
  await page.goto("/");
  await page.getByLabel("选择作品类型").selectOption(template);
  await page
    .getByLabel("描述你的创作想法")
    .fill("我想做一个好玩的小作品，并理解每个模块。");
  await page.getByRole("button", { name: "让想法发芽" }).click();
  await expect(page.getByText("你的创作地图", { exact: true })).toBeVisible();
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /搭建下一块 ·/ }).click();
    await expect(
      page.getByText(`${i + 1} / 4 已搭建`, { exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "作品预览", exact: true }).click();
  return page.frameLocator('iframe[title="作品试玩"]');
}
test("home is branded, responsive and supports settings and learning", async ({
  page,
}) => {
  await fs.mkdir(screenshots, { recursive: true });
  await page.setViewportSize({ width: 1512, height: 1050 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /嗨，今天想创造点什么/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "让想法发芽" })).toBeDisabled();
  await page.screenshot({ path: path.join(screenshots, "studio-home.png") });
  await page.getByRole("button", { name: "创作设置", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "创作设置" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /示例配方 · 无需连接/ }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "关闭设置" }).click();
  await page.getByRole("button", { name: "灵感小课堂", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "大想法，从小积木开始。" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭小课堂" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: /嗨，今天想创造点什么/ }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({ path: path.join(screenshots, "studio-mobile.png") });
});
test("star game builds through UI, plays to win, edits, exports and survives reload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 1050 });
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  const frame = await create(page, "star-catcher");
  await page.getByLabel("接星目标").selectOption("5");
  await expect(frame.locator("#target")).toHaveText("5");
  await expect.poll(() => frame.locator("body").evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(font => font.family === "SproutPreview" && font.status === "loaded") && document.fonts.check("16px SproutPreview"); })).toBe(true);
  await frame.getByRole("button", { name: "开始接星星" }).click();
  await page.clock.runFor(9000);
  await expect(frame.locator("#score")).toHaveText("5");
  await expect(frame.locator("#status")).toContainText("太棒了");
  await page.screenshot({ path: path.join(screenshots, "studio-project.png") });
  const frameElement = page.locator('iframe[title="作品试玩"]');
  await expect(frameElement).toHaveAttribute("sandbox", "allow-scripts");
  const sandboxed = await frame.locator("body").evaluate(() => {
    try {
      void parent.document;
      return false;
    } catch {
      return true;
    }
  });
  expect(sandboxed).toBe(true);
  await page.getByRole("button", { name: "重新运行预览" }).click();
  await expect(frame.locator("#score")).toHaveText("0");
  await page.getByLabel("主题色").fill("#123456");
  await expect
    .poll(() =>
      frame
        .locator("html")
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--accent")),
    )
    .toBe("#123456");
  await page
    .locator(".module-card")
    .filter({
      has: page.getByRole("heading", { name: "涂上我的颜色", exact: true }),
    })
    .click();
  await expect(page.locator(".source-view pre")).toContainText("background");
  await page.getByRole("button", { name: "作品预览", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出作品", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.html$/);
  expect(await fs.readFile((await download.path())!, "utf8")).toContain(
    "Content-Security-Policy",
  );
  const url = page.url();
  await page.reload();
  await expect(page.getByText("4 / 4 已搭建", { exact: true })).toBeVisible();
  expect(page.url()).toBe(url);
  await expect(page.getByLabel("接星目标")).toHaveValue("5");
  await page.getByLabel("我已经试玩，并能说出一个模块的作用").check();
  await expect(page.getByLabel("我的发现")).toBeVisible();
});
test("pet responds to care, bounded state, celebration and reset", async ({
  page,
}) => {
  const frame = await create(page, "pet-care");
  await expect(frame.locator("#food-value")).toHaveText("70");
  await frame.getByRole("button", { name: "喂食" }).click();
  await expect(frame.locator("#food-value")).toHaveText("95");
  await frame.getByRole("button", { name: "玩耍" }).click();
  await expect(frame.locator("#joy-value")).toHaveText("100");
  await frame.getByRole("button", { name: "休息" }).click();
  await frame.getByRole("button", { name: "喂食" }).click();
  await frame.getByRole("button", { name: "休息" }).click();
  await expect(frame.locator("#pet")).toHaveAttribute("data-state", "bloom");
  await expect(frame.locator("#energy-value")).toHaveText("100");
  await frame.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect(frame.locator("#food-value")).toHaveText("70");
  await page.getByLabel("宠物昵称").fill("小豆");
  await page.getByLabel("宠物昵称").blur();
  await expect(frame.locator("#pet-name")).toHaveText("小豆");
});
test("timer starts, pauses without losing time, resets and completes", async ({
  page,
}) => {
  await page.clock.install();
  const frame = await create(page, "focus-timer");
  await page.getByLabel("专注时长").selectOption("1");
  await expect(frame.locator("#clock")).toHaveText("01:00");
  await frame.getByRole("button", { name: "开始专注" }).click();
  await page.clock.fastForward(5000);
  await expect(frame.locator("#clock")).toHaveText("00:55");
  await frame.getByRole("button", { name: "暂停一下" }).click();
  const paused = await frame.locator("#clock").textContent();
  await page.clock.fastForward(10000);
  await expect(frame.locator("#clock")).toHaveText(paused!);
  await frame.getByRole("button", { name: "继续专注" }).click();
  await page.clock.fastForward(60000);
  await expect(frame.locator("#clock")).toHaveText("00:00");
  await expect(frame.locator("#status")).toContainText("小树长大了");
  await frame.getByRole("button", { name: "重新种下" }).click();
  await expect(frame.locator("#clock")).toHaveText("01:00");
});
test("generation error is visible and retry recovers without silently switching mode", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("描述你的创作想法").fill("我想做一个绿色小工具");
  await page.route(
    "**/api/studio/plan",
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "测试：连接暂时中断，请重试" }),
      }),
    { times: 1 },
  );
  await page.getByRole("button", { name: "让想法发芽" }).click();
  await expect(page.getByRole("alert")).toContainText("连接暂时中断");
  await expect(page.getByLabel("描述你的创作想法")).toHaveValue(
    "我想做一个绿色小工具",
  );
  await page.route('**/api/studio/plan', route => route.fulfill({status:502, contentType:'text/plain', body:'upstream restarting'}), {times:1});
  await page.getByRole("button", { name: "让想法发芽" }).click();
  await expect(page.getByRole('alert')).toContainText('没有收到完整回复');
  await expect(page.getByLabel('描述你的创作想法')).toHaveValue('我想做一个绿色小工具');
  await page.getByRole("button", { name: "让想法发芽" }).click();
  await expect(page.getByText("你的创作地图", { exact: true })).toBeVisible();
});
