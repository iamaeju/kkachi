import { DATA, type FeedCommentItem, type FeedPostItem, type HostItem, type SessionItem } from "./data";

export const TRACK_COLORS = [
  DATA.tokens.vivid,
  DATA.tokens.mid,
  DATA.tokens.soft,
  DATA.tokens.deep
];

export const TRAIL_COLORS = [
  DATA.tokens.vivid,
  DATA.tokens.sodium,
  DATA.tokens.mid,
  DATA.tokens.soft,
  DATA.tokens.olive,
  DATA.tokens.muted
];

export const BADGE_PALETTE = [
  { id: "0", name: "ink · 블랙", hex: DATA.tokens.ink },
  { id: "1", name: "paper · 화이트", hex: DATA.tokens.paper },
  { id: "2", name: "sodium · 시그니처 라임", hex: DATA.tokens.sodium },
  { id: "3", name: "vivid · 네온 라임", hex: DATA.tokens.vivid },
  { id: "4", name: "soft · 소프트 라임", hex: DATA.tokens.soft },
  { id: "5", name: "pale · 페일 라임", hex: DATA.tokens.pale },
  { id: "6", name: "mid · 미드 라임", hex: DATA.tokens.mid },
  { id: "7", name: "olive · 올리브 라임", hex: DATA.tokens.olive },
  { id: "8", name: "deep · 딥 차트뢰즈", hex: DATA.tokens.deep }
];

export function esc(str: unknown): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normText(str: string): string {
  return String(str).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function fmtTime(hhmm: string): string {
  return String(hhmm).replace(":", ".");
}

export function timeToMin(hhmm: string): number {
  const parts = hhmm.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, val: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage errors
  }
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  return function (t: number) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0, hi = 1, u = t;
    for (let i = 0; i < 12; i++) {
      u = (lo + hi) * 0.5;
      const mu = 1 - u;
      const x = 3 * mu * mu * u * x1 + 3 * mu * u * u * x2 + u * u * u;
      if (x < t) lo = u;
      else hi = u;
    }
    const mu = 1 - u;
    return 3 * mu * mu * u * y1 + 3 * mu * u * u * y2 + u * u * u;
  };
}

export const easeMorph = cubicBezier(0.7, 0, 0.3, 1);
export const easeAssemble = cubicBezier(0.2, 0, 0, 1);

export const trackById = (id: string) => DATA.tracks.find((t) => t.id === id)!;
export const roomById = (id: string) => DATA.rooms.find((r) => r.id === id)!;
export const dayById = (id: string) => DATA.days.find((d) => d.id === id)!;
export const speakerById = (id: string) => DATA.speakers.find((s) => s.id === id)!;
export const sessionById = (id: string) => DATA.sessions.find((s) => s.id === id);
export const sessionsByTrack = (id: string) => DATA.sessions.filter((s) => s.track === id);
export const sessionsByDay = (id: string) => DATA.sessions.filter((s) => s.day === id);
export const sessionsBySpeaker = (id: string) => DATA.sessions.filter((s) => s.speakers.includes(id));

export function defaultBadgeGrid(): string {
  // Draw a sleek 16x16 magpie-arrow emblem inspired by kkachi_7b3a40bf.jpg
  const g = new Array(256).fill("0"); // ink background
  const bird = [
    "............33..",
    "...........3333.",
    "...........333..",
    ".........33.....",
    "......3333......",
    "...333333.......",
    "......333.......",
    "....3333.3......",
    "..33333..3......",
    "333333...3......",
    "...333..........",
    "....33..........",
    ".....3..........",
    ".....3..........",
    "................",
    "................"
  ];
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      if (bird[r][c] === "3") g[r * 16 + c] = "3";
    }
  }
  return g.join("");
}

export function fallbackPortraitRows(speakerId: string): string[] {
  const rng = makeRng(hashStr(speakerId));
  const hairSide = rng() > 0.5 ? 1 : 0;
  const rows: string[] = [];
  for (let y = 0; y < 32; y++) {
    let row = "";
    for (let x = 0; x < 32; x++) {
      if (x === 0 || x === 31 || y === 0 || y === 31) {
        row += "0";
        continue;
      }
      let ch = "0";
      const sh = ((x - 16) / 14) ** 2 + ((y - 34) / 9) ** 2;
      if (sh <= 1) ch = "1";
      const hd = (x - 16) ** 2 + (y - 14) ** 2;
      if (hd <= 49) {
        ch = "1";
        if (y <= 10 || (hairSide && (x <= 10 || x >= 22) && y <= 14)) ch = "2";
      }
      if ((x === 13 && y === 14) || (x === 19 && y === 14)) ch = "2";
      if ((x === 13 && y === 13) || (x === 19 && y === 13)) ch = "3";
      if (y === 18 && x >= 14 && x <= 18) ch = "2";
      row += ch;
    }
    rows.push(row);
  }
  return rows;
}

