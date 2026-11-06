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

// Match each current news item to its original dated photograph.
const newsPhotoSources = new Map([
  ["assets/news/news-2026-09-14", "News/001_2026-09-14.png"],
  ["assets/news/news-2026-08-31", "News/002_2026-08-31.png"],
  ["assets/news/news-2026-08-20-a", "News/003_2026-08-20.png"],
  ["assets/news/news-2026-08-20-b", "News/004_2026-08-20.png"],
  ["assets/news/news-2026-07-09", "News/007_2026-07-09.jpg"],
  ["assets/news/news-2026-07-02", "News/009_2026-07-02.jpg"],
  ["assets/news/news-2026-06-19", "News/014_2026-06-19.png"],
  ["assets/news/news-2026-06-27", "News/012_2026-06-27.png"],
  ["assets/news/news-2026-05-28", "News/016_2026-05-28.png"],
  ["assets/news/news-2026-05-27", "News/018_2026-05-27.png"],
  ["assets/news/news-2026-05-26", "News/019_2026-05-26.png"],
  ["assets/news/news-2026-04-29", "News/026_2026-04-29.png"],
  ["assets/news/news-2026-04-28", "News/029_2026-04-28.png"],
  ["assets/news/news-2026-04-22", "News/033_2026-04-22.png"],
  ["assets/news/news-2026-04-23", "News/031_2026-04-23.png"],
  ["assets/news/news-2026-01-15", "News/036_2026-01-15.png"],
  ["assets/news/news-2026-01-02", "News/039_2026-01-02.png"]
]);

// Use a mapped original photo when available, otherwise keep the legacy extension fallback.
document.querySelectorAll(".news-art[data-photo]").forEach((box) => {
  const base = box.dataset.photo;
  const source = newsPhotoSources.get(base);
  const exts = [".jpg", ".png", ".jpeg", ".webp"];
  const img = new Image();
  img.className = "news-photo news-real";
  img.alt = box.closest(".news-row")?.querySelector("h3")?.textContent.trim() || "";
  img.loading = "lazy";
  let i = 0;
  img.onerror = () => {
    if (!source && ++i < exts.length) img.src = base + exts[i];
    else img.remove();
  };
  img.onload = () => box.classList.add("has-photo");
  box.prepend(img);
  img.src = source || base + exts[0];
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
