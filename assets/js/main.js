(() => {
  "use strict";

  const SUPPORTED = ["en", "tr", "de", "pl"];
  const FALLBACK = "en";
  const STORAGE_KEY = "lang";
  const CV_FILES = {
    en: "cv/Eren_Coskun_CV_EN.pdf",
    tr: "cv/Eren_Coskun_CV_TR.pdf",
    de: "cv/Eren_Coskun_CV_DE.pdf",
    pl: "cv/Eren_Coskun_CV_PL.pdf"
  };

  const dictionary = window.I18N || {};
  const status = document.getElementById("copy-status");
  let current = FALLBACK;
  let statusTimer = 0;

  const has = (table, key) => Boolean(table) && Object.prototype.hasOwnProperty.call(table, key);

  const normalize = (value) => {
    if (!value) return null;
    const base = String(value).toLowerCase().split("-")[0];
    return SUPPORTED.includes(base) ? base : null;
  };

  const readStored = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const writeStored = (lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      return;
    }
  };

  const fromQuery = () => {
    try {
      return new URLSearchParams(window.location.search).get("lang");
    } catch {
      return null;
    }
  };

  const fromBrowser = () => {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const tag of list) {
      const lang = normalize(tag);
      if (lang) return lang;
    }
    return null;
  };

  const initialLanguage = () => normalize(fromQuery()) || normalize(readStored()) || fromBrowser() || FALLBACK;

  const text = (key) => {
    if (has(dictionary[current], key)) return dictionary[current][key];
    if (has(dictionary[FALLBACK], key)) return dictionary[FALLBACK][key];
    return null;
  };

  const clearStatus = () => {
    if (status) status.textContent = "";
  };

  const showStatus = (message) => {
    if (!status || !message) return;
    status.textContent = message;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(clearStatus, 2600);
  };

  const applyText = () => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = text(element.dataset.i18n);
      if (value !== null) element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      element.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attribute, key] = pair.split(":").map((part) => part.trim());
        if (!attribute || !key) return;
        const value = text(key);
        if (value !== null) element.setAttribute(attribute, value);
      });
    });
  };

  const syncUrl = (lang) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url);
    } catch {
      return;
    }
  };

  const setLanguage = (lang, { remember = false, updateUrl = false } = {}) => {
    current = normalize(lang) || FALLBACK;
    document.documentElement.lang = current;
    applyText();

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === current));
    });

    document.querySelectorAll("[data-cv-link]").forEach((link) => {
      link.setAttribute("href", CV_FILES[current]);
      link.setAttribute("hreflang", current);
    });

    document.querySelectorAll("[data-lang-src]").forEach((image) => {
      const source = image.dataset.langSrc.replace("{lang}", current);
      if (image.getAttribute("src") !== source) image.setAttribute("src", source);
    });

    document.querySelectorAll("[data-lang-link]").forEach((link) => {
      link.setAttribute("href", `${link.dataset.langLink}?lang=${current}`);
    });

    clearStatus();
    if (remember) writeStored(current);
    if (updateUrl) syncUrl(current);
  };

  const selectText = (element) => {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const setupSwitcher = () => {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        setLanguage(button.dataset.lang, { remember: true, updateUrl: true });
      });
    });
  };

  const setupCopy = () => {
    const button = document.getElementById("copy-email");
    const address = document.getElementById("email-address");
    if (!button || !address) return;

    button.addEventListener("click", () => {
      const fail = () => {
        selectText(address);
        showStatus(text("contact.copyFail"));
      };

      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        fail();
        return;
      }

      navigator.clipboard.writeText(address.textContent.trim()).then(() => showStatus(text("contact.copied")), fail);
    });
  };

  const setupViewer = () => {
    const dialog = document.getElementById("arch-viewer");
    const opener = document.querySelector("[data-open-arch]");
    if (!dialog || !opener) return;

    const close = () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    };

    opener.addEventListener("click", () => {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });

    dialog.querySelectorAll("[data-close-arch]").forEach((button) => button.addEventListener("click", close));

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
  };

  setupSwitcher();
  setupCopy();
  setupViewer();
  setLanguage(initialLanguage());
})();
