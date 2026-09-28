import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "tr", "de", "pl"];
const pageUrl = pathToFileURL(join(root, "cv.html")).href;
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const countPages = (pdf) => (pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-z])/g) || []).length;

await mkdir(join(root, "cv"), { recursive: true });
const browser = await chromium.launch(launchOptions);

try {
  const page = await browser.newPage();
  let problems = 0;

  for (const lang of languages) {
    await page.goto(`${pageUrl}?lang=${lang}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    const file = join(root, "cv", `Eren_Coskun_CV_${lang.toUpperCase()}.pdf`);
    const pdf = await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
    const pages = countPages(pdf);

    if (pages !== 1) problems += 1;
    console.log(`${lang.toUpperCase()}  ${pages} page(s)  ${file}`);
  }

  if (problems > 0) {
    console.error(`${problems} CV(s) do not fit on one page. Shorten the text in assets/js/i18n.js and run again.`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
