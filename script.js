const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("is-open", !expanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

// Home splash: big lab logo first; scroll / swipe / tap / key enters the site.
const splash = document.getElementById("splash");
const root = document.documentElement;
if (splash && !root.classList.contains("splash-seen")) {
  const shownAt = performance.now();
  let entered = false;
  const enter = () => {
    if (entered || performance.now() - shownAt < 450) return;
    entered = true;
    try { sessionStorage.setItem("tes-splash-seen", "1"); } catch (e) { /* storage unavailable */ }
    window.scrollTo(0, 0);
    splash.classList.add("is-leaving");
    root.classList.remove("splash-lock");
    events.forEach(([type, handler]) => window.removeEventListener(type, handler));
    setTimeout(() => { splash.remove(); }, 750);
  };
  let touchY = null;
  const events = [
    ["wheel", (e) => { if (Math.abs(e.deltaY) > 2) enter(); }],
    ["touchstart", (e) => { touchY = e.touches[0]?.clientY ?? null; }],
    ["touchmove", (e) => { if (touchY !== null && Math.abs((e.touches[0]?.clientY ?? touchY) - touchY) > 12) enter(); }],
    ["keydown", (e) => { if (["ArrowDown", "PageDown", " ", "Enter", "Escape"].includes(e.key)) { e.preventDefault(); enter(); } }]
  ];
  events.forEach(([type, handler]) => window.addEventListener(type, handler, { passive: type !== "keydown" }));
  splash.addEventListener("click", enter);
} else if (splash) {
  splash.remove();
}

// News photo viewer: click a photo to see the full set for that news item.
const galleryLinks = document.querySelectorAll("[data-gallery]");
if (galleryLinks.length) {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.innerHTML = '<button class="lightbox-close" type="button" aria-label="닫기">×</button><button class="lightbox-prev" type="button" aria-label="이전 사진">‹</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox-next" type="button" aria-label="다음 사진">›</button>';
  document.body.append(box);
  const img = box.querySelector("img");
  const caption = box.querySelector("figcaption");
  let set = [];
  let index = 0;
  let title = "";
  const show = () => {
    img.src = set[index];
    caption.textContent = set.length > 1 ? `${title}  (${index + 1} / ${set.length})` : title;
    box.querySelector(".lightbox-prev").hidden = set.length < 2;
    box.querySelector(".lightbox-next").hidden = set.length < 2;
  };
  const close = () => { box.hidden = true; img.removeAttribute("src"); document.documentElement.classList.remove("lightbox-open"); };
  const step = (delta) => { index = (index + delta + set.length) % set.length; show(); };
  galleryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const group = link.dataset.gallery;
      const row = link.closest(".news-row");
      const links = row ? [row.querySelector(".news-art"), ...row.querySelectorAll(".news-thumbs a")] : [...document.querySelectorAll(`[data-gallery="${group}"]`)];
      set = links.map((item) => item.getAttribute("href"));
      index = Math.max(0, set.indexOf(link.getAttribute("href")));
      title = row?.querySelector("h3")?.textContent.trim() || "";
      box.hidden = false;
      document.documentElement.classList.add("lightbox-open");
      show();
    });
  });
  box.querySelector(".lightbox-close").addEventListener("click", close);
  box.querySelector(".lightbox-prev").addEventListener("click", () => step(-1));
  box.querySelector(".lightbox-next").addEventListener("click", () => step(1));
  box.addEventListener("click", (event) => { if (event.target === box) close(); });
  document.addEventListener("keydown", (event) => {
    if (box.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });
}

