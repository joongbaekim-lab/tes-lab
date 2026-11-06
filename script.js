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

// Home splash: big lab logo, enter the site on scroll / swipe / tap / key.
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
    setTimeout(() => { splash.remove(); document.getElementById("main")?.focus?.({ preventScroll: true }); }, 750);
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

// News photos: use assets/news/<name>.jpg|.png|.jpeg when present, otherwise keep the illustration.
document.querySelectorAll(".news-art[data-photo]").forEach((box) => {
  const base = box.dataset.photo;
  const exts = [".jpg", ".png", ".jpeg", ".webp"];
  const img = new Image();
  img.className = "news-photo news-real";
  img.alt = box.closest(".news-row")?.querySelector("h3")?.textContent.trim() || "";
  img.loading = "lazy";
  let i = 0;
  img.onerror = () => { i += 1; if (i < exts.length) img.src = base + exts[i]; };
  img.onload = () => { box.classList.add("has-photo"); box.prepend(img); };
  img.src = base + exts[0];
});

const journalImpactFactors = new Map([
  ["Energy Conversion and Management", "11.8"],
  ["International Journal of Heat and Mass Transfer", "6.6"],
  ["Scientific Reports", "3.9"],
  ["Advanced Materials Interfaces", "4.5"],
  ["Membranes", "4.2"],
  ["Micromachines", "3.5"],
  ["International Journal of Energy Research", "4.2"],
  ["Applied Physics B", "2.5"],
  ["International Journal of Hydrogen Energy", "9.2"],
  ["Solar Energy Materials & Solar Cells", "6.6"],
  ["Applied Energy", "12.2"],
  ["Renewable Energy", "9.1"],
  ["Journal of Thermophysics and Heat Transfer", null],
  ["Journal of Quantitative Spectroscopy & Radiative Transfer", "2.0"]
]);

document.querySelectorAll(".publication-full").forEach((publication) => {
  const type = publication.querySelector(".pub-type")?.textContent.trim();
  if (type !== "JOURNAL ARTICLE" && type !== "SCOPUS JOURNAL") return;

  const journal = publication.querySelector("p em")?.textContent.trim();
  if (!journal) return;

  const metrics = document.createElement("p");
  metrics.className = "journal-metrics";

  if (type === "SCOPUS JOURNAL") {
    metrics.textContent = "JCR 미등재 · JIF 미부여";
  } else {
    const impactFactor = journalImpactFactors.get(journal);
    metrics.textContent = impactFactor
      ? `JCR 2026 · JIF ${impactFactor}`
      : "JCR 등재 · JIF 확인 필요";
  }

  publication.append(metrics);
});