const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const savedMotion = storageGet<boolean | null>("kkachi.motion", null);
const initialMotion = savedMotion === null ? !prefersReduce : Boolean(savedMotion);

export interface AuthUser {
  loggedIn: boolean;
  provider: "kkachi" | "kakao" | "google";
  nickname: string;
  email: string;
  homeArea: string;
  bio: string;
  syncedAt: string;
}

export interface AppState {
  motionOn: boolean;
  agenda: string[];
  filters: { day: string; tracks: string[]; agendaOnly: boolean; view: string };
  speakersFilter: { tracks: string[]; sort: string };
  talksFilter: { query: string; types: string[]; tracks: string[]; sortCol: string; sortDir: string; openId: string | null };
  selectedRoom: string;
  ticketQty: Record<string, number>;
  ticketDay: string;
  ticketError: boolean;
  badge: { grid: string; name: string };
  auth: AuthUser;
  feedLikes: string[];
  feedFollowing: string[];
  feedComments: Record<string, FeedCommentItem[]>;
  feedCustomPosts: FeedPostItem[];
  feedTrackFilter: string;
  scrollAfterRoute: string | null;
  routeCleanup: Array<() => void>;
}

const DEFAULT_AUTH: AuthUser = {
  loggedIn: false,
  provider: "kkachi",
  nickname: "",
  email: "",
  homeArea: "성수 베이스캠프",
  bio: "",
  syncedAt: ""
};

export const state: AppState = {
  motionOn: initialMotion,
  agenda: storageGet<string[]>("kkachi.agenda", ["p01", "p08"]),
  filters: Object.assign(
    { day: "d1", tracks: [], agendaOnly: false, view: "timeline" },
    storageGet("kkachi.filters", {})
  ),
  speakersFilter: { tracks: [], sort: "az" },
  talksFilter: { query: "", types: [], tracks: [], sortCol: "id", sortDir: "asc", openId: null },
  selectedRoom: "seongsu",
  ticketQty: { "community-free": 1, "pop-pass": 0, "host-creator": 0 },
  ticketDay: "",
  ticketError: false,
  badge: Object.assign(
    { grid: defaultBadgeGrid(), name: "까치 멤버 · Member" },
    storageGet("kkachi.badge", {})
  ),
  auth: Object.assign({}, DEFAULT_AUTH, storageGet<Partial<AuthUser>>("kkachi.auth", {})),
  feedLikes: storageGet<string[]>("kkachi.feedLikes", []),
  feedFollowing: storageGet<string[]>("kkachi.feedFollowing", ["커피공방 리플로우"]),
  feedComments: storageGet<Record<string, FeedCommentItem[]>>("kkachi.feedComments", {}),
  feedCustomPosts: storageGet<FeedPostItem[]>("kkachi.feedCustomPosts", []),
  feedTrackFilter: "all",
  scrollAfterRoute: null,
  routeCleanup: []
};

if (!Array.isArray(state.agenda)) state.agenda = [];
if (!Array.isArray(state.filters.tracks)) state.filters.tracks = [];
if (!["d1", "d2", "d3"].includes(state.filters.day)) state.filters.day = "d1";
if (!["timeline", "table"].includes(state.filters.view)) state.filters.view = "timeline";
if (typeof state.badge.grid !== "string" || state.badge.grid.length !== 256) {
  state.badge.grid = defaultBadgeGrid();
}
if (typeof state.badge.name !== "string") state.badge.name = "까치 멤버 · Member";
if (!Array.isArray(state.feedLikes)) state.feedLikes = [];
if (!Array.isArray(state.feedFollowing)) state.feedFollowing = [];
if (!Array.isArray(state.feedCustomPosts)) state.feedCustomPosts = [];