// Open Courses: show the video thumbnail first, play in place on click (opens YouTube when viewed as a local file).
document.querySelectorAll(".video-facade[data-video]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (location.protocol === "file:") return;
    event.preventDefault();
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${link.dataset.video}?autoplay=1&rel=0`;
    frame.title = link.getAttribute("aria-label") || "YouTube video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.className = "video-frame";
    link.replaceWith(frame);
  });
});

const journalMetricsByYear = new Map([
  ["Energy Conversion and Management|2026", ["10.9", "1.9%"]],
  ["International Journal of Heat and Mass Transfer|2026", ["5.8", "7.9%"]],
  ["Scientific Reports|2025", ["3.9", "18.0%"]],
  ["Advanced Materials Interfaces|2024", ["4.4", "32.8%"]],
  ["International Journal of Heat and Mass Transfer|2024", ["5.8", "7.9%"]],
  ["Membranes|2024", ["3.6", "36.7%"]],
  ["Micromachines|2024", ["3.0", "38.6%"]],
  ["Micromachines|2023", ["3.0", "33.6%"]],
  ["International Journal of Energy Research|2021", ["4.7", "51.7%"]],
  ["International Journal of Heat and Mass Transfer|2021", ["5.4", "10.5%"]],
  ["Applied Physics B|2020", ["2.1", "58.1%"]],
  ["International Journal of Hydrogen Energy|2020", ["5.8", "29.3%"]],
  ["International Journal of Energy Research|2020", ["5.2", "37.3%"]],
  ["Solar Energy Materials & Solar Cells|2020", ["7.3", "17.2%"]],
  ["Applied Energy|2020", ["9.7", "3.8%"]],
  ["Renewable Energy|2020", ["8.0", "13.6%"]],
  ["Renewable Energy|2019", ["6.3", "16.5%"]],
  ["Journal of Thermophysics and Heat Transfer|2018", ["1.1", "77.5%"]],
  ["Journal of Quantitative Spectroscopy & Radiative Transfer|2018", ["3.0", "27.9%"]]
]);

document.querySelectorAll(".publication-full").forEach((publication) => {
  const type = publication.querySelector(".pub-type")?.textContent.trim();
  if (type !== "JOURNAL ARTICLE") return;

  const journal = publication.querySelector("p em")?.textContent.trim();
  if (!journal) return;
  const year = publication.querySelector("p")?.textContent.match(/\b(20\d{2})\b/)?.[1];
  const metricsData = year && journalMetricsByYear.get(`${journal}|${year}`);
  if (!metricsData) return;

  const metrics = document.createElement("p");
  metrics.className = "journal-metrics";
  metrics.textContent = `JIF ${metricsData[0]} · JCR top rank ${metricsData[1]} (${year})`;
  const originalLink = publication.querySelector("a");
  if (originalLink) publication.insertBefore(metrics, originalLink);
});

// KOR / ENG switch: swaps Korean text for English using window.TES_EN (assets/i18n-en.js).
(() => {
  const dict = window.TES_EN || {};
  const header = document.querySelector(".site-header");
  if (!header) return;
  const ATTRS = ["alt", "aria-label", "title"];
  const original = new Map();
  const norm = (text) => text.replace(/\s+/g, " ").trim();
  const textNodes = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.parentElement?.closest("script, style, svg, noscript") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  };
  const apply = (lang) => {
    if (lang === "en") {
      textNodes().forEach((node) => {
        const key = norm(node.nodeValue);
        if (!key || !dict[key]) return;
        if (!original.has(node)) original.set(node, node.nodeValue);
        const lead = node.nodeValue.match(/^\s*/)[0];
        const tail = node.nodeValue.match(/\s*$/)[0];
        node.nodeValue = lead + dict[key] + tail;
      });
      document.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
        ATTRS.forEach((attr) => {
          const value = el.getAttribute(attr);
          const key = value && norm(value);
          if (!key || !dict[key]) return;
          const store = `data-ko-${attr}`;
          if (!el.hasAttribute(store)) el.setAttribute(store, value);
          el.setAttribute(attr, dict[key]);
        });
      });
    } else {
      original.forEach((value, node) => { node.nodeValue = value; });
      original.clear();
      ATTRS.forEach((attr) => {
        document.querySelectorAll(`[data-ko-${attr}]`).forEach((el) => {
          el.setAttribute(attr, el.getAttribute(`data-ko-${attr}`));
          el.removeAttribute(`data-ko-${attr}`);
        });
      });
    }
    document.documentElement.lang = lang === "en" ? "en" : "ko";
    document.documentElement.classList.toggle("lang-en", lang === "en");
    switcher.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  };
  const switcher = document.createElement("div");
  switcher.className = "lang-switch";
  switcher.setAttribute("role", "group");
  switcher.setAttribute("aria-label", "Language");
  switcher.innerHTML = '<button type="button" data-lang="ko">KOR</button><button type="button" data-lang="en">ENG</button>';
  header.insertBefore(switcher, header.querySelector(".menu-toggle"));
  let current = "ko";
  try { current = localStorage.getItem("tes-lang") === "en" ? "en" : "ko"; } catch (e) { /* storage unavailable */ }
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (!button || button.dataset.lang === current) return;
    if (current === "en") apply("ko");
    current = button.dataset.lang;
    try { localStorage.setItem("tes-lang", current); } catch (e) { /* storage unavailable */ }
    apply(current);
  });
  apply(current);
})();

// Achievements: count the numbers up once when they appear.
(() => {
  const nums = document.querySelectorAll(".stat-num[data-count]");
  if (!nums.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const run = (el) => {
    const target = Number(el.dataset.count) || 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 900);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .4 });
    nums.forEach((n) => io.observe(n));
  } else nums.forEach(run);
})();