import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");

const sandbox = { window: {} };
vm.runInNewContext(read("assets/js/i18n.js"), sandbox);
const I18N = sandbox.window.I18N;

const LANGUAGES = ["en", "tr", "de", "pl"];
const PAGES = ["index.html", "cv.html"];
const SOURCES = ["index.html", "cv.html", "assets/css/style.css", "assets/css/cv.css", "assets/css/fonts.css", "assets/js/main.js", "assets/js/i18n.js", "tools/architecture.html", "tools/build-cv.mjs", "tools/build-diagram.mjs"];

const keysUsedByPages = () => {
  const keys = new Set();
  for (const page of PAGES) {
    const html = read(page);
    for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) keys.add(match[1]);
    for (const match of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
      for (const pair of match[1].split(";")) keys.add(pair.split(":")[1].trim());
    }
  }
  return keys;
};

const keysUsedByScript = () => new Set([...read("assets/js/main.js").matchAll(/text\("([^"]+)"\)/g)].map((match) => match[1]));

const allUsedKeys = () => new Set([...keysUsedByPages(), ...keysUsedByScript()]);

test("Every language defines exactly the same keys as English", () => {
  const english = Object.keys(I18N.en).sort();
  for (const lang of LANGUAGES) {
    assert.deepEqual(Object.keys(I18N[lang]).sort(), english, `${lang} does not match en`);
  }
});

test("No translation is empty", () => {
  for (const lang of LANGUAGES) {
    for (const [key, value] of Object.entries(I18N[lang])) {
      assert.ok(typeof value === "string" && value.trim().length > 0, `${lang} ${key} is empty`);
    }
  }
});

test("Every key used by the pages and the script exists in the dictionary", () => {
  const missing = [...allUsedKeys()].filter((key) => !(key in I18N.en));
  assert.deepEqual(missing, []);
});

test("Every key in the dictionary is used somewhere", () => {
  const used = allUsedKeys();
  const unused = Object.keys(I18N.en).filter((key) => !used.has(key));
  assert.deepEqual(unused, []);
});

test("The language buttons on every page match the supported languages", () => {
  const supported = read("assets/js/main.js").match(/const SUPPORTED = \[([^\]]+)\]/)[1].match(/[a-z]+/g).sort();
  assert.deepEqual(supported, [...LANGUAGES].sort());
  for (const page of PAGES) {
    const buttons = [...read(page).matchAll(/data-lang="([a-z]+)"/g)].map((match) => match[1]).sort();
    assert.deepEqual(buttons, [...LANGUAGES].sort(), page);
  }
});

test("Every language has a CV file", () => {
  for (const lang of LANGUAGES) {
    const file = join(root, "cv", `Eren_Coskun_CV_${lang.toUpperCase()}.pdf`);
    assert.ok(existsSync(file), `missing CV for ${lang}`);
  }
});

test("Every local file referenced by the pages exists", () => {
  for (const page of PAGES) {
    for (const match of read(page).matchAll(/(?<![\w-])(?:src|href)="((?:assets|cv)\/[^"#?]+)"/g)) {
      assert.ok(existsSync(join(root, match[1])), `${page} links to missing ${match[1]}`);
    }
  }
});

test("Every language has its own version of each translated image", () => {
  for (const page of PAGES) {
    for (const match of read(page).matchAll(/data-lang-src="([^"]+)"/g)) {
      for (const lang of LANGUAGES) {
        const file = match[1].replace("{lang}", lang);
        assert.ok(existsSync(join(root, file)), `${page} needs ${file}`);
      }
    }
  }
});

test("Every font file referenced by the stylesheet exists", () => {
  for (const match of read("assets/css/fonts.css").matchAll(/url\("\.\.\/fonts\/([^"]+)"\)/g)) {
    assert.ok(existsSync(join(root, "assets", "fonts", match[1])), match[1]);
  }
});

test("Source files contain no comments", () => {
  for (const file of SOURCES) {
    const source = read(file);
    assert.ok(!source.includes("<!--"), `${file} has an HTML comment`);
    assert.ok(!source.includes("/*"), `${file} has a block comment`);
    assert.ok(!/(^|[\s;{}])\/\/(?!\/)/m.test(source.replace(/[a-z]+:\/\//gi, "")), `${file} has a line comment`);
  }
});