export function toggleAgenda(sessionId: string): void {
  const idx = state.agenda.indexOf(sessionId);
  if (idx === -1) state.agenda.push(sessionId);
  else state.agenda.splice(idx, 1);
  storageSet("kkachi.agenda", state.agenda);
}

export function hasClash(session: SessionItem): boolean {
  if (!state.agenda.includes(session.id)) return false;
  const sStart = timeToMin(session.start);
  const sEnd = timeToMin(session.end);
  return state.agenda.some((otherId) => {
    if (otherId === session.id) return false;
    const o = sessionById(otherId);
    if (!o || o.day !== session.day) return false;
    const oStart = timeToMin(o.start);
    const oEnd = timeToMin(o.end);
    return sStart < oEnd && oStart < sEnd;
  });
}

// Shared rAF scheduler
export const motion = (() => {
  const subs = new Set<(now: number) => void>();
  let rafId = 0;

  function tick(now: number) {
    rafId = 0;
    if (document.visibilityState === "hidden" || subs.size === 0) return;
    for (const fn of Array.from(subs)) {
      try {
        fn(now);
      } catch {
        subs.delete(fn);
      }
    }
    if (subs.size > 0) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function ensure() {
    if (!rafId && subs.size > 0 && document.visibilityState !== "hidden") {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    } else {
      ensure();
    }
  });

  return {
    add(fn: (now: number) => void) {
      subs.add(fn);
      ensure();
    },
    remove(fn: (now: number) => void) {
      subs.delete(fn);
      if (subs.size === 0 && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  };
})();

export function setMotionState(on: boolean): void {
  state.motionOn = Boolean(on);
  storageSet("kkachi.motion", state.motionOn);
  document.documentElement.classList.toggle("motion-on", state.motionOn);
  const label = state.motionOn ? "(Motion: on)" : "(Motion: off)";
  [document.getElementById("motion-toggle-mobile"), document.getElementById("motion-toggle-footer")].forEach((btn) => {
    if (btn) {
      btn.textContent = label;
      btn.setAttribute("aria-pressed", state.motionOn ? "true" : "false");
    }
  });
  window.dispatchEvent(new CustomEvent("kkachi:motionchange", { detail: { on: state.motionOn } }));
}

export function layoutGlyphLines(lines: string[], gapRows?: number, useBold?: boolean) {
  const gap = gapRows || 2;
  const set = useBold ? DATA.glyphsBold : DATA.glyphs;
  let maxCols = 0;
  const cells: Array<{ x: number; y: number }> = [];
  let rowOffset = 0;
  for (let l = 0; l < lines.length; l++) {
    const str = lines[l];
    let colOffset = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const g = set[ch] || set[" "];
      const w = g[0].length;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < w; c++) {
          if (g[r][c] === "#") cells.push({ x: colOffset + c, y: rowOffset + r });
        }
      }
      colOffset += w + (i < str.length - 1 ? 1 : 0);
    }
    if (colOffset > maxCols) maxCols = colOffset;
    rowOffset += 9 + (l < lines.length - 1 ? gap : 0);
  }
  return { cols: maxCols, rows: rowOffset, cells };
}

export function svgBitmapText(
  str: string | string[],
  cellH: number,
  fill?: string,
  opts?: { perCell?: boolean; fluid?: boolean; className?: string; ariaHidden?: boolean; bold?: boolean }
): string {
  const o = opts || {};
  const layout = layoutGlyphLines(Array.isArray(str) ? str : [str], 2, Boolean(o.bold));
  const vbW = layout.cols * 5;
  const vbH = layout.rows * 4;
  const color = fill || "currentColor";
  let rects = "";
  const rowMap = new Map<number, number[]>();
  for (let i = 0; i < layout.cells.length; i++) {
    const cell = layout.cells[i];
    if (!rowMap.has(cell.y)) rowMap.set(cell.y, []);
    rowMap.get(cell.y)!.push(cell.x);
  }
  rowMap.forEach((xs, y) => {
    xs.sort((a, b) => a - b);
    let start = xs[0], prev = xs[0];
    for (let k = 1; k <= xs.length; k++) {
      if (k < xs.length && xs[k] === prev + 1) {
        prev = xs[k];
      } else {
        const span = prev - start + 1;
        rects += `<rect x="${start * 5}" y="${y * 4}" width="${span * 5}" height="4.04"/>`;
        if (k < xs.length) {
          start = xs[k];
          prev = xs[k];
        }
      }
    }
  });
  const wAttr = o.fluid ? `width="100%"` : `width="${layout.cols * cellH * 1.25}" height="${layout.rows * cellH}"`;
  const cls = o.className ? ` class="${esc(o.className)}"` : "";
  const aria = o.ariaHidden ? ` aria-hidden="true"` : "";
  return `<svg${cls} viewBox="0 0 ${vbW} ${vbH}" ${wAttr} shape-rendering="crispEdges" fill="${color}"${aria}>${rects}</svg>`;
}

