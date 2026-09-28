import { chromium } from "playwright";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "tr", "de", "pl"];
const pageUrl = pathToFileURL(join(root, "tools", "architecture.html")).href;
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const browser = await chromium.launch(launchOptions);

try {
  const page = await browser.newPage({ viewport: { width: 1160, height: 1000 }, deviceScaleFactor: 2 });

  for (const lang of languages) {
    await page.goto(`${pageUrl}?lang=${lang}`, { waitUntil: "load" });
    await page.waitForSelector("body[data-ready]");

    const canvas = page.locator("#canvas");
    const file = join(root, "assets", "img", `architecture-${lang}.png`);
    await canvas.screenshot({ path: file });

    const size = await canvas.boundingBox();
    console.log(`${lang.toUpperCase()}  ${Math.round(size.width)}x${Math.round(size.height)}  ${file}`);
  }
} finally {
  await browser.close();
}
