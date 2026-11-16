import { DATA } from "./data";
import {
  TRACK_COLORS,
  esc,
  hideTip,
  initTrail,
  playWipe,
  setMotionState,
  state
} from "./helpers";
import { renderBrandStory, renderHome, renderMap } from "./pages-home";
import {
  renderAppPage,
  renderFeed,
  renderHostDetail,
  renderNotFound,
  renderPopMeeting,
  renderProfile,
  renderTalks
} from "./pages-community";

let activeSurfaceObserver: IntersectionObserver | null = null;
let activeRevealObserver: IntersectionObserver | null = null;
let lastRouteKey = "";

function initChrome(): void {
  const headerNav = document.getElementById("header-nav");
  const menuNav = document.getElementById("menu-nav");
  const footer = document.getElementById("site-footer");
  const menuEl = document.getElementById("menu");
  const openBtn = document.getElementById("menu-open-btn");
  const closeBtn = document.getElementById("menu-close-btn");
  const topBtn = document.getElementById("top-btn");

  if (headerNav) {
    headerNav.innerHTML = DATA.nav
      .map((n) => `<a class="nav-link t-micro u-anim" href="${esc(n.href)}">${esc(n.label)}</a>`)
      .join("");
  }

  if (menuNav) {
    menuNav.innerHTML = DATA.nav
      .map((n) => `<a class="menu-overlay-link u-anim" href="${esc(n.href)}">${esc(n.label)}</a>`)
      .join("");
  }

  if (footer) {
    const stepW = 100 / TRACK_COLORS.length;
    const stairRects = TRACK_COLORS.map(
      (col, idx) => `<rect x="${idx * stepW}" y="0" width="${stepW + 0.5}" height="8" fill="${col}"/>`
    ).join("");

    footer.innerHTML = `
      <div class="grid">
        <div class="col-full footer-logo-row">
          <img class="footer-logo-mark" src="./assets/aistudio/kkachi_7b3a40bf.jpg" alt="까치 KKACHI 로고" width="120" height="120">
          <span class="footer-logo-wordmark">까치 · KKACHI</span>
        </div>
      </div>

      <div class="grid footer-cols">
        <div class="footer-block">
          <p class="t-micro footer-block-head">(WHERE · 서울 팝 스팟)</p>
          <p class="t-small">${esc(DATA.meta.venue.name)}</p>
          <p class="t-micro" style="margin-top:6px;">${esc(DATA.meta.venue.street)}</p>
          <p class="t-micro" style="margin-top:4px;">${esc(DATA.meta.venue.city)}</p>
        </div>

        <div class="footer-block">
          <p class="t-micro footer-block-head">(WHEN · 운영 시간)</p>
          <p class="t-small tnum">${esc(DATA.copy.heroDate)}</p>
          <p class="t-micro" style="margin-top:6px;">${esc(DATA.copy.heroTimes[0])}</p>
          <p class="t-micro" style="margin-top:4px;">${esc(DATA.copy.heroTimes[1])}</p>
        </div>

        <div class="footer-block">
          <p class="t-micro footer-block-head">(PAGES · 메뉴)</p>
          <ul class="footer-nav-list">
            ${DATA.nav.map((n) => `<li><a class="btn-text t-small u-anim" href="${esc(n.href)}">${esc(n.label)}</a></li>`).join("")}
            <li><a class="btn-text t-small u-anim" href="#/profile">PROFILE</a></li>
            <li><a class="btn-text t-small u-anim" href="#/app">GET A APP</a></li>
          </ul>
        </div>

        <div class="footer-block">
          <p class="t-micro footer-block-head">(SYSTEM &amp; MOTION)</p>
          <button type="button" class="btn-text t-small u-anim" id="motion-toggle-footer" aria-pressed="true">(Motion: on)</button>
          <p class="t-micro" style="margin-top:12px;">${esc(DATA.copy.colophon)}</p>
        </div>
      </div>

      <div class="grid footer-bottom">
        <p class="footer-honesty t-micro">${esc(DATA.copy.honesty)}</p>
        <p class="footer-ver t-micro tnum">${esc(DATA.copy.version)}</p>
      </div>

      <svg class="footer-staircase" viewBox="0 0 100 8" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">
        ${stairRects}
      </svg>
    `;
  }

  const toggleMotion = () => setMotionState(!state.motionOn);
  document.getElementById("motion-toggle-mobile")?.addEventListener("click", toggleMotion);
  document.getElementById("motion-toggle-footer")?.addEventListener("click", toggleMotion);
  setMotionState(state.motionOn);

  function setMenuOpen(open: boolean) {
    if (!menuEl || !openBtn) return;
    menuEl.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("menu-open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      closeBtn?.focus();
    } else {
      openBtn.focus();
    }
  }

  openBtn?.addEventListener("click", () => setMenuOpen(true));
  closeBtn?.addEventListener("click", () => setMenuOpen(false));
  menuEl?.addEventListener("click", (e) => {
    const link = (e.target as Element).closest("a");
    if (link) setMenuOpen(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideTip();
      if (menuEl?.classList.contains("is-open")) setMenuOpen(false);
    }
    if (e.key === "Tab" && menuEl?.classList.contains("is-open")) {
      const focusables = Array.from(
        menuEl.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])")
      );
      if (focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: state.motionOn ? "smooth" : "auto" });
    });
    const syncTopBtn = () => {
      topBtn.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);
    };
    syncTopBtn();
    window.addEventListener("scroll", syncTopBtn, { passive: true });
  }

  initTrail();
}