export function svgPixelIcon(name: string, size?: number): string {
  const s = size || 15;
  const grids: Record<string, string[]> = {
    plus: ["..#..","..#..","#####","..#..","..#.."],
    minus: [".....",".....","#####",".....","....."],
    check: ["....#","...#.","#.#..",".#...","....."],
    "arrow-right": ["..#..","...#.","#####","...#.","..#.."],
    "tri-up": ["..#..",".###.","#####",".....","....."],
    "tri-down": [".....",".....","#####",".###.","..#.."]
  };
  const g = grids[name] || grids.plus;
  let rects = "";
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (g[y][x] === "#") rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 5 5" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${rects}</svg>`;
}

export function svgStrike(): string {
  return `<svg class="btn-strike" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
}

// Tooltip
const tipEl = document.getElementById("tip")!;
let tipTimer = 0;

export function showTip(rect: DOMRect, text: string, immediate: boolean): void {
  window.clearTimeout(tipTimer);
  if (!text) return;
  const run = () => {
    tipEl.textContent = text;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    tipEl.classList.add("is-visible");
    const tw = tipEl.offsetWidth;
    const th = tipEl.offsetHeight;
    let left = rect.right + 8;
    let top = rect.top - th - 8;
    if (left + tw > vw - 8) left = Math.max(8, rect.left - tw - 8);
    if (top < 8) top = Math.min(vh - th - 8, rect.bottom + 8);
    tipEl.style.left = `${Math.round(left)}px`;
    tipEl.style.top = `${Math.round(top)}px`;
  };
  if (immediate) run();
  else tipTimer = window.setTimeout(run, 120);
}

export function hideTip(): void {
  window.clearTimeout(tipTimer);
  tipEl.classList.remove("is-visible");
}

// Pixel wipe overlay
const wipeCanvas = document.getElementById("wipe-canvas") as HTMLCanvasElement;
let wipeActive = false;

export function playWipe(onFull?: () => void): void {
  if (!state.motionOn || wipeActive) {
    if (onFull) onFull();
    return;
  }
  const ctx = wipeCanvas.getContext("2d");
  if (!ctx) {
    if (onFull) onFull();
    return;
  }
  wipeActive = true;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  wipeCanvas.width = Math.round(w * dpr);
  wipeCanvas.height = Math.round(h * dpr);
  wipeCanvas.classList.add("is-active");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cell = w >= 768 ? 48 : 32;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const maxDiag = cols + rows - 2 || 1;
  const start = performance.now();
  let swapped = false;

  function step(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, w, h);
    if (elapsed < 220) {
      const prog = elapsed / 220;
      const limit = prog * (maxDiag + 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c + r <= limit) {
            ctx!.fillStyle = TRACK_COLORS[(c + r) % 4];
            ctx!.fillRect(c * cell, r * cell, cell, cell);
          }
        }
      }
    } else {
      if (!swapped) {
        swapped = true;
        if (onFull) onFull();
      }
      const prog = Math.min(1, (elapsed - 220) / 220);
      const limit = prog * (maxDiag + 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c + r > limit) {
            ctx!.fillStyle = TRACK_COLORS[(c + r) % 4];
            ctx!.fillRect(c * cell, r * cell, cell, cell);
          }
        }
      }
      if (prog >= 1) {
        wipeCanvas.classList.remove("is-active");
        wipeActive = false;
        motion.remove(step);
      }
    }
  }
  motion.add(step);
}

// Pixel trail
export function initTrail(): void {
  const trailCanvas = document.getElementById("trail-canvas") as HTMLCanvasElement;
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
  const ctx = trailCanvas.getContext("2d");
  if (!ctx) return;

  let trailCells: Array<{ gx: number; gy: number; born: number; color: string }> = [];
  let trailRunning = false;
  let trailColorIdx = 0;
  let lastTrailCellKey = "";

  const sizeTrailCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    trailCanvas.width = Math.round(window.innerWidth * dpr);
    trailCanvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  sizeTrailCanvas();
  window.addEventListener("resize", sizeTrailCanvas, { passive: true });

  function tickTrail(now: number) {
    ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!state.motionOn) {
      trailCells = [];
      trailRunning = false;
      motion.remove(tickTrail);
      return;
    }
    const next: typeof trailCells = [];
    for (let i = 0; i < trailCells.length; i++) {
      const c = trailCells[i];
      const age = now - c.born;
      if (age < 260) {
        next.push(c);
        ctx!.globalAlpha = 1 - Math.floor((age / 260) * 4) / 4;
        ctx!.fillStyle = c.color;
        ctx!.fillRect(c.gx * 16, c.gy * 16, 16, 16);
      }
    }
    ctx!.globalAlpha = 1;
    trailCells = next;
    if (trailCells.length === 0) {
      trailRunning = false;
      motion.remove(tickTrail);
    }
  }

  window.addEventListener("pointermove", (e) => {
    if (!state.motionOn || e.pointerType !== "mouse") return;
    const gx = Math.floor(e.clientX / 16);
    const gy = Math.floor(e.clientY / 16);
    const key = `${gx},${gy}`;
    if (key === lastTrailCellKey) return;
    lastTrailCellKey = key;
    const color = TRAIL_COLORS[trailColorIdx % TRAIL_COLORS.length];
    trailColorIdx++;
    trailCells.push({ gx, gy, born: performance.now(), color });
    if (trailCells.length > 14) trailCells.shift();
    if (!trailRunning) {
      trailRunning = true;
      motion.add(tickTrail);
    }
  }, { passive: true });
}

// Portrait Canvas Renderer
export function initPortraitCanvas(canvas: HTMLCanvasElement, speaker: HostItem, opts?: { blockSize?: number; skipAssemble?: boolean }) {
  const o = opts || {};
  const rows = speaker.portrait.rows && speaker.portrait.rows.length === 32
    ? speaker.portrait.rows
    : fallbackPortraitRows(speaker.id);
  const pal = speaker.portrait.pal;

  let blockSize = o.blockSize || 1;
  let currentGrid = poolGrid(rows, blockSize);
  let assembled = !state.motionOn || Boolean(o.skipAssemble);
  let assembleStart = 0;
  let waveStart = 0;
  let waveDir = 0;
  let swapped = false;
  let animActive = false;
  let lastSize = 0;
  let prevGrid = currentGrid;
  let sweepActive = false;
  let sweepStart = 0;

  const rng = makeRng(hashStr(speaker.id));
  const fgIndices: number[] = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (currentGrid[y][x] !== "0") fgIndices.push(y * 32 + x);
    }
  }
  for (let i = fgIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = fgIndices[i];
    fgIndices[i] = fgIndices[j];
    fgIndices[j] = tmp;
  }
  const orderRank = new Int16Array(1024).fill(-1);
  fgIndices.forEach((pos, idx) => { orderRank[pos] = idx; });

  function poolGrid(srcRows: string[], bSize: number): string[] {
    if (bSize <= 1) return srcRows;
    const out: string[] = [];
    for (let y = 0; y < 32; y += bSize) {
      const blockRows = Array(bSize).fill("");
      for (let x = 0; x < 32; x += bSize) {
        const counts = [0, 0, 0, 0];
        for (let dy = 0; dy < bSize; dy++) {
          const r = srcRows[y + dy];
          for (let dx = 0; dx < bSize; dx++) counts[Number(r[x + dx]) || 0]++;
        }
        let bestIdx = 0, bestCount = -1;
        for (let c = 0; c < 4; c++) {
          if (counts[c] > bestCount) { bestCount = counts[c]; bestIdx = c; }
        }
        const ch = String(bestIdx);
        for (let dy = 0; dy < bSize; dy++) blockRows[dy] += ch.repeat(bSize);
      }
      for (let dy = 0; dy < bSize; dy++) out.push(blockRows[dy]);
    }
    return out;
  }

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.round(rect.width);
    if (cssSize <= 0 || cssSize === lastSize) return cssSize > 0;
    lastSize = cssSize;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function drawFrame(now: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx || lastSize <= 0) return;
    const size = lastSize;
    const cell = Math.floor(size / 32);
    const gridPx = cell * 32;
    const ox = Math.floor((size - gridPx) / 2);
    const oy = Math.floor((size - gridPx) / 2);

    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, size, size);

    let assembleLimit = fgIndices.length;
    if (!assembled) {
      const p = Math.min(1, Math.max(0, (now - assembleStart) / 640));
      assembleLimit = Math.floor(p * fgIndices.length);
      if (p >= 1) assembled = true;
    }

    let waveElapsed = -1, waveDone = true;
    if (waveDir !== 0) {
      waveElapsed = now - waveStart;
      if (waveElapsed < 360) waveDone = false;
      else { swapped = waveDir === 1; waveDir = 0; }
    }

    let sweepElapsed = -1, sweepDone = true;
    if (sweepActive) {
      sweepElapsed = now - sweepStart;
      if (sweepElapsed < 200) sweepDone = false;
      else sweepActive = false;
    }

    for (let y = 0; y < 32; y++) {
      let runStart = 0, runIdx = -1;
      for (let x = 0; x <= 32; x++) {
        let idx = 0;
        if (x < 32) {
          const useOld = sweepActive && !sweepDone && ((x + y) / 62) * 200 > sweepElapsed;
          const srcGrid = useOld ? prevGrid : currentGrid;
          const raw = Number(srcGrid[y][x]) || 0;
          if (!assembled && raw !== 0) {
            idx = orderRank[y * 32 + x] < assembleLimit ? raw : 0;
          } else idx = raw;
          let isSwapped = swapped;
          if (waveDir !== 0) {
            const threshold = ((x + y) / 62) * 360;
            isSwapped = waveDir === 1 ? waveElapsed >= threshold : waveElapsed < threshold;
          }
          if (isSwapped && (idx === 0 || idx === 1)) idx = idx === 0 ? 1 : 0;
        }
        if (x === 0) {
          runIdx = idx; runStart = 0;
        } else if (x === 32 || idx !== runIdx) {
          if (runIdx !== 0 || swapped || waveDir !== 0) {
            ctx.fillStyle = pal[runIdx];
            ctx.fillRect(ox + runStart * cell, oy + y * cell, (x - runStart) * cell, cell);
          }
          runStart = x; runIdx = idx;
        }
      }
    }

    if (assembled && waveDone && sweepDone) {
      animActive = false;
      motion.remove(drawFrame);
    }
  }

  function startAnim() {
    if (!animActive) { animActive = true; motion.add(drawFrame); }
  }

  function renderImmediate() {
    if (sizeCanvas()) drawFrame(performance.now());
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        io.disconnect();
        sizeCanvas();
        if (!state.motionOn || o.skipAssemble) {
          assembled = true;
          drawFrame(performance.now());
        } else {
          assembled = false;
          assembleStart = performance.now();
          startAnim();
        }
      }
    }
  }, { threshold: 0.3 });
  io.observe(canvas);

  let rTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(rTimer);
    rTimer = window.setTimeout(() => {
      const prev = lastSize;
      sizeCanvas();
      if (lastSize !== prev) drawFrame(performance.now());
    }, 150);
  });
  ro.observe(canvas);

  const hoverTarget = canvas.closest("a") || canvas;
  if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    const triggerSwap = (toSwapped: boolean) => {
      if (!state.motionOn) {
        swapped = toSwapped; waveDir = 0; drawFrame(performance.now()); return;
      }
      waveDir = toSwapped ? 1 : -1;
      waveStart = performance.now();
      startAnim();
    };
    hoverTarget.addEventListener("mouseenter", () => triggerSwap(true));
    hoverTarget.addEventListener("mouseleave", () => triggerSwap(false));
    hoverTarget.addEventListener("focusin", () => triggerSwap(true));
    hoverTarget.addEventListener("focusout", () => triggerSwap(false));
  }

  const onMotionChange = () => {
    if (!state.motionOn) {
      assembled = true; sweepActive = false; waveDir = 0; swapped = false;
      renderImmediate();
    }
  };
  window.addEventListener("kkachi:motionchange", onMotionChange);

  state.routeCleanup.push(() => {
    io.disconnect();
    ro.disconnect();
    window.clearTimeout(rTimer);
    motion.remove(drawFrame);
    window.removeEventListener("kkachi:motionchange", onMotionChange);
  });

  window.requestAnimationFrame(renderImmediate);

  return {
    setBlockSize(newSize: number) {
      if (newSize === blockSize) return;
      prevGrid = currentGrid;
      blockSize = newSize;
      currentGrid = poolGrid(rows, blockSize);
      if (!state.motionOn) {
        sweepActive = false; drawFrame(performance.now());
      } else {
        sweepActive = true; sweepStart = performance.now(); startAnim();
      }
    }
  };
}

// Capacity Grid Component
export function buildCapacityGrid(container: HTMLElement, opts?: { withSelection?: boolean; instant?: boolean }) {
  const o = opts || {};
  const t1 = DATA.tickets[0];
  const t2 = DATA.tickets[1];
  const t3 = DATA.tickets[2];
  const total = DATA.meta.capacity;
  const isMobile = window.innerWidth < 768;
  const cols = isMobile ? 20 : 40;
  const rows = Math.ceil(total / cols);
  const gap = window.innerWidth >= 1024 ? 2 : 1;
  const cell = 10;
  const step = cell + gap;
  const vbW = cols * step - gap;
  const vbH = rows * step - gap;

  const cellsMeta: Array<{ idx: number; tier: string; color: string; label: string }> = [];
  for (let i = 0; i < total; i++) {
    let tier = "open";
    let color = DATA.tokens.sodium;
    let label = `Seat ${i + 1} of ${total} · 참여 가능 Open`;
    if (i < t1.sold) {
      tier = "free"; color = t1.color;
      label = `Seat ${i + 1} of ${total} · Community Free`;
    } else if (i < t1.sold + t2.sold) {
      tier = "supporter"; color = t2.color;
      label = `Seat ${i + 1} of ${total} · Pop Supporter`;
    } else if (i < t1.sold + t2.sold + t3.sold) {
      tier = "creator"; color = t3.color;
      label = `Seat ${i + 1} of ${total} · Host Creator`;
    }
    cellsMeta.push({ idx: i, tier, color, label });
  }

  const soldTotal = t1.sold + t2.sold + t3.sold;
  const openTotal = total - soldTotal;

  let rects = "";
  for (let i = 0; i < total; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = c * step;
    const y = r * step;
    const m = cellsMeta[i];
    if (m.tier === "open") {
      rects += `<rect data-ci="${i}" x="${x + 0.5}" y="${y + 0.5}" width="${cell - 1}" height="${cell - 1}" fill="${DATA.tokens.sodium}" stroke="${DATA.tokens.ink}" stroke-width="1"/>`;
    } else {
      rects += `<rect data-ci="${i}" x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${DATA.tokens.sodium}" stroke="${DATA.tokens.ink}" stroke-width="1"/>`;
    }
  }

  container.innerHTML = `
    <figure class="capacity-fig">
      <div class="capacity-svg-wrap" tabindex="0" role="img" aria-label="Capacity grid: ${soldTotal} of ${total} passes claimed, ${openTotal} open.">
        <svg class="capacity-svg" viewBox="0 0 ${vbW} ${vbH}" shape-rendering="crispEdges" aria-hidden="true">${rects}<rect id="cap-focus-ring" x="0" y="0" width="${cell}" height="${cell}" fill="none" stroke="${DATA.tokens.ink}" stroke-width="2" visibility="hidden"/></svg>
      </div>
      <figcaption class="t-micro" style="margin-top:8px;">(Fig. 1 — 실시간 커뮤니티 정원 ${total}석 · Live Capacity Grid)</figcaption>
      <ul class="capacity-legend t-micro">
        <li class="legend-item"><span class="legend-swatch" style="background:${t1.color}"></span>Community Free (${t1.sold})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${t2.color}"></span>Pop Supporter (${t2.sold})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${t3.color}"></span>Host Creator (${t3.sold})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${DATA.tokens.sodium}"></span>참여 가능 Open (${openTotal})</li>
        ${o.withSelection ? `<li class="legend-item"><span class="legend-swatch" style="background:${DATA.tokens.ink}"></span>내 선택 Selected</li>` : ""}
      </ul>
    </figure>
  `;

  const svg = container.querySelector(".capacity-svg") as SVGSVGElement;
  const wrap = container.querySelector(".capacity-svg-wrap") as HTMLElement;
  const focusRing = svg.querySelector("#cap-focus-ring") as SVGRectElement;
  const rectEls = Array.from(svg.querySelectorAll("rect[data-ci]"));
  let filledCount = 0;
  let selectedOverlay = 0;

  function paintCell(i: number, isSelected: boolean) {
    const m = cellsMeta[i];
    const el = rectEls[i];
    if (!el) return;
    if (isSelected) {
      el.setAttribute("fill", DATA.tokens.ink);
      el.removeAttribute("stroke");
    } else if (m.tier === "open" || i >= filledCount) {
      el.setAttribute("fill", DATA.tokens.sodium);
      el.setAttribute("stroke", DATA.tokens.ink);
      el.setAttribute("stroke-width", "1");
    } else {
      el.setAttribute("fill", m.color);
      el.setAttribute("stroke", DATA.tokens.ink);
      el.setAttribute("stroke-width", "0.4");
    }
  }

  function fillImmediate() {
    filledCount = soldTotal;
    for (let i = 0; i < soldTotal; i++) paintCell(i, false);
    for (let i = soldTotal; i < total; i++) paintCell(i, i - soldTotal < selectedOverlay);
  }

  let fillAnimRunning = false;
  function tickFill() {
    const nextEnd = Math.min(soldTotal, filledCount + 6);
    for (let i = filledCount; i < nextEnd; i++) {
      filledCount = i + 1;
      paintCell(i, false);
    }
    if (filledCount >= soldTotal) {
      fillAnimRunning = false;
      motion.remove(tickFill);
    }
  }

  if (!state.motionOn || o.instant) {
    fillImmediate();
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.disconnect();
          if (!state.motionOn) fillImmediate();
          else if (!fillAnimRunning) { fillAnimRunning = true; motion.add(tickFill); }
        }
      }
    }, { threshold: 0.3 });
    io.observe(svg);
    state.routeCleanup.push(() => { io.disconnect(); motion.remove(tickFill); });
  }

  svg.addEventListener("pointermove", (e) => {
    const rectEl = (e.target as Element).closest("rect[data-ci]") as SVGRectElement | null;
    if (!rectEl) { hideTip(); return; }
    const idx = Number(rectEl.dataset.ci);
    const isSel = idx >= soldTotal && (idx - soldTotal) < selectedOverlay;
    const msg = isSel ? `Seat ${idx + 1} of ${total} · Selected` : cellsMeta[idx].label;
    showTip(rectEl.getBoundingClientRect(), msg, false);
  });
  svg.addEventListener("pointerleave", hideTip);

  let keyIdx = 0;
  const showKeyCell = () => {
    const c = keyIdx % cols;
    const r = Math.floor(keyIdx / cols);
    focusRing.setAttribute("x", String(c * step - 1));
    focusRing.setAttribute("y", String(r * step - 1));
    focusRing.setAttribute("width", String(cell + 2));
    focusRing.setAttribute("height", String(cell + 2));
    focusRing.setAttribute("visibility", "visible");
    const isSel = keyIdx >= soldTotal && (keyIdx - soldTotal) < selectedOverlay;
    showTip(rectEls[keyIdx].getBoundingClientRect(), isSel ? `Seat ${keyIdx + 1} · Selected` : cellsMeta[keyIdx].label, true);
  };

  wrap.addEventListener("focus", showKeyCell);
  wrap.addEventListener("blur", () => { focusRing.setAttribute("visibility", "hidden"); hideTip(); });
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") keyIdx = Math.min(total - 1, keyIdx + 1);
    else if (e.key === "ArrowLeft") keyIdx = Math.max(0, keyIdx - 1);
    else if (e.key === "ArrowDown") keyIdx = Math.min(total - 1, keyIdx + cols);
    else if (e.key === "ArrowUp") keyIdx = Math.max(0, keyIdx - cols);
    else return;
    e.preventDefault();
    showKeyCell();
  });

  let selTimer = 0;
  return {
    setSelected(count: number) {
      window.clearInterval(selTimer);
      if (!state.motionOn) {
        selectedOverlay = count;
        for (let i = soldTotal; i < total; i++) paintCell(i, i - soldTotal < selectedOverlay);
        return;
      }
      if (count === selectedOverlay) return;
      selTimer = window.setInterval(() => {
        if (selectedOverlay < count) {
          selectedOverlay++; paintCell(soldTotal + selectedOverlay - 1, true);
        } else if (selectedOverlay > count) {
          paintCell(soldTotal + selectedOverlay - 1, false); selectedOverlay--;
        }
        if (selectedOverlay === count) window.clearInterval(selTimer);
      }, 30);
    }
  };
}
