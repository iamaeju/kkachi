import { DATA } from "./data";
import {
  TRACK_COLORS,
  buildCapacityGrid,
  easeAssemble,
  easeMorph,
  esc,
  fmtTime,
  hashStr,
  initPortraitCanvas,
  layoutGlyphLines,
  makeRng,
  motion,
  sessionsByDay,
  sessionsBySpeaker,
  sessionsByTrack,
  speakerById,
  state,
  storageSet,
  svgBitmapText,
  timeToMin,
  trackById
} from "./helpers";

export function renderHome(main: HTMLElement): void {
  document.title = DATA.copy.homeTitle;
  const c = DATA.copy;
  const totalSold = DATA.tickets.reduce((a, t) => a + t.sold, 0);

  main.innerHTML = `
    <section class="hero-sec" id="hero" data-surface="sodium" data-pager="Hero">
      <h1 class="visually-hidden">${esc(c.heroH1)}</h1>
      <div class="grid" style="padding-inline:0;">
        <div class="hero-top-address t-lead reveal-text">
          ${c.heroAddress.map((l) => `<div>${esc(l)}</div>`).join("")}
        </div>
        <div class="hero-top-date t-micro tnum">${esc(c.heroDate)}</div>
      </div>

      <figure class="hero-display-wrap">
        <canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>
        <div class="grid hero-sub-row" style="padding-inline:0;">
          <figcaption class="hero-caption t-micro" id="hero-cycle-caption">${esc(c.heroCycle[0].caption)}</figcaption>
          <div class="hero-times t-micro tnum">${esc(c.heroTimes[0])} · ${esc(c.heroTimes[1])}</div>
        </div>
      </figure>

      <div class="grid hero-bottom-row" style="padding-inline:0;">
        <div class="hero-split-wrap t-lead reveal-text">
          ${c.heroSplit.map((line) => {
            const onlyR = !line.left && line.right ? " only-right" : "";
            return `<div class="split-line${onlyR}"><span>${esc(line.left)}</span><span class="frag-right">${esc(line.right)}</span></div>`;
          }).join("")}
        </div>
        <p class="hero-final-wrap t-lead"><a class="btn-text u-anim" href="#/app">${esc(c.heroFinal)}</a></p>
      </div>
    </section>

    <section class="sec" id="about" data-surface="sodium" data-pager="BRAND STORY">
      <div class="grid">
        <p class="col-1-3 t-micro">(BRAND STORY)</p>
        <h2 class="col-5-12 t-h2 reveal-text">${esc(c.aboutLead)}</h2>
      </div>
      <div class="grid about-paras">
        <p class="about-para-1 t-body reveal-text">${esc(c.aboutP1)}</p>
        <p class="about-para-2 t-body reveal-text">${esc(c.aboutP2)}</p>
      </div>
      <div class="grid brand-visual-row">
        <div class="col-1-5 brand-card" data-surface="paper">
          <div class="brand-logo-stage">
            <img src="./assets/aistudio/kkachi_7b3a40bf.jpg" alt="까치 KKACHI 시그니처 로고 마크" width="280" height="280">
          </div>
          <div>
            <p class="t-small fw-600">까치 시그니처 심볼 · KKACHI Mark</p>
            <p class="t-micro" style="margin-top:6px;">두 개의 날개 화살표와 반가운 소식을 전하는 머리 형태를 결합한 기하학 심볼. / Geometric magpie-arrow emblem.</p>
          </div>
        </div>
        <div class="col-7-12 brand-card" data-surface="pale">
          <div>
            <p class="t-micro">(COLOR SYSTEM · 채도/명도 변주 팔레트)</p>
            <p class="t-lead" style="margin-top:8px;">하나의 라임 컬러에서 파생된 스펙트럼<span class="t-en t-small">Monochromatic saturation &amp; brightness system</span></p>
            <div class="swatch-grid">
              <div class="swatch-cell" style="background:${DATA.tokens.vivid};color:${DATA.tokens.ink};">
                <span class="t-micro">Vivid</span><span class="t-micro tnum">${DATA.tokens.vivid}</span>
              </div>
              <div class="swatch-cell" style="background:${DATA.tokens.sodium};color:${DATA.tokens.ink};">
                <span class="t-micro">Base</span><span class="t-micro tnum">${DATA.tokens.sodium}</span>
              </div>
              <div class="swatch-cell" style="background:${DATA.tokens.soft};color:${DATA.tokens.ink};">
                <span class="t-micro">Soft</span><span class="t-micro tnum">${DATA.tokens.soft}</span>
              </div>
              <div class="swatch-cell" style="background:${DATA.tokens.deep};color:${DATA.tokens.vivid};">
                <span class="t-micro">Deep</span><span class="t-micro tnum">${DATA.tokens.deep}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;">
            <a class="btn-text t-small u-anim" href="#/brand-story">(BRAND STORY 전체 보기 · Full Story)</a>
            <a class="btn-text t-small u-anim" href="#/map">(MAP 스팟 보기 · Explore Map)</a>
          </div>
        </div>
      </div>
    </section>

    <section class="sec" id="numbers" data-surface="ink" data-pager="Numbers">
      <h2 class="visually-hidden">까치 커뮤니티 현황 및 카운트다운</h2>
      <div class="grid">
        <p class="col-1-3 t-micro">(COMMUNITY SIGNAL · 실시간 현황)</p>
      </div>
      <div class="grid stats-grid-row">
        <div class="stats-items" id="stats-items"></div>
      </div>
      <div class="grid countdown-block">
        <div class="col-full">
          <p class="t-micro">(NEXT FLAGSHIP POP MEETING · 다음 플래그십 팝미팅까지)</p>
          <div id="countdown-wrap"></div>
          <p class="visually-hidden" id="countdown-sr" aria-live="off"></p>
        </div>
      </div>
    </section>

    <section class="sec" id="tracks" data-surface="ink" data-pager="POP MEETING">
      <div class="grid">
        <p class="col-1-3 t-micro">(POP MEETING · 4가지 무드)</p>
        <h2 class="col-5-12 t-h2 t-paper reveal-text">${esc(c.tracksLead)}</h2>
      </div>
      <div class="grid tracks-grid" id="tracks-grid"></div>
    </section>

    <section class="sec" id="days" data-surface="paper" data-pager="Schedule">
      <div class="grid">
        <p class="col-1-3 t-micro">(WEEKEND DROP · 주말 팝미팅)</p>
        <h2 class="col-5-12 t-h2 reveal-text">${esc(c.daysLead)}</h2>
      </div>
      <div class="grid days-cols" id="days-cols"></div>
    </section>

    <section class="sec" id="speakers-preview" data-surface="sodium" data-pager="FEED">
      <div class="grid">
        <p class="col-1-3 t-micro">(FEED · 크루 호스트)</p>
        <h2 class="col-5-12 t-h2 reveal-text">${esc(c.speakersLead)}</h2>
        <div class="col-full speakers-preview-grid" id="speakers-preview-grid"></div>
        <div class="col-full speakers-footer-link">
          <a class="btn-text t-micro u-anim" href="#/feed">(FEED 전체 호스트 &amp; 피드 보기 · All 10 Hosts)</a>
        </div>
      </div>
    </section>

    <section class="sec" id="poster" data-surface="paper" data-pager="Poster wall">
      <div class="grid">
        <div class="poster-head-left t-small">
          ${c.posterLeftHead.map((l) => `<div>${esc(l)}</div>`).join("")}
        </div>
        <h2 class="poster-head-right t-h2">
          ${c.posterRightHead.map((l) => `<div>${esc(l)}</div>`).join("")}
        </h2>
      </div>
      <div class="grid">
        <figure class="col-full">
          <div class="poster-wall-wrap" id="poster-wall"></div>
          <figcaption class="poster-caption t-micro">(패턴 타일을 클릭해 채도·명도 조합을 바꿔보세요 · Press any tile to cycle lime shades; workshop <a class="u-anim" href="#/talks/p13">p13</a>)</figcaption>
        </figure>
      </div>
    </section>

    <section class="sec" id="passes" data-surface="sodium" data-pager="GET A APP">
      <div class="grid">
        <p class="col-1-3 t-micro">(GET A APP · 오픈 베타 참여)</p>
        <h2 class="col-5-12 t-h2 reveal-text">${totalSold} / ${DATA.meta.capacity}명의 멤버가 이미 첫 팝미팅에 합류했습니다. <span class="t-en t-small">${totalSold} of ${DATA.meta.capacity} community spots claimed.</span></h2>
        <div class="col-full" id="home-capacity-wrap"></div>
        <div class="col-full passes-cta-row">
          <a class="btn-primary t-small" href="#/app"><span>GET A APP · 앱 시작하기</span></a>
          <button type="button" class="btn-text t-small u-anim" id="home-read-faq">(FAQ 자주 묻는 질문)</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("home-read-faq")?.addEventListener("click", () => {
    state.scrollAfterRoute = "faq";
    window.location.hash = "#/app";
  });

  initHeroCanvas();
  initStatsAndCountdown();
  initTrackPanels();
  initDaysSection();
  initSpeakersPreview();
  initPosterWall();
  buildCapacityGrid(document.getElementById("home-capacity-wrap")!, {});

  const splitWrap = main.querySelector(".hero-split-wrap");
  const fitHeroSplitLines = () => {
    if (!splitWrap) return;
    const lines = Array.from(splitWrap.querySelectorAll(".split-line"));
    if (window.innerWidth < 768) {
      lines.forEach((ln) => ln.classList.remove("is-stacked"));
      return;
    }
    const wrapW = splitWrap.clientWidth;
    lines.forEach((ln) => {
      ln.classList.remove("is-stacked");
      const spans = ln.querySelectorAll("span");
      if (spans.length < 2) return;
      const lw = spans[0].textContent ? spans[0].getBoundingClientRect().width : 0;
      const rw = spans[1].textContent ? spans[1].getBoundingClientRect().width : 0;
      if (lw > 0 && rw > 0 && lw + rw + 32 > wrapW) ln.classList.add("is-stacked");
    });
  };
  fitHeroSplitLines();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroSplitLines);
  const splitRo = new ResizeObserver(fitHeroSplitLines);
  if (splitWrap) splitRo.observe(splitWrap);
  state.routeCleanup.push(() => splitRo.disconnect());
}

function initHeroCanvas(): void {
  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
  const captionEl = document.getElementById("hero-cycle-caption");
  if (!canvas || !captionEl) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let cssW = 0, cssH = 0, dpr = 1;
  let isMobile = window.innerWidth < 768;
  let cycleIdx = 0;
  let particles: Array<{ sx: number; sy: number; tx: number; ty: number; x: number; y: number; vx: number; vy: number; delay: number; color: string; sparkle: boolean }> = [];
  let morphStart = 0;
  let morphDuration = 1100;
  let isAssembling = true;
  let holdTimer = 0;
  let inView = true;
  let running = false;
  let pointerX = -9999, pointerY = -9999;

  function getTargetLayout(idx: number) {
    const item = DATA.copy.heroCycle[idx];

    if (item.logo) {
      const grid = isMobile ? item.logoMobile : item.logoDesktop;
      if (grid) {
        return {
          totalCols: grid.cols,
          totalRows: grid.rows,
          cells: grid.cells.map(([x, y]) => ({ x, y }))
        };
      }
    }

    const lines = isMobile ? item.mobile : [item.desktop];
    const layout = layoutGlyphLines(lines, 2, true);
    const totalCols = isMobile ? Math.max(25, layout.cols) : Math.max(45, layout.cols);
    const offsetX = Math.floor((totalCols - layout.cols) / 2);
    return {
      totalCols,
      totalRows: isMobile ? 20 : 9,
      cells: layout.cells.map((c) => ({ x: c.x + offsetX, y: c.y }))
    };
  }

  function sizeCanvas() {
    const rect = canvas!.getBoundingClientRect();
    isMobile = window.innerWidth < 768;
    cssW = rect.width;
    cssH = rect.height;
    if (cssW <= 0 || cssH <= 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(cssW * dpr);
    canvas!.height = Math.round(cssH * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildParticlesForTarget(idx: number, assembleFromRandom: boolean) {
    const t = getTargetLayout(idx);
    const rng = makeRng(hashStr("hero-" + idx + "-" + Date.now()));
    const newParticles: typeof particles = [];
    const targetCells = t.cells;
    const oldParticles = particles;

    if (assembleFromRandom || oldParticles.length === 0) {
      for (let i = 0; i < targetCells.length; i++) {
        const tc = targetCells[i];
        newParticles.push({
          sx: assembleFromRandom ? rng() * t.totalCols : tc.x,
          sy: assembleFromRandom ? rng() * t.totalRows : tc.y,
          tx: tc.x, ty: tc.y, x: tc.x, y: tc.y, vx: 0, vy: 0,
          delay: assembleFromRandom ? rng() * 380 : 0,
          color: DATA.tokens.ink, sparkle: false
        });
      }
      isAssembling = assembleFromRandom;
      morphDuration = 1100;
    } else {
      const count = Math.max(oldParticles.length, targetCells.length);
      for (let i = 0; i < count; i++) {
        const src = oldParticles[i % oldParticles.length];
        const dst = targetCells[i % targetCells.length];
        const isSparkle = rng() < 0.14;
        newParticles.push({
          sx: src.x, sy: src.y, tx: dst.x, ty: dst.y, x: src.x, y: src.y, vx: 0, vy: 0,
          delay: (dst.x / t.totalCols) * 280,
          color: isSparkle ? DATA.tokens.deep : DATA.tokens.ink,
          sparkle: isSparkle
        });
      }
      isAssembling = false;
      morphDuration = 850;
    }
    particles = newParticles;
    morphStart = performance.now();
    captionEl!.textContent = DATA.copy.heroCycle[idx].caption;
  }

  function drawStatic() {
    sizeCanvas();
    if (cssW <= 0) return;
    const t = getTargetLayout(0);
    const cellW = cssW / t.totalCols;
    const cellH = cellW / 1.25;
    ctx!.fillStyle = DATA.tokens.sodium;
    ctx!.fillRect(0, 0, cssW, cssH);
    ctx!.fillStyle = DATA.tokens.ink;
    for (let i = 0; i < t.cells.length; i++) {
      const c = t.cells[i];
      const x0 = Math.round(c.x * cellW * dpr) / dpr;
      const y0 = Math.round(c.y * cellH * dpr) / dpr;
      const x1 = Math.round((c.x + 1) * cellW * dpr) / dpr;
      const y1 = Math.round((c.y + 1) * cellH * dpr) / dpr;
      ctx!.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    captionEl!.textContent = DATA.copy.heroCycle[0].caption;
  }

  function step(now: number) {
    if (!state.motionOn) { running = false; motion.remove(step); drawStatic(); return; }
    if (cssW <= 0) sizeCanvas();
    if (cssW <= 0) return;
    const t = getTargetLayout(cycleIdx);
    const cellW = cssW / t.totalCols;
    const cellH = cellW / 1.25;
    const elapsed = now - morphStart;
    const easeFn = isAssembling ? easeAssemble : easeMorph;
    const repelRadius = cellW * 3;
    const maxDisp = 1.5;

    ctx!.fillStyle = DATA.tokens.sodium;
    ctx!.fillRect(0, 0, cssW, cssH);

    const buckets = new Map<string, typeof particles>();
    buckets.set(DATA.tokens.ink, []);
    let allSettled = pointerX < -5000;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.min(1, Math.max(0, (elapsed - p.delay) / morphDuration));
      const e = easeFn(localT);
      const baseX = p.sx + (p.tx - p.sx) * e;
      const baseY = p.sy + (p.ty - p.sy) * e;

      let targetDx = 0, targetDy = 0;
      if (pointerX > -5000) {
        const px = (baseX + 0.5) * cellW;
        const py = (baseY + 0.5) * cellH;
        const dx = px - pointerX;
        const dy = py - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.001 && dist < repelRadius) {
          const push = (1 - dist / repelRadius) * maxDisp;
          targetDx = (dx / dist) * push;
          targetDy = (dy / dist) * push;
        }
      }
      if (localT >= 1 && pointerX < -5000) {
        p.vx = 0; p.vy = 0; p.x = p.tx; p.y = p.ty;
      } else {
        allSettled = false;
        p.vx = (p.vx + (targetDx - (p.x - baseX)) * 0.12) * 0.8;
        p.vy = (p.vy + (targetDy - (p.y - baseY)) * 0.12) * 0.8;
        p.x = baseX + (p.x - baseX) + p.vx;
        p.y = baseY + (p.y - baseY) + p.vy;
      }

      const col = (p.sparkle && elapsed < 400) ? p.color : DATA.tokens.ink;
      if (!buckets.has(col)) buckets.set(col, []);
      buckets.get(col)!.push(p);
    }

    if (allSettled && elapsed >= 400) {
      ctx!.fillStyle = DATA.tokens.ink;
      const rowMap = new Map<number, number[]>();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!rowMap.has(p.ty)) rowMap.set(p.ty, []);
        rowMap.get(p.ty)!.push(p.tx);
      }
      rowMap.forEach((xs, y) => {
        xs.sort((a, b) => a - b);
        let start = xs[0], prev = xs[0];
        const y0 = Math.round(y * cellH * dpr) / dpr;
        const y1 = Math.round((y + 1) * cellH * dpr) / dpr;
        for (let k = 1; k <= xs.length; k++) {
          if (k < xs.length && (xs[k] === prev + 1 || xs[k] === prev)) prev = xs[k];
          else {
            const x0 = Math.round(start * cellW * dpr) / dpr;
            const x1 = Math.round((prev + 1) * cellW * dpr) / dpr;
            ctx!.fillRect(x0, y0, x1 - x0, y1 - y0);
            if (k < xs.length) { start = xs[k]; prev = xs[k]; }
          }
        }
      });
    } else {
      buckets.forEach((list, col) => {
        ctx!.fillStyle = col;
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          const x0 = Math.round(p.x * cellW * dpr) / dpr;
          const y0 = Math.round(p.y * cellH * dpr) / dpr;
          const x1 = Math.round((p.x + 1) * cellW * dpr) / dpr;
          const y1 = Math.round((p.y + 1) * cellH * dpr) / dpr;
          ctx!.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
      });
    }
  }

  function scheduleNext() {
    window.clearTimeout(holdTimer);
    if (!state.motionOn || !inView) return;
    holdTimer = window.setTimeout(() => {
      if (!state.motionOn || !inView || document.hidden) return;
      cycleIdx = (cycleIdx + 1) % DATA.copy.heroCycle.length;
      buildParticlesForTarget(cycleIdx, false);
      scheduleNext();
    }, 3200 + morphDuration);
  }

  function startLoop() {
    if (!state.motionOn) { drawStatic(); return; }
    if (!running) { running = true; motion.add(step); }
    scheduleNext();
  }

  function stopLoop() {
    window.clearTimeout(holdTimer);
    if (running) { running = false; motion.remove(step); }
  }

  sizeCanvas();
  if (state.motionOn) { buildParticlesForTarget(0, true); startLoop(); }
  else drawStatic();

  canvas.addEventListener("click", () => {
    if (!state.motionOn) return;
    cycleIdx = (cycleIdx + 1) % DATA.copy.heroCycle.length;
    buildParticlesForTarget(cycleIdx, false);
    scheduleNext();
  });

  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointerX = e.clientX - r.left; pointerY = e.clientY - r.top;
    }, { passive: true });
    canvas.addEventListener("pointerleave", () => { pointerX = -9999; pointerY = -9999; });
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      inView = entry.intersectionRatio >= 0.1;
      if (inView && state.motionOn) startLoop();
      else stopLoop();
    }
  }, { threshold: [0, 0.1] });
  io.observe(canvas);

  let rTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(rTimer);
    rTimer = window.setTimeout(() => {
      const wasMob = isMobile;
      sizeCanvas();
      if (!state.motionOn) drawStatic();
      else if (wasMob !== isMobile) buildParticlesForTarget(cycleIdx, false);
    }, 150);
  });
  ro.observe(canvas);

  const onMotionChange = () => {
    if (state.motionOn) { cycleIdx = 0; buildParticlesForTarget(0, true); startLoop(); }
    else { stopLoop(); drawStatic(); }
  };
  window.addEventListener("kkachi:motionchange", onMotionChange);

  state.routeCleanup.push(() => {
    stopLoop(); io.disconnect(); ro.disconnect(); window.clearTimeout(rTimer);
    window.removeEventListener("kkachi:motionchange", onMotionChange);
  });
}

function initStatsAndCountdown(): void {
  const statsWrap = document.getElementById("stats-items");
  if (!statsWrap) return;
  const statsData = [
    { val: DATA.days.length, label: "days · 주말 3일" },
    { val: DATA.meta.rooms, label: "spots · 서울 스팟" },
    { val: DATA.tracks.length, label: "moods · 취향 트랙" },
    { val: DATA.speakers.length, label: "hosts · 크루 호스트" },
    { val: DATA.sessions.length, label: "pops · 팝미팅" }
  ];

  statsWrap.innerHTML = statsData.map((s, idx) => `
    <div class="stat-item" data-sidx="${idx}">
      <div class="stat-glyph">${svgBitmapText(String(s.val).padStart(2, "0"), 10, DATA.tokens.sodium, { className: "stat-svg", ariaHidden: true, bold: true })}</div>
      <p class="t-small t-sodium stat-label">${esc(s.label)}</p>
    </div>
  `).join("");

  if (state.motionOn) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.disconnect();
          statsData.forEach((s, idx) => {
            const box = statsWrap.querySelector(`[data-sidx="${idx}"] .stat-glyph`);
            if (!box) return;
            window.setTimeout(() => {
              let step = 0;
              const timer = window.setInterval(() => {
                step++;
                const cur = step >= 12 ? s.val : Math.round((s.val * step) / 12);
                box.innerHTML = svgBitmapText(String(cur).padStart(2, "0"), 10, DATA.tokens.sodium, { className: "stat-svg", ariaHidden: true, bold: true });
                if (step >= 12) window.clearInterval(timer);
              }, 90);
            }, idx * 80);
          });
        }
      }
    }, { threshold: 0.5 });
    io.observe(statsWrap);
    state.routeCleanup.push(() => io.disconnect());
  }

  const cdWrap = document.getElementById("countdown-wrap")!;
  const srEl = document.getElementById("countdown-sr")!;
  const targetMs = Date.parse(DATA.meta.firstTalkUTC);
  let cdTimer = 0;
  let lastMinuteText = "";

  function cdCellH() {
    const w = window.innerWidth;
    const avail = cdWrap.clientWidth || (w - 48);
    let target = 5;
    if (w >= 1440) target = 12;
    else if (w >= 1024) target = 10;
    else if (w >= 768) target = 8;
    else if (w >= 390) target = 6;
    if (w >= 768) {
      const maxFit = Math.floor((avail / (81 * 1.25)) * 2) / 2;
      return Math.max(4, Math.min(target, maxFit));
    }
    return target;
  }

  function renderCountdown() {
    const diff = Math.max(0, targetMs - Date.now());
    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const ch = cdCellH();
    const parts = [
      { val: String(d).padStart(3, "0"), label: "days · 일" },
      { val: String(h).padStart(2, "0"), label: "hours · 시간" },
      { val: String(m).padStart(2, "0"), label: "min · 분" },
      { val: String(s).padStart(2, "0"), label: "sec · 초" }
    ];

    if (window.innerWidth < 768) {
      cdWrap.innerHTML = `
        <div class="countdown-row">
          <div class="cd-pair">
            <div class="cd-group">${svgBitmapText(parts[0].val, ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}<span class="t-micro cd-group-label">${parts[0].label}</span></div>
            <div style="margin:0 4px;">${svgBitmapText(":", ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}</div>
            <div class="cd-group">${svgBitmapText(parts[1].val, ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}<span class="t-micro cd-group-label">${parts[1].label}</span></div>
          </div>
          <div class="cd-pair" style="width:100%;">
            <div class="cd-group">${svgBitmapText(parts[2].val, ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}<span class="t-micro cd-group-label">${parts[2].label}</span></div>
            <div style="margin:0 4px;">${svgBitmapText(":", ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}</div>
            <div class="cd-group">${svgBitmapText(parts[3].val, ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}<span class="t-micro cd-group-label">${parts[3].label}</span></div>
          </div>
        </div>`;
    } else {
      cdWrap.innerHTML = `
        <div class="countdown-row">
          ${parts.map((pt, i) => `
            <div class="cd-pair">
              <div class="cd-group">
                ${svgBitmapText(pt.val, ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}
                <span class="t-micro cd-group-label">${pt.label}</span>
              </div>
              ${i < 3 ? `<div style="margin:0 ${Math.floor(ch * 0.8)}px;">${svgBitmapText(":", ch, DATA.tokens.sodium, { ariaHidden: true, bold: true })}</div>` : ""}
            </div>
          `).join("")}
        </div>`;
    }

    const minText = `${d} days, ${h} hours, ${m} minutes`;
    if (minText !== lastMinuteText) { lastMinuteText = minText; srEl.textContent = minText; }
    cdTimer = window.setTimeout(renderCountdown, 1000 - (Date.now() % 1000) + 10);
  }

  renderCountdown();
  const onResize = () => { window.clearTimeout(cdTimer); renderCountdown(); };
  window.addEventListener("resize", onResize, { passive: true });
  state.routeCleanup.push(() => { window.clearTimeout(cdTimer); window.removeEventListener("resize", onResize); });
}

function initTrackPanels(): void {
  const grid = document.getElementById("tracks-grid");
  if (!grid) return;

  const weavePlus = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 6, py = (y + phase) % 6;
    return ((px === 1 && py <= 2) || (py === 1 && px <= 2) || (px === 4 && py >= 3) || (py === 4 && px >= 3)) ? 1 : 0;
  };
  const weaveCross = (x: number, y: number, phase: number) => (((x + phase) % 4 === 1 || (y + phase) % 4 === 1) ? 1 : 0);
  const weaveTartan = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4, py = (y + phase) % 4;
    return ((px < 2) !== (py < 2) || (px === 1 && py === 1)) ? 1 : 0;
  };
  const weaveBasket = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4, py = (y + phase) % 4;
    const block = ((Math.floor((x + phase) / 4) + Math.floor((y + phase) / 4)) % 2) === 0;
    return block ? (py % 2 === 0 ? 1 : 0) : (px % 2 === 0 ? 1 : 0);
  };

  // All combinations strictly saturation & brightness variations of signature lime
  const PANEL_STYLES: Record<string, { colA: string; colB: string; band: string; fg: string; weave: (x: number, y: number, p: number) => number }> = {
    walk: { colA: DATA.tokens.vivid, colB: DATA.tokens.olive, band: DATA.tokens.vivid, fg: DATA.tokens.ink, weave: weavePlus },
    sound: { colA: DATA.tokens.mid, colB: DATA.tokens.deep, band: DATA.tokens.mid, fg: DATA.tokens.ink, weave: weaveCross },
    craft: { colA: DATA.tokens.soft, colB: DATA.tokens.olive, band: DATA.tokens.soft, fg: DATA.tokens.ink, weave: weaveBasket },
    night: { colA: DATA.tokens.deep, colB: DATA.tokens.vivid, band: DATA.tokens.deep, fg: DATA.tokens.vivid, weave: weaveTartan }
  };

  grid.innerHTML = DATA.tracks.map((t) => {
    const count = sessionsByTrack(t.id).length;
    const style = PANEL_STYLES[t.id];
    return `
      <div class="track-fig">
        <button type="button" class="track-panel-btn" data-track="${esc(t.id)}" style="--track-band:${style.band};--track-fg:${style.fg};">
          <svg class="track-panel-svg" viewBox="0 0 80 72" shape-rendering="crispEdges" aria-hidden="true"></svg>
          <div class="track-card-body">
            <div>
              <p class="track-card-title">${esc(t.label)}</p>
              <p class="t-small track-card-desc">${esc(t.desc)}</p>
            </div>
            <div class="track-card-foot">
              <span class="t-micro">${count} pop-meetings</span>
              <svg class="track-card-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 12L12 2M12 2H4M12 2V10" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/>
              </svg>
            </div>
          </div>
        </button>
      </div>
    `;
  }).join("");

  const controllers: Array<() => void> = [];
  DATA.tracks.forEach((t) => {
    const btn = grid.querySelector(`.track-panel-btn[data-track="${t.id}"]`) as HTMLButtonElement;
    const svg = btn.querySelector(".track-panel-svg") as SVGSVGElement;
    const panel = PANEL_STYLES[t.id];
    const cell = 4, cols = 20, rows = 18;
    let busy = false, animTimer = 0;

    function drawGrid(phase: number) {
      let out = `<rect x="0" y="0" width="${cols * cell}" height="${rows * cell}" fill="${panel.colA}"/>`;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (panel.weave(x, y, phase) === 1) {
            out += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${panel.colB}"/>`;
          }
        }
      }
      svg.innerHTML = out;
    }

    drawGrid(0);

    function play() {
      if (!state.motionOn || busy) return;
      busy = true;
      let step = 0;
      animTimer = window.setInterval(() => {
        step++;
        drawGrid(step % 6);
        if (step >= 6) { window.clearInterval(animTimer); drawGrid(0); busy = false; }
      }, 90);
    }

    btn.addEventListener("mouseenter", play);
    btn.addEventListener("focus", play);
    btn.addEventListener("click", () => {
      state.filters.tracks = [t.id];
      state.filters.agendaOnly = false;
      storageSet("kkachi.filters", state.filters);
      window.location.hash = "#/pop-meeting";
    });

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { io.disconnect(); play(); }
      }
    }, { threshold: 0.4 });
    io.observe(btn);

    state.routeCleanup.push(() => { io.disconnect(); window.clearInterval(animTimer); });
    controllers.push(play);
  });

  const idleTimer = window.setInterval(() => {
    if (!state.motionOn || document.hidden) return;
    const fn = controllers[Math.floor(Math.random() * controllers.length)];
    if (fn) fn();
  }, 6000);
  state.routeCleanup.push(() => window.clearInterval(idleTimer));
}