function syncHeaderSurface(surface: string): void {
  const header = document.getElementById("site-header");
  const topBtn = document.getElementById("top-btn");
  if (header) header.setAttribute("data-surface", surface);
  if (topBtn) topBtn.setAttribute("data-surface", surface);
}

function setupObservers(): void {
  if (activeSurfaceObserver) {
    activeSurfaceObserver.disconnect();
    activeSurfaceObserver = null;
  }
  if (activeRevealObserver) {
    activeRevealObserver.disconnect();
    activeRevealObserver = null;
  }

  const main = document.getElementById("main");
  if (!main) return;

  const sections = Array.from(main.querySelectorAll<HTMLElement>("section[data-surface]"));
  if (sections.length > 0) {
    const initialSurface = sections[0].dataset.surface || "sodium";
    syncHeaderSurface(initialSurface);

    const pickActiveSection = () => {
      const hh = window.innerWidth >= 768 ? 64 : 56;
      const probeY = hh + 24;
      let chosen = sections[0];
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          chosen = sec;
          break;
        }
      }
      syncHeaderSurface(chosen.dataset.surface || "sodium");
    };

    activeSurfaceObserver = new IntersectionObserver(pickActiveSection, {
      rootMargin: "-64px 0px -65% 0px",
      threshold: [0, 0.1, 0.25]
    });
    sections.forEach((sec) => activeSurfaceObserver!.observe(sec));
    window.addEventListener("scroll", pickActiveSection, { passive: true });
    state.routeCleanup.push(() => window.removeEventListener("scroll", pickActiveSection));
  } else {
    syncHeaderSurface("sodium");
  }

  const reveals = Array.from(main.querySelectorAll<HTMLElement>(".reveal-text, .reveal-block"));
  if (!state.motionOn) {
    reveals.forEach((el) => el.classList.add("is-revealed"));
  } else if (reveals.length > 0) {
    activeRevealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            activeRevealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => activeRevealObserver!.observe(el));
  }
}

function parseRoute(hash: string): string[] {
  const clean = (hash || "#/").replace(/^#\/?/, "").replace(/\/+$/, "");
  if (!clean) return [];
  return clean.split("/").map((p) => decodeURIComponent(p));
}

function updateActiveNav(parts: string[]): void {
  const root = parts[0] || "";
  const routeHash = root ? `#/${root}` : "#/";

  document.querySelectorAll<HTMLAnchorElement>("#header-nav a, #menu-nav a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const active = href === routeHash || (root === "talks" && href === "#/pop-meeting");
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  const profLink = document.getElementById("header-profile-link");
  const appBtn = document.getElementById("header-app-btn");
  if (profLink) {
    if (root === "profile") profLink.setAttribute("aria-current", "page");
    else profLink.removeAttribute("aria-current");
  }
  if (appBtn) {
    if (root === "app") appBtn.setAttribute("aria-current", "page");
    else appBtn.removeAttribute("aria-current");
  }
}

function renderRouteContent(main: HTMLElement, parts: string[]): void {
  const root = parts[0] || "";
  if (!root) {
    renderHome(main);
  } else if (root === "brand-story") {
    renderBrandStory(main);
  } else if (root === "map") {
    renderMap(main);
  } else if (root === "pop-meeting") {
    renderPopMeeting(main);
  } else if (root === "feed" && parts.length === 1) {
    renderFeed(main);
  } else if (root === "feed" && parts.length >= 2) {
    renderHostDetail(main, parts[1]);
  } else if (root === "talks") {
    renderTalks(main, parts[1]);
  } else if (root === "profile") {
    renderProfile(main);
  } else if (root === "app") {
    renderAppPage(main);
  } else {
    renderNotFound(main);
  }
}

function mountRoute(skipWipe: boolean): void {
  const main = document.getElementById("main");
  if (!main) return;

  const parts = parseRoute(window.location.hash);
  const routeKey = parts.join("/");
  const shouldWipe = !skipWipe && routeKey !== lastRouteKey;
  lastRouteKey = routeKey;

  const commit = () => {
    while (state.routeCleanup.length > 0) {
      const fn = state.routeCleanup.pop();
      try {
        fn?.();
      } catch {
        // Ignore cleanup failure
      }
    }
    hideTip();
    renderRouteContent(main, parts);
    updateActiveNav(parts);
    setupObservers();

    const targetId = state.scrollAfterRoute;
    state.scrollAfterRoute = null;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        window.requestAnimationFrame(() => el.scrollIntoView({ behavior: "auto" }));
        return;
      }
    }

    if (!skipWipe) {
      window.scrollTo({ top: 0, behavior: "auto" });
      const h1 = main.querySelector<HTMLElement>("h1[tabindex='-1']");
      if (h1) h1.focus({ preventScroll: true });
    }
  };

  if (shouldWipe) {
    playWipe(commit);
  } else {
    commit();
  }
}

function init(): void {
  initChrome();
  mountRoute(true);
  window.addEventListener("hashchange", () => mountRoute(false));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
