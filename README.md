# erencoskun11.github.io

Personal website of Eren Coşkun in four languages (English, Türkçe, Deutsch, Polski).
Plain HTML, CSS and JavaScript: no framework, no build step, no tracking.

## What's inside

```
index.html              the website
cv.html                 printable CV, the source of the PDFs in cv/
assets/css/fonts.css    self-hosted fonts
assets/css/style.css    website styles (light and dark theme)
assets/css/cv.css       CV styles (A4)
assets/js/i18n.js       every text, in en / tr / de / pl
assets/js/main.js       language switch, copy e-mail button, diagram viewer
assets/fonts/           Archivo + JetBrains Mono (SIL Open Font License)
assets/img/             architecture diagram, favicon, social preview card
cv/                     CV PDFs in four languages
tests/site.test.mjs     checks translations, links and files
tools/build-cv.mjs      regenerates the CV PDFs from cv.html
tools/architecture.html architecture diagram source, in four languages
tools/build-diagram.mjs renders the diagram to assets/img/architecture-xx.png
```

## Look at it on your computer

Double-click `index.html`. Everything works offline.
Switch languages with the TR / EN / DE / PL buttons, or open `index.html?lang=de`.
The first visit picks the visitor's browser language; English is the default.

## Publish on GitHub Pages (free)

1. On GitHub, create a new **public** repository named exactly `erencoskun11.github.io`. Do not add a README.
2. Open PowerShell in this folder and run (Windows):

```
git init
git add .
git commit -m "Portfolio website"
git branch -M main
git remote add origin https://github.com/erencoskun11/erencoskun11.github.io.git
git push -u origin main
```

3. Repository → **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save.
4. After a minute or two the site is live at https://erencoskun11.github.io/

Every later change: edit, then `git add .`, `git commit -m "..."`, `git push`.

## Custom domain (optional)

1. Buy a domain (for example `erencoskun.dev`).
2. Settings → Pages → Custom domain → enter it → Save. GitHub adds a `CNAME` file to the repository; run `git pull` afterwards.
3. At the domain registrar add four `A` records for the bare domain: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` record `www` → `erencoskun11.github.io`.
4. When GitHub shows the certificate is ready, tick **Enforce HTTPS**.
5. In `index.html`, replace `https://erencoskun11.github.io/` in the `og:url` and `og:image` tags with the new address.

## Change a text

All texts are in `assets/js/i18n.js`, one block per language. Change the same key in all four blocks.
The English text inside `index.html` and `cv.html` is only shown when JavaScript is off; keep it equal to the `en` block.

Then run the checks (Node.js 18 or newer, nothing to install):

```
npm test
```

They fail if a language is missing a key, a text is empty, a page uses an unknown key, a linked file is missing, or a source file contains comments.

## Update the CV PDFs

The PDFs in `cv/` are printed from `cv.html` with the same texts as the website.

```
npm install
npx playwright install chromium
npm run cv
```

The script prints the page count of each PDF and fails if a CV no longer fits on one A4 page.
Without Node: open `cv.html?lang=de` in Chrome → Ctrl+P → Save as PDF, Paper A4, Margins None, Background graphics on.

## Update the architecture diagram

The diagram on the site is drawn from `tools/architecture.html`: one picture per language, shown by the selected language.
Change the texts in the `TEXT` block of that file (the sector names come from `assets/js/i18n.js`), then:

```
npm run diagram
```

It writes `assets/img/architecture-en.png`, `-tr`, `-de` and `-pl`. You can also open `tools/architecture.html?lang=de` in Chrome to preview it.

## Add a language

1. Copy the `en` block in `assets/js/i18n.js`, give it the new code (for example `fr`) and translate every value.
2. Add the code to `SUPPORTED` and a file name to `CV_FILES` in `assets/js/main.js`.
3. Add a button to the language group in `index.html` and `cv.html`:
   `<button type="button" data-lang="fr" lang="fr" title="Français" aria-pressed="false">FR</button>`
4. Add the code to `LANGUAGES` in `tests/site.test.mjs`, to `languages` in `tools/build-cv.mjs` and `tools/build-diagram.mjs`, and a block to `TEXT` in `tools/architecture.html`.
5. Run `npm run cv`, `npm run diagram` and `npm test`.

## Keep up to date

- Test count: `hero.lead`, `stat.tests.value` and `kf.b6` say 1,600+. Change them in all four languages when the number grows.
- ERN packages: when they are public on GitHub or NuGet, link each package name in the packages section of `index.html`.
- A phone number: add a row to the contact list in `index.html` and the header in `cv.html`.
- After publishing, you can add the website address to the CV header in `cv.html` and rebuild the PDFs.

## Privacy

No cookies, no analytics, no requests to other servers: fonts, images and scripts are all served from this site. This matters for visitors from Germany, where loading Google Fonts from Google's servers has led to court rulings and warning letters.
The only thing the site stores in the browser is the chosen language (localStorage key `lang`).

## Licences

Archivo and JetBrains Mono are licensed under the SIL Open Font License 1.1; the licence texts are in `assets/fonts/`.