function initDaysSection(): void {
  const wrap = document.getElementById("days-cols");
  if (!wrap) return;
  wrap.innerHTML = DATA.days.map((day) => {
    const daySessions = sessionsByDay(day.id).sort((a, b) => timeToMin(a.start) - timeToMin(b.start));
    return `
      <div class="day-col">
        ${svgBitmapText(day.num, 8, DATA.tokens.ink, { className: "day-num-svg", ariaHidden: true, bold: true })}
        <h3 class="t-lead">${esc(day.label)} — ${esc(day.theme)}</h3>
        <p class="t-micro day-doors">Doors ${esc(day.doors)}</p>
        <div class="day-session-list">
          ${daySessions.map((s) => {
            const tr = trackById(s.track);
            const spkNames = s.speakers.map((id) => speakerById(id).name).join(", ");
            return `
              <a class="day-session-row" href="#/talks/${esc(s.id)}" data-track="${esc(s.track)}">
                <div class="t-micro tnum">${fmtTime(s.start)}–${fmtTime(s.end)}</div>
                <div class="t-small day-session-title">${esc(s.title)}</div>
                <div class="t-micro day-session-meta">
                  <span>${esc(spkNames)}</span>
                  <span class="track-chip track-chip-${esc(s.track)}">${esc(tr.label.split("·")[0].trim())}</span>
                </div>
              </a>
            `;
          }).join("")}
        </div>
        <div class="day-col-footer">
          <button type="button" class="btn-text t-micro u-anim" data-fullday="${esc(day.id)}">(Full day · 전체 보기)</button>
        </div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-fullday]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filters.day = (btn as HTMLElement).dataset.fullday!;
      state.filters.tracks = [];
      storageSet("kkachi.filters", state.filters);
      window.location.hash = "#/pop-meeting";
    });
  });
}

function initSpeakersPreview(): void {
  const grid = document.getElementById("speakers-preview-grid");
  if (!grid) return;
  grid.innerHTML = DATA.speakers.map((sp) => {
    const firstSess = sessionsBySpeaker(sp.id)[0];
    return `
      <figure class="speaker-card">
        <a class="speaker-card-link" href="#/feed/${esc(sp.id)}">
          <canvas class="portrait-canvas" data-spid="${esc(sp.id)}" role="img" aria-label="Pixel portrait of ${esc(sp.name)}"></canvas>
          <figcaption class="speaker-card-figcap">
            <h3 class="t-lead speaker-card-name">${esc(sp.name)}</h3>
            <p class="t-micro speaker-card-role">${esc(sp.role)}</p>
            <p class="t-micro speaker-card-talk">(${esc(firstSess ? firstSess.title : "")})</p>
          </figcaption>
        </a>
      </figure>
    `;
  }).join("");

  DATA.speakers.forEach((sp) => {
    const canvas = grid.querySelector(`canvas[data-spid="${sp.id}"]`) as HTMLCanvasElement | null;
    if (canvas) initPortraitCanvas(canvas, sp, {});
  });
}

export function initPosterWall(): void {
  const wall = document.getElementById("poster-wall");
  if (!wall) return;

  const CHIPS_LEFT = {
    tl: [
      { text: "까치 · KKACHI SEOUL", indent: 0 },
      { text: "지금 가장 가까운 번개 모임", indent: 1 },
      { text: "Walk, Sound, Craft, Night", indent: 0 },
      { text: "짧고 가벼운 연결", indent: 2 }
    ],
    mr: [
      { text: "FRI 21 – SUN 23 MAY", indent: 1 },
      { text: "Seongsu · Yeonnam · Euljiro", indent: 0 },
      { text: "84% 혼자 참여하는 모임", indent: 2 }
    ],
    bl: [
      { text: "Quiet Lounge 상시 운영", indent: 1 },
      { text: "내향인도 편안한 무소음 세션", indent: 0 },
      { text: "Step-free · Solo welcome", indent: 2 }
    ]
  };

  const CHIPS_RIGHT = {
    tl: [
      { text: "LIME MONOCHROME SYSTEM", indent: 0 },
      { text: "Vivid · #CBFE23", indent: 1 },
      { text: "Base · #D8E43B", indent: 0 },
      { text: "Olive · #576B0D / Deep · #323E07", indent: 2 }
    ],
    mr: [
      { text: "PIXEL BADGE SWAP · SAT 17.00", indent: 1 },
      { text: "PROFILE 탭에서 16×16 배지 제작", indent: 0 },
      { text: "클릭 시 라임 팔레트 순환", indent: 2 }
    ],
    bl: [
      { text: "640 CAP · OPEN BETA", indent: 1 },
      { text: "Community Free & Supporter", indent: 0 },
      { text: "GET A APP · 지금 시작하기", indent: 2 }
    ]
  };

  const chipsHTML = (data: typeof CHIPS_LEFT) => `
    <div class="poster-chips-layer" aria-hidden="true">
      <div class="chip-group chip-group-tl">${data.tl.map((c) => `<span class="poster-chip-line t-small chip-indent-${c.indent}">${esc(c.text)}</span>`).join("")}</div>
      <div class="chip-group chip-group-mr">${data.mr.map((c) => `<span class="poster-chip-line t-small chip-rindent-${c.indent}">${esc(c.text)}</span>`).join("")}</div>
      <div class="chip-group chip-group-bl">${data.bl.map((c) => `<span class="poster-chip-line t-small chip-indent-${c.indent}">${esc(c.text)}</span>`).join("")}</div>
    </div>
  `;

  wall.innerHTML = `
    <div class="poster-stack poster-stack-left" id="poster-left">
      <button type="button" class="poster-mod" id="mod-m1" aria-label="Shuffle lime pattern 1"></button>
      <button type="button" class="poster-mod" id="mod-m3" aria-label="Shuffle lime pattern 2"></button>
      <button type="button" class="poster-mod" id="mod-m4" aria-label="Shuffle lime pattern 3"></button>
      ${chipsHTML(CHIPS_LEFT)}
    </div>
    <div class="poster-stack poster-stack-right" id="poster-right">
      <button type="button" class="poster-mod" id="mod-m6" aria-label="Shuffle lime pattern 4"></button>
      <button type="button" class="poster-mod" id="mod-m2" aria-label="Shuffle lime pattern 5"></button>
      <button type="button" class="poster-mod" id="mod-m5" aria-label="Shuffle lime pattern 6"></button>
      ${chipsHTML(CHIPS_RIGHT)}
    </div>
  `;

  const syncU = () => {
    const left = document.getElementById("poster-left");
    if (left) wall.style.setProperty("--poster-u", `${Math.round(left.getBoundingClientRect().width / 8)}px`);
  };
  syncU();
  window.addEventListener("resize", syncU, { passive: true });
  state.routeCleanup.push(() => window.removeEventListener("resize", syncU));

  // Monochromatic chartreuse-lime saturation & brightness pairs
  const PALETTES = [
    [DATA.tokens.vivid, DATA.tokens.deep],
    [DATA.tokens.soft, DATA.tokens.olive],
    [DATA.tokens.pale, DATA.tokens.mid],
    [DATA.tokens.sodium, DATA.tokens.deep],
    [DATA.tokens.muted, DATA.tokens.vivid],
    [DATA.tokens.olive, DATA.tokens.pale]
  ];

  const weaveCross = (x: number, y: number, phase: number) => (((x + phase) % 4 === 1 || (y + phase) % 4 === 1) ? 1 : 0);
  const weavePlus = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 6, py = (y + phase) % 6;
    return ((px === 1 && py <= 2) || (py === 1 && px <= 2) || (px === 4 && py >= 3) || (py === 4 && px >= 3)) ? 1 : 0;
  };
  const weaveTartan = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4, py = (y + phase) % 4;
    return ((px < 2) !== (py < 2) || (px === 1 && py === 1)) ? 1 : 0;
  };
  const weaveBasket = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4, py = (y + phase) % 4;
    const block = ((Math.floor((x + phase) / 4) + Math.floor((y + phase) / 4)) % 2) === 0;
    return block ? (py % 2 === 0 ? 1 : 0) : (px % 2 === 0 ? 1 : 0);
  };

  const MODULES = [
    { id: "mod-m1", cols: 20, rows: 25, paletteIdx: 0, weave: weavePlus, solidMask: (_x: number, y: number) => (y < 7 ? 0 : -1) },
    { id: "mod-m2", cols: 20, rows: 25, paletteIdx: 1, weave: weaveCross, solidMask: (x: number, _y: number) => (x >= 13 ? 1 : -1) },
    { id: "mod-m3", cols: 20, rows: 20, paletteIdx: 2, weave: weaveBasket, solidMask: (_x: number, y: number) => (y >= 13 ? 0 : -1) },
    { id: "mod-m4", cols: 20, rows: 20, paletteIdx: 3, weave: weaveTartan, solidMask: (_x: number, y: number) => (y >= 16 ? 1 : -1) },
    { id: "mod-m5", cols: 20, rows: 20, paletteIdx: 4, weave: weaveBasket, solidMask: (x: number, _y: number) => (x < 4 ? 0 : -1) },
    { id: "mod-m6", cols: 20, rows: 20, paletteIdx: 5, weave: weaveTartan, solidMask: (_x: number, y: number) => (y < 4 ? 0 : -1) }
  ];

  MODULES.forEach((mod) => {
    const btn = document.getElementById(mod.id);
    if (!btn) return;
    const cell = 4, w = mod.cols * cell, h = mod.rows * cell;
    let palIdx = mod.paletteIdx, phase = 0, timer = 0;

    const draw = () => {
      const [colA, colB] = PALETTES[palIdx];
      let rects = `<rect x="0" y="0" width="${w}" height="${h}" fill="${colA}"/>`;
      for (let y = 0; y < mod.rows; y++) {
        for (let x = 0; x < mod.cols; x++) {
          const mask = mod.solidMask(x, y);
          const tone = mask !== -1 ? mask : mod.weave(x, y, phase);
          if (tone === 1) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${colB}"/>`;
        }
      }
      btn.innerHTML = `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
    };

    draw();

    btn.addEventListener("click", () => {
      palIdx = (palIdx + 1) % PALETTES.length;
      if (!state.motionOn) { phase = (phase + 1) % 6; draw(); return; }
      window.clearInterval(timer);
      let steps = 0;
      draw();
      timer = window.setInterval(() => {
        phase = (phase + 1) % 6; draw(); steps++;
        if (steps >= 4) window.clearInterval(timer);
      }, 70);
    });

    btn.addEventListener("mouseenter", () => {
      if (!state.motionOn) return;
      window.clearInterval(timer);
      let steps = 0;
      timer = window.setInterval(() => {
        phase = (phase + 1) % 6; draw(); steps++;
        if (steps >= 3) window.clearInterval(timer);
      }, 85);
    });

    state.routeCleanup.push(() => window.clearInterval(timer));
  });
}

// Route: BRAND STORY (#/brand-story)
export function renderBrandStory(main: HTMLElement): void {
  document.title = "BRAND STORY" + DATA.copy.siteTitleSuffix;
  const pillars = [
    {
      num: "01",
      eng: "New Area",
      kor: "새로운 장소",
      desc: "익숙한 동네 골목부터 낯선 루프탑과 스튜디오까지, 장소가 모든 팝미팅의 배경이 됩니다. / Every neighborhood spot becomes a stage for shared taste.",
      bg: DATA.tokens.vivid,
      fg: DATA.tokens.ink
    },
    {
      num: "02",
      eng: "New People",
      kor: "새로운 사람들",
      desc: "장소를 배경으로 취향이 비슷한 사람들과 부담 없이 만나 자연스럽게 연결됩니다. / Meet kindred neighbors who share your rhythm and curiosity.",
      bg: DATA.tokens.soft,
      fg: DATA.tokens.ink
    },
    {
      num: "03",
      eng: "New Activity",
      kor: "새로운 경험",
      desc: "산책, 드립 커피, 리소그래피, 심야 러닝까지 혼자서는 망설였던 새로운 경험을 함께 엽니다. / Try walks, vinyl listening, craft workshops, and night runs together.",
      bg: DATA.tokens.mid,
      fg: DATA.tokens.ink
    },
    {
      num: "04",
      eng: "New Community",
      kor: "새로운 커뮤니티",
      desc: "팝미팅을 통해 취향과 라이프 스타일을 나누며 나다운 삶의 방식을 확장해 갑니다. / Build a warm, self-directed community that celebrates who you are.",
      bg: DATA.tokens.deep,
      fg: DATA.tokens.vivid
    }
  ];

  const swatches = [
    { name: "Vivid Signal · 고채도 라임", hex: DATA.tokens.vivid, fg: DATA.tokens.ink, role: "Primary highlight, badge active" },
    { name: "Signature Lime · 기준 컬러", hex: DATA.tokens.sodium, fg: DATA.tokens.ink, role: "Primary brand canvas" },
    { name: "Soft Lime · 고명도 라임", hex: DATA.tokens.soft, fg: DATA.tokens.ink, role: "Craft cards & secondary blocks" },
    { name: "Pale Mist · 최상 명도 라임", hex: DATA.tokens.pale, fg: DATA.tokens.ink, role: "Quiet detail panels & cards" },
    { name: "Mid Chartreuse · 중간 채도", hex: DATA.tokens.mid, fg: DATA.tokens.ink, role: "Sound track & map courtyard" },
    { name: "Muted Sage · 저채도 라임", hex: DATA.tokens.muted, fg: DATA.tokens.ink, role: "Quiet lounge & muted badges" },
    { name: "Olive Tone · 중간 어두운 톤", hex: DATA.tokens.olive, fg: DATA.tokens.paper, role: "Weave contrast & dark accents" },
    { name: "Deep Chartreuse · 최하 명도", hex: DATA.tokens.deep, fg: DATA.tokens.vivid, role: "Night track & hover fills" }
  ];

  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="BRAND STORY">
      <div class="grid">
        <p class="col-1-3 t-micro">(BRAND STORY)</p>
        <div class="col-5-12">
          <p class="t-small fw-600">까치 : 취향 기반 커뮤니티 (우리는 팝미팅을 열어요) · Taste-Based Pop-Meeting Community</p>
          <h1 class="t-h1" style="margin-top:12px;" tabindex="-1">Pop up? Nono, pop meeting!!</h1>
          <p class="t-h2" style="margin-top:10px;">We poped meeting everywhere.</p>
          <div class="brand-manifesto-strip">
            <span class="t-lead fw-600">취향, 라이프 스타일을 공유하다.</span>
            <span class="t-micro">Share your taste &amp; lifestyle anywhere.</span>
          </div>
        </div>
      </div>

      <div class="grid about-paras">
        <div class="col-1-6 brand-card" data-surface="paper">
          <div>
            <p class="t-micro">(WHAT IS KKACHI? · 까치의 시작)</p>
            <h2 class="t-h2" style="margin-top:12px;">장소를 배경으로 취향이 모이는 곳</h2>
            <p class="t-body" style="margin-top:16px;">
              까치는 장소를 배경으로 취향이 비슷한 사람들이 모이는 곳입니다. 우리는 여기서 취향과 라이프 스타일을 공유할 수 있어요.
            </p>
            <p class="t-small" style="margin-top:10px;opacity:0.8;">
              KKACHI is where people with similar tastes gather around meaningful spaces to share their lifestyle and everyday inspirations.
            </p>
          </div>
          <div style="padding-top:16px;border-top:var(--rule);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
            <span class="t-micro">POP-MEETING EVERYWHERE</span>
            <a class="btn-text t-micro u-anim" href="#/map">(MAP 스팟 둘러보기 →)</a>
          </div>
        </div>

        <div class="col-7-12 brand-who-card">
          <div>
            <p class="t-micro">(WHO? · 누가 팝미팅을 여나요?)</p>
            <h2 class="t-h2" style="margin-top:12px;">새로운 경험을 원하는 누구나 호스트가 됩니다</h2>
            <p class="t-body" style="margin-top:16px;">
              새로운 장소에서 새로운 사람들과 함께 새로운 경험을 하고 싶은 누구나 행사를 열 수 있습니다.
            </p>
            <p class="t-small" style="margin-top:10px;opacity:0.8;">
              Anyone who wants to share a new experience with new people in a new place can open and host a pop-meeting on KKACHI.
            </p>
          </div>
          <div style="padding-top:16px;border-top:var(--rule);display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a class="btn-primary t-small" href="#/pop-meeting"><span>POP MEETING 일정 보기</span></a>
            <a class="btn-text t-small u-anim" href="#/feed">(FEED 호스트 만나기)</a>
          </div>
        </div>
      </div>

      <div class="grid" style="margin-top:var(--s7);">
        <div class="col-full">
          <p class="t-micro">(FOUR PILLARS · 까치가 만드는 네 가지 새로움)</p>
          <div class="brand-pillars-grid">
            ${pillars.map((p) => `
              <article class="brand-pillar-card" style="background:${p.bg};color:${p.fg};">
                <div>
                  <p class="t-micro tnum">${esc(p.num)}</p>
                  <h3 class="t-h2" style="margin-top:8px;">${esc(p.eng)}</h3>
                  <p class="t-small fw-600" style="margin-top:4px;">${esc(p.kor)}</p>
                </div>
                <p class="t-small" style="opacity:0.95;">${esc(p.desc)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="sec" data-surface="ink" data-pager="Let's find me">
      <div class="grid">
        <p class="col-1-3 t-micro">(OUR MESSAGE · 나 다움)</p>
        <div class="col-5-12 brand-findme-box">
          <p class="t-h2 t-sodium">까치와 함께 더 잘 살 수 있는 방법을 찾아보세요!<br>나 다움을 찾아보세요!!</p>
          <p class="t-h1 t-paper" style="margin-top:4px;">New Area, New people, New activity, New community,<br>Let's find me!</p>
          <p class="t-small" style="opacity:0.85;">Discover a better way to live with KKACHI — find what truly feels like you through local pop-meetings.</p>
          <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
            <a class="btn-primary t-small" href="#/app"><span>GET A APP · 지금 시작하기</span></a>
            <a class="btn-text t-small u-anim" href="#/pop-meeting">(열려 있는 POP MEETING 보기)</a>
            <a class="btn-text t-small u-anim" href="#/profile">(PROFILE 배지 만들기)</a>
          </div>
        </div>
      </div>

      <div class="grid brand-visual-row" style="margin-top:var(--s7);">
        <div class="col-1-6 brand-card" data-surface="paper">
          <div class="brand-logo-stage">
            <img src="./assets/aistudio/kkachi_7b3a40bf.jpg" alt="까치 브랜드 심볼 로고" width="400" height="400">
          </div>
          <div>
            <h2 class="t-lead">01. 까치 로고 아키텍처 · Brand Mark</h2>
            <p class="t-body" style="margin-top:8px;">두 개의 예각 날개 화살표와 둥근 머리 심볼은 지도 위에서 방향을 가리키는 내비게이션 핀이자, 반가운 모임의 신호를 물어다 주는 까치를 형상화했습니다. / Dual flying arrowheads paired with a magpie head form both a map direction pin and a signal bird.</p>
          </div>
        </div>

        <div class="col-7-12 brand-card" data-surface="pale">
          <div>
            <h2 class="t-lead">02. 시그니처 컬러 소스 · Source Swatch</h2>
            <p class="t-body" style="margin-top:8px;">시그니처 라임 컬러 이미지에서 색조(Hue)를 고정한 채 채도(Saturation)와 명도(Brightness)만을 8단계로 조절해 전체 인터페이스를 구축했습니다. / All eight UI tones stem strictly from adjusting saturation and brightness of this single lime swatch.</p>
          </div>
          <div style="margin-top:16px;border:1px solid var(--ink);overflow:hidden;">
            <img src="./assets/aistudio/IMG_5197_92702380.JPEG" alt="까치 브랜드 기준 라임 컬러 스와치" style="display:block;width:100%;height:140px;object-fit:cover;">
          </div>
          <div class="swatch-grid">
            ${swatches.map((s) => `
              <div class="swatch-cell" style="background:${s.hex};color:${s.fg};">
                <div>
                  <div class="t-micro fw-600">${esc(s.name)}</div>
                  <div class="t-micro" style="opacity:0.85;margin-top:4px;">${esc(s.role)}</div>
                </div>
                <div class="t-micro tnum">${esc(s.hex)}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

// Route: MAP (#/map)
export function renderMap(main: HTMLElement): void {
  document.title = "MAP" + DATA.copy.siteTitleSuffix;
  const mapAppUrl = "https://meetup-map-pearl.vercel.app";

  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="MAP">
      <div class="grid">
        <p class="col-1-3 t-micro">(MAP · LIVE POP-MEETING MAP)</p>
        <div class="col-5-12">
          <h1 class="t-h1" tabindex="-1">${esc(DATA.copy.venueTitle)}</h1>
          <p class="t-lead" style="margin-top:16px;">${esc(DATA.copy.venueLead)}</p>
        </div>
      </div>

      <div class="grid">
        <div class="col-full map-toolbar">
          <div class="seg-group" role="group" aria-label="Map frame width">
            <button type="button" class="chip-toggle t-small" id="map-mode-wide" aria-pressed="true">(전체 화면 · Wide Map)</button>
            <button type="button" class="chip-toggle t-small" id="map-mode-mobile" aria-pressed="false">(앱 비율 · Mobile 390px)</button>
          </div>
          <div class="map-toolbar-actions">
            <button type="button" class="chip-toggle t-small" id="map-reload-btn">(새로고침 · Reload)</button>
            <a class="btn-text t-small u-anim" href="${esc(mapAppUrl)}" target="_blank" rel="noopener noreferrer">(새 탭에서 열기 ↗ · Open App)</a>
          </div>
        </div>

        <figure class="col-full map-embed-stage">
          <div class="map-embed-frame" id="map-embed-frame">
            <div class="map-frame-bar">
              <span class="t-micro">까치 로컬 커뮤니티 · 동네 모임 지도 (HOME TAB)</span>
              <span class="t-micro tnum" id="map-frame-size-label">WIDE VIEW</span>
            </div>
            <iframe
              class="map-iframe"
              id="kkachi-map-iframe"
              src="${esc(mapAppUrl)}"
              title="까치 로컬 커뮤니티 동네 모임 지도"
              allow="geolocation; clipboard-write"
              loading="eager"
            ></iframe>
          </div>
        </figure>
      </div>

      <div class="grid venue-info-cols">
        <div class="col-1-5">
          <h2 class="t-lead">지도 홈 탭 안내 · Map Home Tab</h2>
          <p class="t-body" style="margin-top:16px;">${esc(DATA.copy.venueGettingThere)}</p>
        </div>
        <div class="col-7-12">
          <h2 class="t-lead">공간 이용 및 접근성 · Hub Access</h2>
          <ul class="access-list t-body">
            ${DATA.copy.venueAccess.map((item) => `<li>${esc(item)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;

  const frame = document.getElementById("map-embed-frame")!;
  const sizeLabel = document.getElementById("map-frame-size-label")!;
  const wideBtn = document.getElementById("map-mode-wide")!;
  const mobileBtn = document.getElementById("map-mode-mobile")!;
  const reloadBtn = document.getElementById("map-reload-btn")!;
  const iframe = document.getElementById("kkachi-map-iframe") as HTMLIFrameElement;

  const setViewMode = (isMobileMode: boolean) => {
    frame.classList.toggle("is-mobile", isMobileMode);
    wideBtn.setAttribute("aria-pressed", isMobileMode ? "false" : "true");
    mobileBtn.setAttribute("aria-pressed", isMobileMode ? "true" : "false");
    sizeLabel.textContent = isMobileMode ? "MOBILE 390PX" : "WIDE VIEW";
  };

  wideBtn.addEventListener("click", () => setViewMode(false));
  mobileBtn.addEventListener("click", () => setViewMode(true));
  reloadBtn.addEventListener("click", () => {
    iframe.src = mapAppUrl;
  });
}
