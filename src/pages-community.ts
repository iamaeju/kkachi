import { DATA, type FeedPostItem } from "./data";
import { subscribeLiveMeetups } from "./firebase-kkachi";
import {
  BADGE_PALETTE,
  TRAIL_COLORS,
  buildCapacityGrid,
  dayById,
  esc,
  fmtTime,
  hasClash,
  hideTip,
  initPortraitCanvas,
  makeRng,
  normText,
  roomById,
  sessionById,
  sessionsByDay,
  sessionsBySpeaker,
  showTip,
  speakerById,
  state,
  storageSet,
  svgBitmapText,
  svgPixelIcon,
  svgStrike,
  timeToMin,
  toggleAgenda,
  trackById
} from "./helpers";
import { initPosterWall } from "./pages-home";

// POP MEETING (#/pop-meeting)
export function renderPopMeeting(main: HTMLElement): void {
  document.title = "POP MEETING" + DATA.copy.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="POP MEETING">
      <div class="grid">
        <p class="col-1-3 t-micro">(POP MEETING)</p>
        <div class="col-5-12">
          <h1 class="t-h1" tabindex="-1">${esc(DATA.copy.scheduleTitle)}</h1>
          <p class="t-body" style="margin-top:16px;">${esc(DATA.copy.scheduleLead)}</p>
          <div style="margin-top:16px;">
            <a class="btn-text t-small u-anim" href="#/talks">(전체 모임 키워드 검색하기 · Search All Directory)</a>
          </div>
        </div>
      </div>
      <div class="schedule-controls" id="sched-controls">
        <div class="grid">
          <div class="col-full schedule-controls-inner">
            <div class="day-tabs" role="tablist" aria-label="Pop-Meeting days" id="sched-day-tabs">
              ${DATA.days.map((d) => `
                <button type="button" class="day-tab t-small" role="tab" id="tab-${esc(d.id)}" aria-selected="${state.filters.day === d.id ? "true" : "false"}" tabindex="${state.filters.day === d.id ? "0" : "-1"}" data-day="${esc(d.id)}">${esc(d.shortLabel)}</button>
              `).join("")}
            </div>
            <div class="track-toggles-wrap" id="sched-track-toggles">
              ${DATA.tracks.map((t) => {
                const pressed = state.filters.tracks.includes(t.id);
                return `<button type="button" class="chip-toggle t-small" data-track="${esc(t.id)}" aria-pressed="${pressed ? "true" : "false"}">
                  <svg width="10" height="10" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="0" width="10" height="10" fill="${DATA.tokens.ink}"/><rect x="1" y="1" width="8" height="8" fill="${t.chipBg}"/></svg>
                  (${esc(t.label.split("·")[0].trim())})
                </button>`;
              }).join("")}
            </div>
            <button type="button" class="chip-toggle t-small" id="sched-agenda-btn" aria-pressed="${state.filters.agendaOnly ? "true" : "false"}">(내 찜 모임 · My List)</button>
            <div class="seg-group" role="group" aria-label="Schedule view">
              <button type="button" class="chip-toggle t-small" id="view-timeline-btn" aria-pressed="${state.filters.view === "timeline" ? "true" : "false"}">(Timeline)</button>
              <button type="button" class="chip-toggle t-small" id="view-table-btn" aria-pressed="${state.filters.view === "table" ? "true" : "false"}">(Table)</button>
            </div>
            <button type="button" class="btn-text t-micro u-anim" id="sched-ics-btn">(Download .ics)</button>
          </div>
        </div>
      </div>
      <div class="grid">
        <p class="col-full t-micro schedule-live-count" id="sched-count" aria-live="polite"></p>
        <div class="col-full" id="sched-body"></div>
      </div>
    </section>
  `;

  const updateScrollPad = () => {
    const hh = window.innerWidth >= 768 ? 64 : 56;
    const ctrl = document.getElementById("sched-controls");
    const ch = ctrl ? ctrl.getBoundingClientRect().height : 60;
    document.documentElement.style.scrollPaddingTop = `${Math.round(hh + ch + 16)}px`;
  };
  updateScrollPad();
  window.addEventListener("resize", updateScrollPad, { passive: true });
  state.routeCleanup.push(() => {
    window.removeEventListener("resize", updateScrollPad);
    document.documentElement.style.scrollPaddingTop = "80px";
  });

  const dayTabs = Array.from(document.querySelectorAll("#sched-day-tabs .day-tab"));
  const trackBtns = Array.from(document.querySelectorAll("#sched-track-toggles .chip-toggle"));
  const agendaBtn = document.getElementById("sched-agenda-btn")!;
  const tlBtn = document.getElementById("view-timeline-btn")!;
  const tblBtn = document.getElementById("view-table-btn")!;
  const icsBtn = document.getElementById("sched-ics-btn")!;
  const countEl = document.getElementById("sched-count")!;
  const bodyEl = document.getElementById("sched-body")!;

  function getFilteredSessions() {
    const dayAll = sessionsByDay(state.filters.day);
    const filtered = dayAll.filter((s) => {
      if (state.filters.tracks.length > 0 && !state.filters.tracks.includes(s.track)) return false;
      if (state.filters.agendaOnly && !state.agenda.includes(s.id)) return false;
      return true;
    });
    return { dayAll, filtered: filtered.sort((a, b) => timeToMin(a.start) - timeToMin(b.start)) };
  }

  function renderScheduleBody(animateEntrance: boolean) {
    const dayObj = dayById(state.filters.day);
    const { dayAll, filtered } = getFilteredSessions();
    const breaks = DATA.breaks.filter((b) => b.day === state.filters.day);
    countEl.textContent = `${filtered.length} / ${dayAll.length} 팝미팅 표시 중 · ${filtered.length} of ${dayAll.length} pop-meetings shown`;

    if (filtered.length === 0) {
      const msg = state.filters.agendaOnly && state.agenda.length === 0
        ? "찜한 팝미팅이 없습니다. 모임 카드의 + 버튼을 눌러 추가해 보세요. / Your pop-list is empty."
        : "선택한 필터 조건에 해당하는 팝미팅이 없습니다. / Nothing matches these filters.";
      bodyEl.innerHTML = `
        <div class="schedule-empty">
          <p class="t-lead">${esc(msg)}</p>
          <button type="button" class="btn-text t-small u-anim" id="sched-clear-btn">(필터 초기화 · Clear filters)</button>
        </div>
      `;
      document.getElementById("sched-clear-btn")?.addEventListener("click", () => {
        state.filters.tracks = [];
        state.filters.agendaOnly = false;
        storageSet("kkachi.filters", state.filters);
        trackBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
        agendaBtn.setAttribute("aria-pressed", "false");
        renderScheduleBody(false);
      });
      return;
    }

    if (state.filters.view === "table") {
      const items: Array<{ kind: "session" | "break"; start: string; rec: any }> = [];
      filtered.forEach((s) => items.push({ kind: "session", start: s.start, rec: s }));
      breaks.forEach((b) => items.push({ kind: "break", start: b.start, rec: b }));
      items.sort((a, b) => timeToMin(a.start) - timeToMin(b.start));

      bodyEl.innerHTML = `
        <table class="data-table responsive-table">
          <caption class="t-micro">${esc(dayObj.fullLabel)}, ${items.length} items</caption>
          <thead>
            <tr>
              <th class="t-micro">Time</th><th class="t-micro">Spot</th><th class="t-micro">Type</th>
              <th class="t-micro">Title</th><th class="t-micro">Host</th><th class="t-micro">Mood</th><th class="t-micro">Save</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it) => {
              if (it.kind === "break") {
                const b = it.rec;
                const r = roomById(b.room);
                return `<tr>
                  <td data-label="Time" class="t-small tnum">${fmtTime(b.start)}–${fmtTime(b.end)}</td>
                  <td data-label="Spot" class="t-small">${esc(r.name)}</td>
                  <td data-label="Type" class="t-small">Lounge</td>
                  <td data-label="Title" class="t-small">${esc(b.title)}</td>
                  <td data-label="Host" class="t-small">—</td><td data-label="Mood" class="t-small">—</td><td data-label="Save" class="t-small">—</td>
                </tr>`;
              }
              const s = it.rec;
              const r = roomById(s.room);
              const tr = trackById(s.track);
              const added = state.agenda.includes(s.id);
              const clash = hasClash(s);
              const spks = s.speakers.map((id: string) => `<a class="u-anim" href="#/feed/${esc(id)}">${esc(speakerById(id).name)}</a>`).join(", ");
              return `<tr>
                <td data-label="Time" class="t-small tnum">${fmtTime(s.start)}–${fmtTime(s.end)}</td>
                <td data-label="Spot" class="t-small">${esc(r.name)}</td>
                <td data-label="Type" class="t-small">${esc(s.type)}</td>
                <td data-label="Title" class="t-small fw-600"><a class="u-anim" href="#/talks/${esc(s.id)}">${esc(s.title)}</a>${clash ? ` <span class="clash-chip t-micro">시간 중복 Clash</span>` : ""}</td>
                <td data-label="Host" class="t-small">${spks}</td>
                <td data-label="Mood" class="t-small"><span class="track-chip track-chip-${esc(s.track)}">${esc(tr.label.split("·")[0].trim())}</span></td>
                <td data-label="Save" class="t-small">
                  <button type="button" class="tl-agenda-btn" data-ag="${esc(s.id)}" aria-pressed="${added ? "true" : "false"}" aria-label="Toggle save">${svgPixelIcon(added ? "check" : "plus", 14)}</button>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      `;
    } else if (window.innerWidth < 768) {
      const items: Array<{ kind: "session" | "break"; start: string; rec: any }> = [];
      filtered.forEach((s) => items.push({ kind: "session", start: s.start, rec: s }));
      breaks.forEach((b) => items.push({ kind: "break", start: b.start, rec: b }));
      items.sort((a, b) => timeToMin(a.start) - timeToMin(b.start));

      bodyEl.innerHTML = `<div class="schedule-mobile-list">
        ${items.map((it, idx) => {
          if (it.kind === "break") {
            const b = it.rec;
            const r = roomById(b.room);
            return `<div class="tl-break t-micro"><span>${fmtTime(b.start)}–${fmtTime(b.end)} · ${esc(b.title)}</span><span>${esc(r.name)}</span></div>`;
          }
          const s = it.rec;
          const r = roomById(s.room);
          const added = state.agenda.includes(s.id);
          const clash = hasClash(s);
          const spks = s.speakers.map((id: string) => speakerById(id).name).join(", ");
          const stagger = animateEntrance && state.motionOn ? ` style="transition-delay:${Math.min(idx, 7) * 40}ms"` : "";
          return `<article class="tl-session${added ? " is-added" : ""}${clash ? " is-clash" : ""}" data-track="${esc(s.track)}" data-sid="${esc(s.id)}"${stagger}>
            <div class="tl-session-top">
              <div>
                <div class="t-micro tnum">${fmtTime(s.start)}–${fmtTime(s.end)} · ${esc(s.type)} · ${esc(r.name)}</div>
                <h2 class="t-small fw-600" style="margin-top:4px;">${esc(s.title)}</h2>
                <div class="t-micro" style="margin-top:4px;">${esc(spks)}</div>
                ${clash ? `<div style="margin-top:6px;"><span class="clash-chip t-micro">Clash</span></div>` : ""}
              </div>
              <button type="button" class="tl-agenda-btn" data-ag="${esc(s.id)}" aria-pressed="${added ? "true" : "false"}">${svgPixelIcon(added ? "check" : "plus", 14)}</button>
            </div>
          </article>`;
        }).join("")}
      </div>`;
    } else {
      let hourMarks = "";
      for (let h = 9; h <= 22; h++) {
        const row = (h - 9) * 4 + 2;
        hourMarks += `<div class="tl-hour-line" style="grid-row:${row};"></div>`;
        hourMarks += `<div class="tl-hour-label t-micro tnum" style="grid-row:${row} / ${row + 2};">${String(h).padStart(2, "0")}.00</div>`;
      }
      const breakBlocks = breaks.map((b) => {
        const rStart = Math.round((timeToMin(b.start) - 540) / 15) + 2;
        const rEnd = Math.round((timeToMin(b.end) - 540) / 15) + 2;
        const rm = roomById(b.room);
        return `<div class="tl-break t-micro" style="grid-row:${rStart} / ${rEnd};">
          <span>${fmtTime(b.start)}–${fmtTime(b.end)} · ${esc(b.title)}</span><span>${esc(rm.name)}</span>
        </div>`;
      }).join("");

      const sessBlocks = filtered.map((s) => {
        const rStart = Math.round((timeToMin(s.start) - 540) / 15) + 2;
        const rEnd = Math.round((timeToMin(s.end) - 540) / 15) + 2;
        const col = (s.room === "seongsu" || s.room === "hannam") ? 2 : 3;
        const added = state.agenda.includes(s.id);
        const clash = hasClash(s);
        const spks = s.speakers.map((id) => speakerById(id).name).join(", ");
        return `<article class="tl-session${added ? " is-added" : ""}${clash ? " is-clash" : ""}" data-track="${esc(s.track)}" data-sid="${esc(s.id)}" style="grid-column:${col};grid-row:${rStart} / ${rEnd};">
          <div class="tl-session-top">
            <div>
              <div class="t-micro tnum">${fmtTime(s.start)}–${fmtTime(s.end)} · ${esc(roomById(s.room).name.split("·")[0].trim())}</div>
              <h2 class="t-small fw-600" style="margin-top:2px;">${esc(s.title)}</h2>
              <div class="t-micro" style="margin-top:2px;">${esc(spks)}</div>
            </div>
            <button type="button" class="tl-agenda-btn" data-ag="${esc(s.id)}" aria-pressed="${added ? "true" : "false"}">${svgPixelIcon(added ? "check" : "plus", 14)}</button>
          </div>
          ${clash ? `<div><span class="clash-chip t-micro">시간 중복 Clash</span></div>` : ""}
        </article>`;
      }).join("");

      bodyEl.innerHTML = `
        <div class="timeline-grid">
          <div class="tl-room-head t-micro" style="grid-column:1;">Time</div>
          <div class="tl-room-head t-micro" style="grid-column:2;">성수 Hub / 한남 Yard</div>
          <div class="tl-room-head t-micro" style="grid-column:3;">연남 Loft / 을지로 Roof / Quiet</div>
          ${hourMarks}
          ${breakBlocks}
          ${sessBlocks}
        </div>
      `;
    }

    bodyEl.querySelectorAll("[data-ag]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleAgenda((btn as HTMLElement).dataset.ag!);
        renderScheduleBody(false);
      });
    });
    bodyEl.querySelectorAll(".tl-session[data-sid]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if ((e.target as Element).closest("[data-ag]")) return;
        window.location.hash = `#/talks/${(card as HTMLElement).dataset.sid}`;
      });
      card.addEventListener("pointerenter", () => {
        if (card.scrollHeight > card.clientHeight + 2) {
          const s = sessionById((card as HTMLElement).dataset.sid!);
          if (s) showTip(card.getBoundingClientRect(), `${fmtTime(s.start)}–${fmtTime(s.end)} · ${s.title}`, false);
        }
      });
      card.addEventListener("pointerleave", hideTip);
    });
  }

  function selectDay(dayId: string, moveFocus: boolean) {
    state.filters.day = dayId;
    storageSet("kkachi.filters", state.filters);
    dayTabs.forEach((t) => {
      const active = (t as HTMLElement).dataset.day === dayId;
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.setAttribute("tabindex", active ? "0" : "-1");
      if (active && moveFocus) (t as HTMLElement).focus();
    });
    renderScheduleBody(true);
  }

  dayTabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => selectDay((tab as HTMLElement).dataset.day!, false));
    tab.addEventListener("keydown", (e) => {
      const ke = e as KeyboardEvent;
      let nextIdx = -1;
      if (ke.key === "ArrowRight") nextIdx = (idx + 1) % dayTabs.length;
      else if (ke.key === "ArrowLeft") nextIdx = (idx - 1 + dayTabs.length) % dayTabs.length;
      if (nextIdx >= 0) { ke.preventDefault(); selectDay((dayTabs[nextIdx] as HTMLElement).dataset.day!, true); }
    });
  });

  trackBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tid = (btn as HTMLElement).dataset.track!;
      const i = state.filters.tracks.indexOf(tid);
      if (i === -1) state.filters.tracks.push(tid); else state.filters.tracks.splice(i, 1);
      btn.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      storageSet("kkachi.filters", state.filters);
      renderScheduleBody(false);
    });
  });

  agendaBtn.addEventListener("click", () => {
    state.filters.agendaOnly = !state.filters.agendaOnly;
    agendaBtn.setAttribute("aria-pressed", state.filters.agendaOnly ? "true" : "false");
    storageSet("kkachi.filters", state.filters);
    renderScheduleBody(false);
  });

  const setView = (v: string) => {
    state.filters.view = v;
    tlBtn.setAttribute("aria-pressed", v === "timeline" ? "true" : "false");
    tblBtn.setAttribute("aria-pressed", v === "table" ? "true" : "false");
    storageSet("kkachi.filters", state.filters);
    renderScheduleBody(false);
  };
  tlBtn.addEventListener("click", () => setView("timeline"));
  tblBtn.addEventListener("click", () => setView("table"));

  icsBtn.addEventListener("click", () => {
    const exportSessions = state.agenda.length > 0
      ? state.agenda.map((id) => sessionById(id)).filter((x): x is NonNullable<typeof x> => Boolean(x))
      : getFilteredSessions().filtered;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//KKACHI//POPMEETING//KO"];
    exportSessions.forEach((s) => {
      const d = dayById(s.day);
      const rm = roomById(s.room);
      const ymd = d.date.replace(/-/g, "");
      const toUtc = (hhmm: string) => {
        const [hh, mm] = hhmm.split(":").map(Number);
        return String(Math.max(0, hh - 9)).padStart(2, "0") + String(mm).padStart(2, "0") + "00Z";
      };
      lines.push("BEGIN:VEVENT", `UID:${s.id}@kkachi.app`, "DTSTAMP:20270501T000000Z", `DTSTART:${ymd}T${toUtc(s.start)}`, `DTEND:${ymd}T${toUtc(s.end)}`, `SUMMARY:${s.title}`, `LOCATION:${rm.name}, Seoul`, `DESCRIPTION:${s.abstract}`, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl; a.download = "kkachi-pop-meeting.ics";
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  });

  const onResize = () => renderScheduleBody(false);
  window.addEventListener("resize", onResize, { passive: true });
  state.routeCleanup.push(() => window.removeEventListener("resize", onResize));
  renderScheduleBody(true);
}

function feedAvatarSvg(kind: FeedPostItem["avatarKind"]): string {
  const ink = DATA.tokens.ink;
  const vivid = DATA.tokens.vivid;
  const sodium = DATA.tokens.sodium;
  if (kind === "coffee") {
    return `<svg width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="4" y="2" width="1" height="3" fill="${ink}"/>
      <rect x="7" y="1" width="1" height="4" fill="${ink}"/>
      <rect x="10" y="2" width="1" height="3" fill="${ink}"/>
      <rect x="3" y="6" width="8" height="6" fill="${ink}"/>
      <rect x="4" y="7" width="6" height="4" fill="${vivid}"/>
      <rect x="11" y="7" width="2" height="4" fill="${ink}"/>
      <rect x="2" y="13" width="10" height="1" fill="${ink}"/>
    </svg>`;
  }
  if (kind === "dog") {
    return `<svg width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="2" y="3" width="3" height="6" fill="${ink}"/>
      <rect x="11" y="3" width="3" height="6" fill="${ink}"/>
      <rect x="4" y="4" width="8" height="8" fill="${sodium}" stroke="${ink}" stroke-width="1"/>
      <rect x="5" y="7" width="2" height="2" fill="${ink}"/>
      <rect x="9" y="7" width="2" height="2" fill="${ink}"/>
      <rect x="7" y="9" width="2" height="2" fill="${ink}"/>
    </svg>`;
  }
  if (kind === "riso") {
    return `<svg width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" fill="${vivid}" stroke="${ink}" stroke-width="1"/>
      <rect x="4" y="4" width="4" height="4" fill="${ink}"/>
      <rect x="8" y="8" width="4" height="4" fill="${ink}"/>
    </svg>`;
  }
  if (kind === "vinyl") {
    return `<svg width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" fill="${ink}"/>
      <rect x="4" y="4" width="8" height="8" fill="${DATA.tokens.mid}"/>
      <rect x="6" y="6" width="4" height="4" fill="${vivid}"/>
      <rect x="7" y="7" width="2" height="2" fill="${ink}"/>
    </svg>`;
  }
  return `<svg width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">
    <rect x="7" y="2" width="2" height="12" fill="${ink}"/>
    <rect x="2" y="7" width="12" height="2" fill="${ink}"/>
    <rect x="4" y="4" width="8" height="8" fill="${vivid}" stroke="${ink}" stroke-width="1"/>
  </svg>`;
}

function feedMediaSvg(post: FeedPostItem): string {
  const { ink, paper, vivid, sodium, soft, pale, mid, olive, deep } = DATA.tokens;
  if (post.mediaKind === "drip") {
    return `<svg viewBox="0 0 400 300" shape-rendering="crispEdges" aria-label="${esc(post.author)} 현장 이미지">
      <rect width="400" height="300" fill="${olive}"/>
      <rect x="24" y="24" width="352" height="252" fill="${mid}" stroke="${ink}" stroke-width="2"/>
      <rect x="48" y="196" width="304" height="80" fill="${pale}" stroke="${ink}" stroke-width="2"/>
      <rect x="148" y="108" width="104" height="88" fill="${paper}" stroke="${ink}" stroke-width="3"/>
      <rect x="252" y="124" width="28" height="52" fill="none" stroke="${ink}" stroke-width="6"/>
      <rect x="160" y="120" width="80" height="64" fill="${deep}"/>
      <rect x="172" y="132" width="56" height="24" fill="${vivid}"/>
      <rect x="184" y="56" width="8" height="34" fill="${vivid}"/>
      <rect x="208" y="44" width="8" height="46" fill="${pale}"/>
      <rect x="64" y="218" width="110" height="16" fill="${ink}"/>
      <rect x="64" y="242" width="70" height="12" fill="${olive}"/>
      <rect x="280" y="48" width="64" height="64" fill="${sodium}" stroke="${ink}" stroke-width="2"/>
      <rect x="296" y="64" width="32" height="32" fill="${ink}"/>
    </svg>`;
  }
  if (post.mediaKind === "walk") {
    return `<svg viewBox="0 0 400 300" shape-rendering="crispEdges" aria-label="${esc(post.author)} 현장 이미지">
      <rect width="400" height="300" fill="${soft}"/>
      <rect x="0" y="210" width="400" height="90" fill="${mid}"/>
      <rect x="40" y="70" width="80" height="140" fill="${olive}" stroke="${ink}" stroke-width="2"/>
      <rect x="72" y="170" width="16" height="40" fill="${ink}"/>
      <rect x="280" y="50" width="90" height="160" fill="${deep}" stroke="${ink}" stroke-width="2"/>
      <rect x="316" y="170" width="18" height="40" fill="${ink}"/>
      <rect x="160" y="140" width="76" height="56" fill="${vivid}" stroke="${ink}" stroke-width="3"/>
      <rect x="148" y="120" width="36" height="36" fill="${sodium}" stroke="${ink}" stroke-width="3"/>
      <rect x="156" y="130" width="8" height="8" fill="${ink}"/>
      <rect x="236" y="152" width="18" height="12" fill="${ink}"/>
      <rect x="168" y="196" width="14" height="26" fill="${ink}"/>
      <rect x="214" y="196" width="14" height="26" fill="${ink}"/>
      <rect x="290" y="228" width="80" height="18" fill="${ink}"/>
    </svg>`;
  }
  if (post.mediaKind === "riso") {
    let tiles = "";
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 8; c++) {
        const bg = (r + c) % 3 === 0 ? vivid : (r + c) % 3 === 1 ? pale : ink;
        tiles += `<rect x="${24 + c * 44}" y="${24 + r * 42}" width="40" height="38" fill="${bg}" stroke="${ink}" stroke-width="1"/>`;
      }
    }
    return `<svg viewBox="0 0 400 300" shape-rendering="crispEdges" aria-label="${esc(post.author)} 현장 이미지">
      <rect width="400" height="300" fill="${paper}"/>
      ${tiles}
      <rect x="96" y="88" width="208" height="124" fill="${paper}" stroke="${ink}" stroke-width="4"/>
      <rect x="114" y="106" width="172" height="44" fill="${sodium}" stroke="${ink}" stroke-width="2"/>
      <rect x="114" y="164" width="120" height="16" fill="${ink}"/>
      <rect x="114" y="186" width="84" height="10" fill="${olive}"/>
    </svg>`;
  }
  if (post.mediaKind === "vinyl") {
    return `<svg viewBox="0 0 400 300" shape-rendering="crispEdges" aria-label="${esc(post.author)} 현장 이미지">
      <rect width="400" height="300" fill="${deep}"/>
      <rect x="44" y="28" width="312" height="244" fill="${pale}" stroke="${ink}" stroke-width="3"/>
      <rect x="88" y="54" width="190" height="190" fill="${ink}"/>
      <rect x="112" y="78" width="142" height="142" fill="${olive}"/>
      <rect x="136" y="102" width="94" height="94" fill="${ink}"/>
      <rect x="158" y="124" width="50" height="50" fill="${vivid}"/>
      <rect x="178" y="144" width="10" height="10" fill="${ink}"/>
      <rect x="294" y="64" width="14" height="120" fill="${ink}"/>
      <rect x="278" y="176" width="24" height="16" fill="${vivid}" stroke="${ink}" stroke-width="2"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 400 300" shape-rendering="crispEdges" aria-label="${esc(post.author)} 현장 이미지">
    <rect width="400" height="300" fill="${sodium}"/>
    <rect x="32" y="32" width="336" height="236" fill="${pale}" stroke="${ink}" stroke-width="3"/>
    <rect x="64" y="64" width="120" height="120" fill="${vivid}" stroke="${ink}" stroke-width="2"/>
    <rect x="200" y="64" width="136" height="56" fill="${ink}"/>
    <rect x="200" y="136" width="136" height="48" fill="${mid}" stroke="${ink}" stroke-width="2"/>
    <rect x="64" y="204" width="272" height="32" fill="${olive}"/>
  </svg>`;
}

// FEED (#/feed)
export function renderFeed(main: HTMLElement): void {
  document.title = "FEED" + DATA.copy.siteTitleSuffix;
  const miniPalette = [DATA.tokens.vivid, DATA.tokens.soft, DATA.tokens.mid, DATA.tokens.sodium];
  const openComments = new Set<string>();
  let messageTargetAuthor = "";

  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="FEED">
      <div class="grid">
        <p class="col-1-3 t-micro">(FEED · 까치 로컬 커뮤니티)</p>
        <div class="col-5-12">
          <h1 class="t-h1" tabindex="-1">FEED · 까치 로컬 커뮤니티 피드</h1>
          <p class="t-body" style="margin-top:14px;">동네 팝미팅 현장 스케치와 호스트 소식을 피드로 만나보세요. 팔로우·좋아요·댓글·참여까지 바로 이어집니다. / Real-time local pop-meeting moments from KKACHI neighborhoods.</p>
        </div>
      </div>

      <div class="grid feed-layout-grid">
        <div class="col-1-8">
          <div class="feed-app-frame">
            <div class="feed-app-topbar">
              <div class="feed-app-brand">
                <img src="./assets/aistudio/kkachi_7b3a40bf.jpg" alt="까치 로고" width="28" height="28">
                <span class="t-lead fw-600">까치 로컬 커뮤니티</span>
              </div>
              <span class="t-micro tnum" id="feed-post-count"></span>
            </div>

            <div class="feed-filter-bar" id="feed-filter-bar">
              <button type="button" class="chip-toggle t-small" data-ftrack="all" aria-pressed="${state.feedTrackFilter === "all" ? "true" : "false"}">(전체 피드)</button>
              ${DATA.tracks.map((t) => `
                <button type="button" class="chip-toggle t-small" data-ftrack="${esc(t.id)}" aria-pressed="${state.feedTrackFilter === t.id ? "true" : "false"}">(${esc(t.label.split("·")[0].trim())})</button>
              `).join("")}
            </div>

            <div id="feed-stream"></div>
          </div>
        </div>

        <aside class="col-9-12 feed-sidebar-stack" aria-label="Feed composer and following">
          <div class="feed-sidebar-card">
            <p class="t-micro">(SHARE MOMENT · 새 피드 작성)</p>
            <h2 class="t-lead">방금 다녀온 팝미팅 남기기</h2>
            <div class="field-group">
              <label class="t-micro" for="feed-new-author">작성자 / 크루명</label>
              <input class="text-input" id="feed-new-author" type="text" maxlength="20" value="${esc(state.badge.name)}">
            </div>
            <div class="field-group">
              <label class="t-micro" for="feed-new-track">무드 선택</label>
              <select class="select-input t-small" id="feed-new-track">
                ${DATA.tracks.map((t) => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join("")}
              </select>
            </div>
            <div class="field-group">
              <label class="t-micro" for="feed-new-caption">피드 내용</label>
              <textarea class="feed-textarea" id="feed-new-caption" placeholder="오늘 모임에서 나눈 취향과 순간을 적어보세요!"></textarea>
            </div>
            <button type="button" class="btn-primary t-small" id="feed-submit-post"><span>피드 올리기 · Post</span></button>
          </div>

          <div class="feed-sidebar-card" data-surface="pale">
            <p class="t-micro">(FOLLOWING · 팔로우 중인 크루)</p>
            <div id="feed-following-list" class="t-small"></div>
            <div style="padding-top:12px;border-top:var(--rule);display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <a class="btn-text t-micro u-anim" href="#/pop-meeting">(POP MEETING 일정 →)</a>
              <a class="btn-text t-micro u-anim" href="#/profile">(배지 프로필 →)</a>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="sec" data-surface="paper" data-pager="Hosts">
      <div class="grid">
        <p class="col-1-3 t-micro">(CREW HOSTS · 10인의 호스트)</p>
        <div class="col-5-12">
          <h2 class="t-h2">${esc(DATA.copy.speakersLead)}</h2>
          <p class="t-body" style="margin-top:12px;">${esc(DATA.copy.speakersLeadPage)}</p>
          <div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
            <div class="track-toggles-wrap" id="spk-track-toggles">
              ${DATA.tracks.map((t) => {
                const pressed = state.speakersFilter.tracks.includes(t.id);
                return `<button type="button" class="chip-toggle t-small" data-track="${esc(t.id)}" aria-pressed="${pressed ? "true" : "false"}">
                  <svg width="10" height="10" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="0" width="10" height="10" fill="${DATA.tokens.ink}"/><rect x="1" y="1" width="8" height="8" fill="${t.chipBg}"/></svg>
                  (${esc(t.label.split("·")[0].trim())})
                </button>`;
              }).join("")}
            </div>
            <div class="seg-group" role="group" aria-label="Sort hosts">
              <button type="button" class="chip-toggle t-small" id="spk-sort-az" aria-pressed="${state.speakersFilter.sort === "az" ? "true" : "false"}">(A–Z)</button>
              <button type="button" class="chip-toggle t-small" id="spk-sort-day" aria-pressed="${state.speakersFilter.sort === "day" ? "true" : "false"}">(By day · 요일순)</button>
            </div>
          </div>
        </div>
        <div class="col-full" id="spk-grid-wrap"></div>
      </div>
    </section>

    <section class="sec" data-surface="sodium" data-pager="Poster Wall">
      <div class="grid">
        <p class="col-1-3 t-micro">(FEED GRAPHIC WALL)</p>
        <h2 class="col-5-12 t-h2">커뮤니티 포스터 타일을 눌러 채도·명도를 리믹스해 보세요 · Click any tile to cycle lime shades.</h2>
      </div>
      <div class="grid"><div class="col-full"><div class="poster-wall-wrap" id="poster-wall"></div></div></div>
    </section>

    <dialog class="raster-dialog" id="feed-msg-dialog" aria-labelledby="feed-msg-title">
      <h2 class="t-h2" id="feed-msg-title">메시지 보내기</h2>
      <p class="t-small" id="feed-msg-sub" style="margin-top:8px;"></p>
      <div class="field-group" style="margin-top:16px;">
        <label class="t-micro" for="feed-msg-input">메시지 내용</label>
        <textarea class="feed-textarea" id="feed-msg-input" placeholder="안녕하세요! 다음 팝미팅 일정이 궁금해요."></textarea>
      </div>
      <p class="t-micro" id="feed-msg-sent" style="margin-top:8px;color:var(--lime-deep);" hidden></p>
      <div style="margin-top:16px;display:flex;gap:12px;align-items:center;">
        <button type="button" class="btn-primary t-small" id="feed-msg-send"><span>전송 · Send</span></button>
        <button type="button" class="btn-text t-small u-anim" id="feed-msg-close">(Close · 닫기)</button>
      </div>
    </dialog>
  `;

  const streamEl = document.getElementById("feed-stream")!;
  const postCountEl = document.getElementById("feed-post-count")!;
  const followingEl = document.getElementById("feed-following-list")!;
  const filterBtns = Array.from(document.querySelectorAll("#feed-filter-bar [data-ftrack]"));

  // 까치 앱(Firestore)에서 지금 열려있는 실제 모임을 실시간으로 가져와 사이드바에 표시
  const liveSection = document.createElement("div");
  liveSection.className = "feed-sidebar-card";
  liveSection.innerHTML = `<p class="t-micro">(LIVE · 지금 열려있는 까치 모임)</p><div id="kkachi-live-list" class="t-small">불러오는 중...</div>`;
  followingEl.parentElement!.insertAdjacentElement("afterend", liveSection);

  const unsubscribeLiveMeetups = subscribeLiveMeetups((meetups) => {
    const el = document.getElementById("kkachi-live-list");
    if (!el) return;
    el.innerHTML = meetups.length === 0
      ? "<p>지금 열려있는 모임이 없어요.</p>"
      : meetups.map((m) => `
          <div style="padding:8px 0;border-bottom:1px solid #eee;">
            <strong>${esc(m.title)}</strong><br>
            <span class="t-micro">${esc(m.hostName)} · ${m.participants.length}/${m.capacity}명 · ${esc(m.address)}</span>
          </div>
        `).join("");
  });
  state.routeCleanup.push(unsubscribeLiveMeetups);

  const msgDialog = document.getElementById("feed-msg-dialog") as HTMLDialogElement;
  const msgTitle = document.getElementById("feed-msg-title")!;
  const msgSub = document.getElementById("feed-msg-sub")!;
  const msgInput = document.getElementById("feed-msg-input") as HTMLTextAreaElement;
  const msgSent = document.getElementById("feed-msg-sent")!;
  const msgSend = document.getElementById("feed-msg-send")!;
  const msgClose = document.getElementById("feed-msg-close")!;

  function getAllPosts(): FeedPostItem[] {
    return [...state.feedCustomPosts, ...DATA.feedPosts];
  }

  function renderFollowingSidebar() {
    if (state.feedFollowing.length === 0) {
      followingEl.innerHTML = `<p class="t-small">아직 팔로우한 크루가 없습니다. 피드 우측의 <strong>팔로우</strong> 버튼을 눌러보세요!</p>`;
    } else {
      followingEl.innerHTML = `<ul style="display:flex;flex-direction:column;gap:6px;">
        ${state.feedFollowing.map((name) => `<li class="t-small fw-600">• ${esc(name)}</li>`).join("")}
      </ul>`;
    }
  }

  function renderFeedStream() {
    const all = getAllPosts().filter(
      (p) => state.feedTrackFilter === "all" || p.track === state.feedTrackFilter
    );
    postCountEl.textContent = `${all.length} POSTS`;

    streamEl.innerHTML = all.map((p) => {
      const isLiked = state.feedLikes.includes(p.id);
      const isFollowing = state.feedFollowing.includes(p.author);
      const isJoined = state.agenda.includes(p.sessionId);
      const extraComments = state.feedComments[p.id] || [];
      const comments = [...p.comments, ...extraComments];
      const likeCount = p.likes + (isLiked ? 1 : 0);
      const activeJoinedCount = p.joinedCount + (isJoined ? 1 : 0);
      const commentsOpen = openComments.has(p.id);

      return `
        <article class="feed-post-card" data-pid="${esc(p.id)}">
          <header class="feed-post-head">
            <div class="feed-author-wrap">
              <div class="feed-avatar-box">${feedAvatarSvg(p.avatarKind)}</div>
              <div>
                <div class="t-lead fw-600">${esc(p.author)}</div>
                <div class="t-micro">${esc(p.time)} · ${esc(p.area)}</div>
              </div>
            </div>
            <div class="feed-head-actions">
              <button type="button" class="feed-follow-btn t-small" data-follow="${esc(p.author)}" aria-pressed="${isFollowing ? "true" : "false"}">${isFollowing ? "팔로잉" : "팔로우"}</button>
              <a class="feed-meet-btn t-small" href="#/talks/${esc(p.sessionId)}">모임 보기</a>
            </div>
          </header>

          <div class="feed-post-media">
            ${feedMediaSvg(p)}
            <span class="feed-media-tag t-micro">${esc(p.area)}</span>
          </div>

          <div class="feed-post-body">
            <div class="feed-action-row">
              <div class="feed-action-left">
                <button type="button" class="feed-icon-btn t-small" data-like="${esc(p.id)}" aria-pressed="${isLiked ? "true" : "false"}" aria-label="좋아요">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="${isLiked ? DATA.tokens.vivid : "none"}" stroke="${DATA.tokens.ink}" stroke-width="2" aria-hidden="true">
                    <path d="M12 20.5s-7.5-4.7-9.5-9.2C1 7.9 3 4.5 6.5 4.5c2 0 3.7 1.1 5.5 3 1.8-1.9 3.5-3 5.5-3 3.5 0 5.5 3.4 4 6.8-2 4.5-9.5 9.2-9.5 9.2z"/>
                  </svg>
                </button>
                <button type="button" class="feed-icon-btn t-small tnum" data-toggle-cmt="${esc(p.id)}" aria-expanded="${commentsOpen ? "true" : "false"}">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${DATA.tokens.ink}" stroke-width="2" aria-hidden="true">
                    <path d="M4 5h16v11H8l-4 4V5z"/>
                  </svg>
                  <span>${comments.length}</span>
                </button>
              </div>

              <button type="button" class="feed-msg-btn t-micro" data-msg="${esc(p.author)}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${DATA.tokens.ink}" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14"/>
                  <path d="M3 6l9 7 9-7"/>
                </svg>
                <span>메시지</span>
              </button>
            </div>

            <p class="feed-likes-line t-small tnum">좋아요 ${likeCount}개</p>

            <div class="feed-participants-row">
              <div class="feed-avatars-stack" aria-hidden="true">
                ${p.joined.map((ch, idx) => `<span class="feed-mini-avatar" style="background:${miniPalette[idx % miniPalette.length]};">${esc(ch)}</span>`).join("")}
              </div>
              <span class="t-micro tnum">${activeJoinedCount}명 참여중 (+${p.extraCount})</span>
              <button type="button" class="feed-join-chip t-micro" data-join="${esc(p.sessionId)}" aria-pressed="${isJoined ? "true" : "false"}">${isJoined ? "참여 찜 완료 ✓" : "+ 참여 찜"}</button>
            </div>

            <div class="feed-caption">
              <p class="t-small"><strong class="fw-600">${esc(p.author)}</strong> ${esc(p.caption)}</p>
              <p class="t-micro" style="margin-top:4px;opacity:0.75;">${esc(p.captionEn)}</p>
            </div>

            ${commentsOpen ? `
              <div class="feed-comments-box">
                ${comments.length === 0
                  ? `<p class="t-micro">첫 댓글을 남겨보세요!</p>`
                  : comments.map((cm) => `<div class="feed-comment-item t-micro"><strong>${esc(cm.author)}</strong> ${esc(cm.text)}</div>`).join("")}
                <form class="feed-comment-form" data-cmt-form="${esc(p.id)}">
                  <input class="text-input t-small" type="text" placeholder="따뜻한 댓글을 입력하세요..." style="flex:1;height:38px;" required>
                  <button type="submit" class="feed-follow-btn t-micro" style="height:38px;">등록</button>
                </form>
              </div>
            ` : ""}
          </div>
        </article>
      `;
    }).join("");

    renderFollowingSidebar();
  }

  streamEl.addEventListener("click", (e) => {
    const target = e.target as Element;

    const likeBtn = target.closest<HTMLElement>("[data-like]");
    if (likeBtn) {
      const pid = likeBtn.dataset.like!;
      const idx = state.feedLikes.indexOf(pid);
      if (idx === -1) state.feedLikes.push(pid);
      else state.feedLikes.splice(idx, 1);
      storageSet("kkachi.feedLikes", state.feedLikes);
      renderFeedStream();
      return;
    }

    const followBtn = target.closest<HTMLElement>("[data-follow]");
    if (followBtn) {
      const author = followBtn.dataset.follow!;
      const idx = state.feedFollowing.indexOf(author);
      if (idx === -1) state.feedFollowing.push(author);
      else state.feedFollowing.splice(idx, 1);
      storageSet("kkachi.feedFollowing", state.feedFollowing);
      renderFeedStream();
      return;
    }

    const joinBtn = target.closest<HTMLElement>("[data-join]");
    if (joinBtn) {
      toggleAgenda(joinBtn.dataset.join!);
      renderFeedStream();
      return;
    }

    const cmtToggle = target.closest<HTMLElement>("[data-toggle-cmt]");
    if (cmtToggle) {
      const pid = cmtToggle.dataset.toggleCmt!;
      if (openComments.has(pid)) openComments.delete(pid);
      else openComments.add(pid);
      renderFeedStream();
      return;
    }

    const msgBtn = target.closest<HTMLElement>("[data-msg]");
    if (msgBtn) {
      messageTargetAuthor = msgBtn.dataset.msg!;
      msgTitle.textContent = `${messageTargetAuthor}에게 메시지`;
      msgSub.textContent = "팝미팅 호스트에게 가볍게 인사나 참여 문의를 보내보세요.";
      msgInput.value = "";
      msgSent.hidden = true;
      if (typeof msgDialog.showModal === "function") msgDialog.showModal();
      else msgDialog.setAttribute("open", "");
      msgInput.focus();
    }
  });

  streamEl.addEventListener("submit", (e) => {
    const form = (e.target as Element).closest<HTMLFormElement>("[data-cmt-form]");
    if (!form) return;
    e.preventDefault();
    const pid = form.dataset.cmtForm!;
    const input = form.querySelector<HTMLInputElement>("input");
    const txt = input?.value.trim() || "";
    if (!txt) return;
    if (!state.feedComments[pid]) state.feedComments[pid] = [];
    state.feedComments[pid].push({ author: state.badge.name || "까치 멤버", text: txt });
    storageSet("kkachi.feedComments", state.feedComments);
    openComments.add(pid);
    renderFeedStream();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tr = (btn as HTMLElement).dataset.ftrack!;
      state.feedTrackFilter = tr;
      filterBtns.forEach((b) =>
        b.setAttribute("aria-pressed", (b as HTMLElement).dataset.ftrack === tr ? "true" : "false")
      );
      renderFeedStream();
    });
  });

  document.getElementById("feed-submit-post")?.addEventListener("click", () => {
    const authorEl = document.getElementById("feed-new-author") as HTMLInputElement;
    const trackEl = document.getElementById("feed-new-track") as HTMLSelectElement;
    const captionEl = document.getElementById("feed-new-caption") as HTMLTextAreaElement;
    const caption = captionEl.value.trim();
    if (!caption) {
      captionEl.focus();
      return;
    }
    const author = authorEl.value.trim() || "까치 멤버";
    const track = trackEl.value || "walk";
    const trackObj = trackById(track);
    const linkedSession = DATA.sessions.find((s) => s.track === track) || DATA.sessions[0];
    const mediaMap: Record<string, FeedPostItem["mediaKind"]> = {
      walk: "drip",
      sound: "vinyl",
      craft: "riso",
      night: "spark"
    };
    const avatarMap: Record<string, FeedPostItem["avatarKind"]> = {
      walk: "coffee",
      sound: "vinyl",
      craft: "riso",
      night: "spark"
    };

    const newPost: FeedPostItem = {
      id: "custom-" + Date.now(),
      author,
      handle: "@kkachi_member",
      avatarKind: avatarMap[track] || "spark",
      time: "방금 전",
      area: `${trackObj.label.split("·")[0].trim()} · 서울 팝 스팟`,
      track,
      sessionId: linkedSession.id,
      likes: 1,
      joined: [author.slice(0, 1) || "까"],
      joinedCount: 1,
      extraCount: 1,
      caption,
      captionEn: "Shared live from KKACHI local pop-meeting community.",
      mediaKind: mediaMap[track] || "spark",
      comments: []
    };

    state.feedCustomPosts.unshift(newPost);
    storageSet("kkachi.feedCustomPosts", state.feedCustomPosts);
    captionEl.value = "";
    state.feedTrackFilter = "all";
    filterBtns.forEach((b) =>
      b.setAttribute("aria-pressed", (b as HTMLElement).dataset.ftrack === "all" ? "true" : "false")
    );
    renderFeedStream();
  });

  msgSend.addEventListener("click", () => {
    const text = msgInput.value.trim();
    if (!text) {
      msgInput.focus();
      return;
    }
    msgSent.textContent = `${messageTargetAuthor}님에게 메시지를 전송했습니다!`;
    msgSent.hidden = false;
    msgInput.value = "";
  });

  msgClose.addEventListener("click", () => {
    if (typeof msgDialog.close === "function") msgDialog.close();
    else msgDialog.removeAttribute("open");
  });

  renderFeedStream();

  // Below: 10 Crew Hosts Pixel Portraits + Poster Wall
  const gridWrap = document.getElementById("spk-grid-wrap")!;
  const trackBtns = Array.from(document.querySelectorAll("#spk-track-toggles .chip-toggle"));
  const azBtn = document.getElementById("spk-sort-az")!;
  const dayBtn = document.getElementById("spk-sort-day")!;

  function firstSessionOrder(sp: typeof DATA.speakers[0]) {
    const list = sessionsBySpeaker(sp.id).slice().sort((a, b) => a.day !== b.day ? a.day.localeCompare(b.day) : timeToMin(a.start) - timeToMin(b.start));
    const first = list[0];
    return first ? Number(first.day[1]) * 10000 + timeToMin(first.start) : 999999;
  }

  function drawList(skipFade: boolean) {
    let list = DATA.speakers.filter((sp) => state.speakersFilter.tracks.length === 0 || state.speakersFilter.tracks.includes(sp.track));
    list = state.speakersFilter.sort === "az"
      ? list.slice().sort((a, b) => a.name.localeCompare(b.name))
      : list.slice().sort((a, b) => firstSessionOrder(a) - firstSessionOrder(b));

    gridWrap.innerHTML = `<div class="speakers-index-grid">
      ${list.map((sp) => {
        const tr = trackById(sp.track);
        const sess = sessionsBySpeaker(sp.id);
        return `<figure class="speaker-card" data-spcard="${esc(sp.id)}">
          <a class="speaker-card-link" href="#/feed/${esc(sp.id)}">
            <canvas class="portrait-canvas" data-spid="${esc(sp.id)}" role="img" aria-label="Pixel portrait of ${esc(sp.name)}"></canvas>
          </a>
          <figcaption class="speaker-card-figcap">
            <h3 class="t-lead speaker-card-name"><a class="u-anim" href="#/feed/${esc(sp.id)}">${esc(sp.name)}</a></h3>
            <p class="t-small speaker-card-role">${esc(sp.role)}, ${esc(sp.org)}</p>
            <p class="t-micro" style="margin-top:4px;">${esc(sp.city)} · <span class="track-chip track-chip-${esc(sp.track)}">${esc(tr.label.split("·")[0].trim())}</span></p>
            <ul style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
              ${sess.map((s) => `<li class="t-micro"><a class="u-anim" href="#/talks/${esc(s.id)}">${esc(s.title)}</a></li>`).join("")}
            </ul>
          </figcaption>
        </figure>`;
      }).join("")}
    </div>`;
    list.forEach((sp) => {
      const canvas = gridWrap.querySelector(`canvas[data-spid="${sp.id}"]`) as HTMLCanvasElement | null;
      if (canvas) initPortraitCanvas(canvas, sp, { skipAssemble: !skipFade });
    });
  }

  trackBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tid = (btn as HTMLElement).dataset.track!;
      const i = state.speakersFilter.tracks.indexOf(tid);
      if (i === -1) state.speakersFilter.tracks.push(tid); else state.speakersFilter.tracks.splice(i, 1);
      btn.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      drawList(false);
    });
  });

  azBtn.addEventListener("click", () => { state.speakersFilter.sort = "az"; azBtn.setAttribute("aria-pressed", "true"); dayBtn.setAttribute("aria-pressed", "false"); drawList(false); });
  dayBtn.addEventListener("click", () => { state.speakersFilter.sort = "day"; azBtn.setAttribute("aria-pressed", "false"); dayBtn.setAttribute("aria-pressed", "true"); drawList(false); });

  drawList(true);
  initPosterWall();
}

// Host detail (#/feed/:id)
export function renderHostDetail(main: HTMLElement, id: string): void {
  const idx = DATA.speakers.findIndex((s) => s.id === id);
  if (idx === -1) { renderNotFound(main); return; }
  const sp = DATA.speakers[idx];
  const tr = trackById(sp.track);
  const sess = sessionsBySpeaker(sp.id);
  const prev = DATA.speakers[(idx - 1 + DATA.speakers.length) % DATA.speakers.length];
  const next = DATA.speakers[(idx + 1) % DATA.speakers.length];

  document.title = `${sp.name}` + DATA.copy.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="${esc(sp.name)}">
      <div class="grid">
        <div class="col-full" style="margin-bottom:24px;"><a class="btn-text t-micro u-anim" href="#/feed">(← FEED로 돌아가기 · Back to FEED)</a></div>
        <div class="col-1-5">
          <canvas class="portrait-canvas" id="detail-portrait" role="img" aria-label="Pixel portrait of ${esc(sp.name)}"></canvas>
          <div class="scrubber-wrap">
            <div class="scrubber-head">
              <label class="t-micro" for="res-scrubber">(해상도 조절 · Pixel resolution)</label>
              <span class="t-micro tnum" id="res-val">1×1 px</span>
            </div>
            <input class="scrubber-input" type="range" id="res-scrubber" min="0" max="2" step="1" value="0">
          </div>
        </div>
        <div class="col-7-12">
          <p class="t-micro"><span class="track-chip track-chip-${esc(sp.track)}">${esc(tr.label)}</span></p>
          <h1 class="t-h1" style="margin-top:12px;" tabindex="-1">${esc(sp.name)}</h1>
          <p class="t-lead" style="margin-top:12px;">${esc(sp.role)} · ${esc(sp.org)} (${esc(sp.city)})</p>
          <p class="t-body" style="margin-top:24px;">${esc(sp.bio)}</p>
          <div class="speaker-sessions-list">
            <p class="t-micro" style="padding-top:16px;">(호스트 팝미팅 · Hosted Pop-Meetings)</p>
            ${sess.map((s) => `
              <div class="speaker-session-item">
                <div class="t-micro tnum">${esc(dayById(s.day).shortLabel)} · ${fmtTime(s.start)}–${fmtTime(s.end)} · ${esc(roomById(s.room).name)}</div>
                <h2 class="t-lead"><a class="u-anim" href="#/talks/${esc(s.id)}">${esc(s.title)}</a></h2>
                <p class="t-small">${esc(s.abstract)}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="grid speaker-prev-next">
        <a class="btn-text t-small u-anim" href="#/feed/${esc(prev.id)}">← ${esc(prev.name)}</a>
        <a class="btn-text t-small u-anim" href="#/feed/${esc(next.id)}">${esc(next.name)} →</a>
      </div>
    </section>
  `;

  const ctrl = initPortraitCanvas(document.getElementById("detail-portrait") as HTMLCanvasElement, sp, {});
  const scrubber = document.getElementById("res-scrubber") as HTMLInputElement;
  const valEl = document.getElementById("res-val")!;
  const sizes = [1, 2, 4];
  scrubber.addEventListener("input", () => {
    const b = sizes[Number(scrubber.value)] || 1;
    valEl.textContent = `${b}×${b} px`;
    ctrl.setBlockSize(b);
  });
}

// Talks / Pop-Meeting Directory (#/talks & #/talks/:id)
export function renderTalks(main: HTMLElement, sessionId?: string): void {
  document.title = "POP MEETING DIRECTORY" + DATA.copy.siteTitleSuffix;
  if (sessionId && sessionById(sessionId)) state.talksFilter.openId = sessionId;

  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="Directory">
      <div class="grid">
        <p class="col-1-3 t-micro">(POP MEETING DIRECTORY)</p>
        <div class="col-5-12">
          <h1 class="t-h1" tabindex="-1">${esc(DATA.copy.talksTitle)}</h1>
          <p class="t-body" style="margin-top:16px;">${esc(DATA.copy.talksLead)}</p>
          <div class="talks-controls">
            <div class="talks-search-row">
              <div class="field-group" style="flex:1;min-width:220px;">
                <label class="t-micro" for="talks-search">검색 · Search</label>
                <input class="text-input" type="search" id="talks-search" value="${esc(state.talksFilter.query)}" placeholder="예: 성수, 바이닐, 커피, Seongsu...">
              </div>
              <button type="button" class="btn-text t-micro u-anim" id="talks-clear-btn">(Clear filters)</button>
            </div>
            <div class="track-toggles-wrap" id="talks-track-toggles">
              ${DATA.tracks.map((t) => {
                const pressed = state.talksFilter.tracks.includes(t.id);
                return `<button type="button" class="chip-toggle t-small" data-track="${esc(t.id)}" aria-pressed="${pressed ? "true" : "false"}">(${esc(t.label.split("·")[0].trim())})</button>`;
              }).join("")}
            </div>
          </div>
          <p class="t-micro" id="talks-count" style="margin-top:16px;" aria-live="polite"></p>
        </div>
        <div class="col-full" id="talks-table-wrap"></div>
      </div>
    </section>
  `;

  const searchInput = document.getElementById("talks-search") as HTMLInputElement;
  const clearBtn = document.getElementById("talks-clear-btn")!;
  const trackBtns = Array.from(document.querySelectorAll("#talks-track-toggles .chip-toggle"));
  const countEl = document.getElementById("talks-count")!;
  const wrap = document.getElementById("talks-table-wrap")!;

  function highlightText(text: string, query: string): string {
    if (!query) return esc(text);
    const nq = normText(query);
    if (!nq) return esc(text);
    const idx = normText(text).indexOf(nq);
    if (idx === -1) return esc(text);
    return `${esc(text.slice(0, idx))}<mark>${esc(text.slice(idx, idx + query.length))}</mark>${esc(text.slice(idx + query.length))}`;
  }

  function renderTable() {
    const q = state.talksFilter.query.trim();
    const nq = normText(q);
    const list = DATA.sessions.filter((s) => {
      if (state.talksFilter.tracks.length > 0 && !state.talksFilter.tracks.includes(s.track)) return false;
      if (nq) {
        const spks = s.speakers.map((id) => speakerById(id).name).join(" ");
        const hay = normText(`${s.title} ${s.abstract} ${spks} ${s.type}`);
        if (!hay.includes(nq)) return false;
      }
      return true;
    });

    countEl.textContent = `${list.length} / ${DATA.sessions.length} 팝미팅 · ${list.length} of ${DATA.sessions.length} shown`;

    wrap.innerHTML = `
      <table class="data-table responsive-table talks-table">
        <thead>
          <tr><th class="t-micro">ID</th><th class="t-micro">Title</th><th class="t-micro">Host</th><th class="t-micro">Day &amp; Spot</th><th class="t-micro">Mood</th><th class="t-micro">Save</th></tr>
        </thead>
        <tbody>
          ${list.map((s) => {
            const tr = trackById(s.track);
            const isOpen = state.talksFilter.openId === s.id;
            const added = state.agenda.includes(s.id);
            const spks = s.speakers.map((id) => speakerById(id).name).join(", ");
            return `
              <tr class="talk-row" id="talk-row-${esc(s.id)}" data-track="${esc(s.track)}" data-sid="${esc(s.id)}" style="cursor:pointer;">
                <td data-label="ID" class="t-small tnum">${esc(s.id)}</td>
                <td data-label="Title" class="t-small fw-600">${highlightText(s.title, q)}</td>
                <td data-label="Host" class="t-small">${highlightText(spks, q)}</td>
                <td data-label="When" class="t-small tnum">${esc(dayById(s.day).shortLabel)} · ${fmtTime(s.start)} · ${esc(roomById(s.room).name.split("·")[0].trim())}</td>
                <td data-label="Mood" class="t-small"><span class="track-chip track-chip-${esc(s.track)}">${esc(tr.label.split("·")[0].trim())}</span></td>
                <td data-label="Save" class="t-small"><button type="button" class="tl-agenda-btn" data-ag="${esc(s.id)}" aria-pressed="${added ? "true" : "false"}">${svgPixelIcon(added ? "check" : "plus", 14)}</button></td>
              </tr>
              ${isOpen ? `<tr class="talk-expand-row"><td colspan="6"><p class="t-body">${highlightText(s.abstract, q)}</p></td></tr>` : ""}
            `;
          }).join("")}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll("[data-ag]").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.stopPropagation(); toggleAgenda((btn as HTMLElement).dataset.ag!); renderTable(); });
    });
    wrap.querySelectorAll(".talk-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        if ((e.target as Element).closest("[data-ag]")) return;
        const sid = (row as HTMLElement).dataset.sid!;
        state.talksFilter.openId = state.talksFilter.openId === sid ? null : sid;
        renderTable();
      });
    });
  }

  searchInput.addEventListener("input", () => { state.talksFilter.query = searchInput.value; renderTable(); });
  clearBtn.addEventListener("click", () => {
    state.talksFilter.query = ""; state.talksFilter.tracks = [];
    searchInput.value = "";
    trackBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
    renderTable();
  });
  trackBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tid = (btn as HTMLElement).dataset.track!;
      const i = state.talksFilter.tracks.indexOf(tid);
      if (i === -1) state.talksFilter.tracks.push(tid); else state.talksFilter.tracks.splice(i, 1);
      btn.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      renderTable();
    });
  });

  renderTable();
  if (sessionId) {
    const targetRow = document.getElementById(`talk-row-${sessionId}`);
    if (targetRow) window.requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, targetRow.getBoundingClientRect().top + window.scrollY - 120), behavior: "auto" }));
  }
}

// PROFILE (#/profile — KKACHI App Login Sync + Badge Maker + Saved Pop-Meetings)
export function renderProfile(main: HTMLElement): void {
  document.title = "PROFILE" + DATA.copy.siteTitleSuffix;
  const appUrl = "https://meetup-map-pearl.vercel.app";
  const savedList = state.agenda.map((id) => sessionById(id)).filter((x): x is NonNullable<typeof x> => Boolean(x));

  const providerLabel = (p: "kkachi" | "kakao" | "google") => {
    if (p === "kakao") return "카카오 연동 · Kakao";
    if (p === "google") return "Google 연동 · Google";
    return "까치 이메일 · KKACHI ID";
  };

  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="KKACHI LOGIN">
      <div class="grid">
        <p class="col-1-3 t-micro">(PROFILE · 앱 연동 로그인)</p>
        <div class="col-5-12">
          <h1 class="t-h1" tabindex="-1">PROFILE · 까치 앱 연동 및 로그인</h1>
          <p class="t-lead" style="margin-top:14px;">까치 로컬 커뮤니티 앱 계정과 연동해 프로필·찜한 팝미팅·픽셀 배지를 하나로 동기화하세요. / Sign in and link your KKACHI app account with your local pop-list and pixel badge.</p>
        </div>
      </div>

      <div class="grid profile-sync-grid">
        <div class="col-1-6">
          <div class="profile-auth-card" id="profile-auth-card"></div>
        </div>

        <div class="col-7-12">
          <div class="profile-app-frame">
            <div class="map-frame-bar">
              <span class="t-micro">까치 로컬 커뮤니티 앱 · 프로필/로그인 연동</span>
              <div style="display:flex;gap:10px;align-items:center;">
                <button type="button" class="btn-text t-micro u-anim" id="profile-app-reload" style="color:var(--sodium);">(새로고침)</button>
                <a class="btn-text t-micro u-anim" href="${esc(appUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--lime-vivid);">(새 탭에서 열기 ↗)</a>
              </div>
            </div>
            <div class="profile-app-guide">
              <span class="t-micro">앱 하단 우측 <strong>[프로필]</strong> 탭을 누르면 실제 까치 앱 로그인/계정 화면으로 바로 이동합니다.</span>
              <span class="t-micro tnum">LIVE SYNC</span>
            </div>
            <iframe
              class="profile-app-iframe"
              id="profile-app-iframe"
              src="${esc(appUrl)}"
              title="까치 로컬 커뮤니티 앱 로그인 및 프로필 연동"
              allow="geolocation; clipboard-write"
              loading="eager"
            ></iframe>
          </div>
        </div>
      </div>
    </section>

    <section class="sec" data-surface="ink" data-pager="BADGE">
      <div class="grid">
        <p class="col-1-3 t-micro">(PIXEL BADGE &amp; POP-LIST)</p>
        <div class="col-5-12">
          <h2 class="t-h2">${esc(DATA.copy.badgeTitle)}</h2>
          <p class="t-body" style="margin-top:12px;">${esc(DATA.copy.badgeLead)}</p>
        </div>
      </div>

      <div class="grid badge-layout">
        <div class="col-1-6">
          <canvas class="badge-editor-canvas" id="badge-canvas" tabindex="0" role="img" aria-label="16 by 16 pixel sprite editor"></canvas>
          <p class="t-micro badge-status" id="badge-status" aria-live="polite">Row 1, col 1</p>
          <div class="palette-group" role="radiogroup" aria-label="Lime badge palette" id="badge-palette">
            ${BADGE_PALETTE.map((c, idx) => `
              <button type="button" class="palette-swatch" role="radio" aria-checked="${idx === 3 ? "true" : "false"}" aria-label="${idx + 1}: ${esc(c.name)}" data-col="${esc(c.id)}" style="background-color:${c.hex};"></button>
            `).join("")}
          </div>
          <div class="badge-tools" id="badge-tools">
            <button type="button" class="chip-toggle t-small" data-tool="pen" aria-pressed="true">(Pen · 그리기)</button>
            <button type="button" class="chip-toggle t-small" data-tool="erase" aria-pressed="false">(Erase · 지우기)</button>
            <button type="button" class="chip-toggle t-small" data-tool="fill" aria-pressed="false">(Fill · 채우기)</button>
            <button type="button" class="chip-toggle t-small" data-tool="mirror" aria-pressed="false">(Mirror · 대칭)</button>
            <button type="button" class="chip-toggle t-small" id="badge-random">(Random · 랜덤)</button>
            <button type="button" class="chip-toggle t-small" id="badge-clear">(Clear · 초기화)</button>
            <button type="button" class="chip-toggle t-small" id="badge-undo">(Undo · 되돌리기)</button>
          </div>
        </div>
        <div class="col-8-12">
          <figure>
            <svg class="badge-preview-svg" id="badge-preview" viewBox="0 0 320 480" shape-rendering="crispEdges" role="img" aria-label="KKACHI Profile Badge"></svg>
            <figcaption class="t-micro" style="margin-top:8px;">(Preview: 320 × 480 printable SVG member badge.)</figcaption>
          </figure>
          <div class="field-group badge-name-field">
            <label class="t-micro" for="badge-name-input">닉네임 · Name on profile badge</label>
            <input class="text-input" type="text" id="badge-name-input" maxlength="20" value="${esc(state.badge.name)}">
          </div>
          <div class="badge-dl-wrap">
            <button type="button" class="btn-primary t-small" id="badge-dl-btn"><span>(Download SVG · 배지 저장)</span></button>
          </div>

          <div style="margin-top:40px;padding-top:24px;border-top:var(--rule);">
            <p class="t-micro">(MY POP-LIST · 내가 찜한 팝미팅 ${savedList.length}개)</p>
            ${savedList.length === 0
              ? `<p class="t-small" style="margin-top:12px;">아직 찜한 팝미팅이 없습니다. <a class="u-anim" href="#/pop-meeting">POP MEETING</a>에서 + 버튼을 눌러 추가해 보세요.</p>`
              : `<ul style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                  ${savedList.map((s) => `<li class="t-small"><a class="u-anim" href="#/talks/${esc(s.id)}">${esc(dayById(s.day).shortLabel)} ${fmtTime(s.start)} · ${esc(s.title)}</a></li>`).join("")}
                </ul>`}
          </div>
        </div>
      </div>
    </section>
  `;

  const authCard = document.getElementById("profile-auth-card")!;
  const appIframe = document.getElementById("profile-app-iframe") as HTMLIFrameElement;
  const nameInput = document.getElementById("badge-name-input") as HTMLInputElement;

  document.getElementById("profile-app-reload")?.addEventListener("click", () => {
    appIframe.src = appUrl;
  });

  function syncBadgeName(nick: string) {
    if (!nick) return;
    state.badge.name = nick.slice(0, 20);
    storageSet("kkachi.badge", state.badge);
    nameInput.value = state.badge.name;
    drawPreview();
  }

  function renderAuthCard(noticeMsg = "") {
    if (!state.auth.loggedIn) {
      authCard.innerHTML = `
        <div class="profile-status-bar">
          <span class="t-micro">(KKACHI APP ACCOUNT)</span>
          <span class="profile-status-tag t-micro">로그인 필요 · Offline</span>
        </div>
        <div>
          <h2 class="t-h2">까치 앱 로그인</h2>
          <p class="t-small" style="margin-top:6px;">계정을 연동하면 피드 작성자명·픽셀 배지·팝미팅 일정이 자동으로 동기화됩니다.</p>
        </div>

        <form class="profile-auth-form" id="profile-login-form">
          <div class="field-group">
            <label class="t-micro" for="auth-email">이메일 · Email</label>
            <input class="text-input" id="auth-email" type="email" placeholder="member@kkachi.app" required>
          </div>
          <div class="field-group">
            <label class="t-micro" for="auth-pw">비밀번호 · Password</label>
            <input class="text-input" id="auth-pw" type="password" minlength="4" placeholder="4자 이상 입력" required>
          </div>
          <div class="field-group">
            <label class="t-micro" for="auth-nick">커뮤니티 닉네임 (선택)</label>
            <input class="text-input" id="auth-nick" type="text" maxlength="20" placeholder="예: 성수 산책러">
          </div>
          <p class="error-chip t-micro" id="auth-err" hidden></p>
          <button type="submit" class="btn-primary t-small"><span>까치 계정으로 로그인 · Sign in</span></button>
        </form>

        <div>
          <p class="t-micro" style="margin-bottom:8px;">(QUICK APP SYNC · 간편 앱 연동)</p>
          <div class="profile-provider-btns">
            <button type="button" class="profile-provider-btn t-small" data-provider="kakao">카카오 계정 연동</button>
            <button type="button" class="profile-provider-btn t-small" data-provider="google">Google 계정 연동</button>
          </div>
        </div>
      `;

      const form = document.getElementById("profile-login-form") as HTMLFormElement;
      const errEl = document.getElementById("auth-err")!;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = (document.getElementById("auth-email") as HTMLInputElement).value.trim();
        const pw = (document.getElementById("auth-pw") as HTMLInputElement).value.trim();
        const nickInput = (document.getElementById("auth-nick") as HTMLInputElement).value.trim();
        if (!email || !email.includes("@")) {
          errEl.textContent = "올바른 이메일 주소를 입력해 주세요.";
          errEl.hidden = false;
          return;
        }
        if (pw.length < 4) {
          errEl.textContent = "비밀번호는 4자 이상 입력해 주세요.";
          errEl.hidden = false;
          return;
        }
        const nick = nickInput || email.split("@")[0] || "까치 멤버";
        state.auth = {
          loggedIn: true,
          provider: "kkachi",
          nickname: nick.slice(0, 20),
          email,
          homeArea: state.auth.homeArea || "성수 베이스캠프",
          bio: state.auth.bio || "오늘도 동네 팝미팅에서 새로운 취향을 찾고 있어요.",
          syncedAt: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        };
        storageSet("kkachi.auth", state.auth);
        syncBadgeName(state.auth.nickname);
        renderAuthCard("까치 계정이 연동되었습니다!");
      });

      authCard.querySelectorAll<HTMLElement>("[data-provider]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prov = btn.dataset.provider as "kakao" | "google";
          const defaultNick = prov === "kakao" ? "까치 카카오 멤버" : "까치 구글 멤버";
          const defaultMail = prov === "kakao" ? "kakao.sync@kkachi.app" : "google.sync@kkachi.app";
          state.auth = {
            loggedIn: true,
            provider: prov,
            nickname: defaultNick,
            email: defaultMail,
            homeArea: state.auth.homeArea || "성수 베이스캠프",
            bio: "까치 앱과 계정이 연동되었습니다. 동네 팝미팅에 참여해 보세요!",
            syncedAt: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
          };
          storageSet("kkachi.auth", state.auth);
          syncBadgeName(state.auth.nickname);
          renderAuthCard(`${providerLabel(prov)} 연동이 완료되었습니다!`);
        });
      });
    } else {
      authCard.innerHTML = `
        <div class="profile-status-bar">
          <span class="t-micro">${esc(providerLabel(state.auth.provider))}</span>
          <span class="profile-status-tag is-connected t-micro">✓ 앱 연동됨 · ${esc(state.auth.syncedAt || "SYNCED")}</span>
        </div>

        <div>
          <h2 class="t-h2">${esc(state.auth.nickname)}</h2>
          <p class="t-micro" style="margin-top:4px;">${esc(state.auth.email)}</p>
        </div>

        <div class="profile-stats-row">
          <div class="profile-stat-cell">
            <div class="t-micro">찜한 모임</div>
            <div class="t-lead tnum fw-600" style="margin-top:4px;">${state.agenda.length}개</div>
          </div>
          <div class="profile-stat-cell">
            <div class="t-micro">팔로우</div>
            <div class="t-lead tnum fw-600" style="margin-top:4px;">${state.feedFollowing.length}곳</div>
          </div>
          <div class="profile-stat-cell">
            <div class="t-micro">좋아요</div>
            <div class="t-lead tnum fw-600" style="margin-top:4px;">${state.feedLikes.length}개</div>
          </div>
        </div>

        <div class="profile-auth-form">
          <div class="field-group">
            <label class="t-micro" for="auth-edit-nick">닉네임 수정 · Nickname (배지 자동 연동)</label>
            <input class="text-input" id="auth-edit-nick" type="text" maxlength="20" value="${esc(state.auth.nickname)}">
          </div>
          <div class="field-group">
            <label class="t-micro" for="auth-edit-area">주 활동 거점 · Home Pop Spot</label>
            <select class="select-input t-small" id="auth-edit-area">
              ${DATA.rooms.map((r) => {
                const nm = r.name.split("·")[0].trim();
                const full = r.name;
                return `<option value="${esc(full)}"${state.auth.homeArea === full || state.auth.homeArea === nm ? " selected" : ""}>${esc(r.name)}</option>`;
              }).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="t-micro" for="auth-edit-bio">취향 한 줄 소개 · Bio</label>
            <input class="text-input" id="auth-edit-bio" type="text" maxlength="60" value="${esc(state.auth.bio)}">
          </div>
          ${noticeMsg ? `<p class="t-micro fw-600" style="background:var(--lime-vivid);padding:6px 10px;border:1px solid var(--ink);">${esc(noticeMsg)}</p>` : ""}
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
            <button type="button" class="btn-primary t-small" id="auth-save-btn"><span>프로필 저장 &amp; 동기화</span></button>
            <button type="button" class="btn-text t-small u-anim" id="auth-logout-btn">(로그아웃 · Sign out)</button>
          </div>
        </div>
      `;

      document.getElementById("auth-save-btn")?.addEventListener("click", () => {
        const nick = (document.getElementById("auth-edit-nick") as HTMLInputElement).value.trim() || state.auth.nickname;
        const area = (document.getElementById("auth-edit-area") as HTMLSelectElement).value;
        const bio = (document.getElementById("auth-edit-bio") as HTMLInputElement).value.trim();
        state.auth.nickname = nick.slice(0, 20);
        state.auth.homeArea = area;
        state.auth.bio = bio;
        state.auth.syncedAt = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        storageSet("kkachi.auth", state.auth);
        syncBadgeName(state.auth.nickname);
        renderAuthCard("프로필과 픽셀 배지가 까치 계정에 동기화되었습니다!");
      });

      document.getElementById("auth-logout-btn")?.addEventListener("click", () => {
        state.auth.loggedIn = false;
        storageSet("kkachi.auth", state.auth);
        renderAuthCard();
      });
    }
  }

  const canvas = document.getElementById("badge-canvas") as HTMLCanvasElement;
  const statusEl = document.getElementById("badge-status")!;
  const previewSvg = document.getElementById("badge-preview")!;
  const paletteBtns = Array.from(document.querySelectorAll("#badge-palette .palette-swatch"));
  const toolBtns = Array.from(document.querySelectorAll("#badge-tools [data-tool]"));

  let grid = state.badge.grid.split("");
  const history: string[] = [];
  let currentColor = "3";
  let mode = "pen";
  let mirror = false;
  let keyR = 0, keyC = 0, canvasFocused = false, painting = false, paintModeOverride: string | null = null;

  const pushHistory = () => { history.push(grid.join("")); if (history.length > 20) history.shift(); };
  const saveGrid = () => { state.badge.grid = grid.join(""); storageSet("kkachi.badge", state.badge); };

  function drawEditor() {
    const rect = canvas.getBoundingClientRect();
    const maxPx = Math.min(rect.width || 320, 640);
    const cell = Math.max(12, Math.floor(maxPx / 16));
    const size = cell * 16;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(size * dpr)) { canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr); }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = DATA.tokens.ink;
    ctx.fillRect(0, 0, size, size);
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const palObj = BADGE_PALETTE[Number(grid[r * 16 + c])] || BADGE_PALETTE[0];
        ctx.fillStyle = palObj.hex;
        ctx.fillRect(c * cell + 1, r * cell + 1, cell - 1, cell - 1);
      }
    }
    if (canvasFocused) {
      ctx.strokeStyle = DATA.tokens.vivid;
      ctx.lineWidth = 2;
      ctx.strokeRect(keyC * cell + 2, keyR * cell + 2, cell - 4, cell - 4);
    }
  }

  const updateStatus = () => {
    const palObj = BADGE_PALETTE[Number(grid[keyR * 16 + keyC])] || BADGE_PALETTE[0];
    statusEl.textContent = `Row ${keyR + 1}, Col ${keyC + 1} · ${palObj.name}`;
  };

  function drawPreview() {
    const spriteSize = 16 * 15, sx0 = (320 - spriteSize) / 2, sy0 = 68;
    let spriteRects = "";
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const palObj = BADGE_PALETTE[Number(grid[r * 16 + c])] || BADGE_PALETTE[0];
        spriteRects += `<rect x="${sx0 + c * 15}" y="${sy0 + r * 15}" width="15" height="15" fill="${palObj.hex}"/>`;
      }
    }
    let stripRects = "";
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 16; i++) {
        stripRects += `<rect x="${i * 20}" y="${432 + row * 24}" width="20" height="24" fill="${TRAIL_COLORS[(i + row * 3) % TRAIL_COLORS.length]}"/>`;
      }
    }
    const badgeName = state.badge.name || "까치 멤버";
    previewSvg.innerHTML = `
      <rect x="0" y="0" width="320" height="480" fill="${DATA.tokens.sodium}"/>
      <rect x="0" y="0" width="320" height="48" fill="${DATA.tokens.ink}"/>
      <text x="16" y="31" font-family="Plus Jakarta Sans, Noto Sans KR, sans-serif" font-size="18" font-weight="700" fill="${DATA.tokens.vivid}">까치 · KKACHI</text>
      ${spriteRects}
      <text x="16" y="356" font-family="Plus Jakarta Sans, Noto Sans KR, sans-serif" font-size="24" font-weight="700" fill="${DATA.tokens.ink}">${esc(badgeName)}</text>
      <text x="16" y="388" font-family="Plus Jakarta Sans, Noto Sans KR, sans-serif" font-size="13" font-weight="600" fill="${DATA.tokens.ink}">POP-MEETING COMMUNITY · SEOUL</text>
      ${stripRects}
    `;
  }

  function paintAt(r: number, c: number, colorId: string) {
    if (r < 0 || r >= 16 || c < 0 || c >= 16) return;
    grid[r * 16 + c] = colorId;
    if (mirror) grid[r * 16 + (15 - c)] = colorId;
  }

  function floodFill(r: number, c: number, newCol: string) {
    const target = grid[r * 16 + c];
    if (target === newCol) return;
    const queue: Array<[number, number]> = [[r, c]];
    const seen = new Set<number>();
    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      const k = cr * 16 + cc;
      if (cr < 0 || cr >= 16 || cc < 0 || cc >= 16 || seen.has(k) || grid[k] !== target) continue;
      seen.add(k); grid[k] = newCol;
      queue.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
    }
  }

  const coordsFromEvent = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      c: Math.min(15, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 16))),
      r: Math.min(15, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * 16)))
    };
  };

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault(); canvas.focus();
    const { r, c } = coordsFromEvent(e);
    keyR = r; keyC = c; pushHistory();
    if (mode === "fill") floodFill(r, c, currentColor);
    else { painting = true; paintModeOverride = mode === "erase" ? "0" : currentColor; paintAt(r, c, paintModeOverride); }
    saveGrid(); drawEditor(); drawPreview(); updateStatus();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!painting || !paintModeOverride) return;
    const { r, c } = coordsFromEvent(e);
    keyR = r; keyC = c; paintAt(r, c, paintModeOverride);
    saveGrid(); drawEditor(); drawPreview(); updateStatus();
  });

  const stopPaint = () => { painting = false; paintModeOverride = null; };
  canvas.addEventListener("pointerup", stopPaint);
  canvas.addEventListener("pointercancel", stopPaint);
  canvas.addEventListener("focus", () => { canvasFocused = true; drawEditor(); updateStatus(); });
  canvas.addEventListener("blur", () => { canvasFocused = false; drawEditor(); });

  const selectColor = (colId: string) => {
    currentColor = colId;
    paletteBtns.forEach((b) => b.setAttribute("aria-checked", (b as HTMLElement).dataset.col === colId ? "true" : "false"));
  };
  paletteBtns.forEach((btn) => btn.addEventListener("click", () => selectColor((btn as HTMLElement).dataset.col!)));

  toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = (btn as HTMLElement).dataset.tool!;
      if (t === "mirror") { mirror = !mirror; btn.setAttribute("aria-pressed", mirror ? "true" : "false"); return; }
      mode = t;
      toolBtns.forEach((b) => { if ((b as HTMLElement).dataset.tool !== "mirror") b.setAttribute("aria-pressed", (b as HTMLElement).dataset.tool === mode ? "true" : "false"); });
    });
  });

  document.getElementById("badge-random")!.addEventListener("click", () => {
    pushHistory();
    const rng = makeRng(Date.now());
    const accent = String(2 + Math.floor(rng() * 6));
    const g = new Array(256).fill("0");
    for (let r = 2; r <= 13; r++) for (let c = 0; c < 8; c++) if (rng() < 0.44) { g[r * 16 + c] = accent; g[r * 16 + (15 - c)] = accent; }
    grid = g; saveGrid(); drawEditor(); drawPreview(); updateStatus();
  });
  document.getElementById("badge-clear")!.addEventListener("click", () => { pushHistory(); grid = new Array(256).fill("0"); saveGrid(); drawEditor(); drawPreview(); updateStatus(); });
  document.getElementById("badge-undo")!.addEventListener("click", () => { if (history.length === 0) return; grid = history.pop()!.split(""); saveGrid(); drawEditor(); drawPreview(); updateStatus(); });
  nameInput.addEventListener("input", () => {
    state.badge.name = nameInput.value.slice(0, 20);
    storageSet("kkachi.badge", state.badge);
    if (state.auth.loggedIn) {
      state.auth.nickname = state.badge.name || state.auth.nickname;
      storageSet("kkachi.auth", state.auth);
    }
    drawPreview();
  });

  document.getElementById("badge-dl-btn")!.addEventListener("click", () => {
    const clone = previewSvg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n` + new XMLSerializer().serializeToString(clone);
    const blobUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
    const a = document.createElement("a"); a.href = blobUrl; a.download = "kkachi-profile-badge.svg";
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  });

  const ro = new ResizeObserver(drawEditor);
  ro.observe(canvas);
  state.routeCleanup.push(() => ro.disconnect());
  renderAuthCard();
  drawEditor();
  drawPreview();
  updateStatus();
}

// GET A APP (#/app)
export function renderAppPage(main: HTMLElement): void {
  document.title = "GET A APP" + DATA.copy.siteTitleSuffix;
  const totalLeft = DATA.tickets.reduce((a, t) => a + t.left, 0);

  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="GET A APP">
      <div class="grid">
        <p class="col-1-3 t-micro">(GET A APP)</p>
        <div class="col-5-12">
          <h1 class="t-h1" tabindex="-1">GET A APP · 까치 앱 시작하기</h1>
          <p class="t-lead tnum" style="margin-top:16px;">오픈 베타 잔여 초대권 ${totalLeft} / ${DATA.meta.capacity}석 · ${totalLeft} beta spots remaining.</p>
        </div>
        <div class="col-full store-badge-row" style="display:flex;gap:16px;flex-wrap:wrap;margin:24px 0;">
          <a class="store-badge-btn" href="https://apps.apple.com/app/id6833336153" target="_blank" rel="noopener noreferrer">
            <span class="t-micro">Download on the</span>
            <strong class="t-lead">App Store</strong>
          </a>
          <span class="store-badge-btn is-disabled" aria-disabled="true">
            <span class="t-micro">준비 중 · Coming soon</span>
            <strong class="t-lead">Google Play</strong>
          </span>
        </div>
        <div class="col-full" id="tickets-capacity-wrap"></div>
        <div class="col-full tier-list" id="tickets-tier-list">
          ${DATA.tickets.map((t) => {
            const qty = state.ticketQty[t.id] || 0;
            const maxQ = Math.min(4, t.left);
            const atMin = qty <= 0, atMax = qty >= maxQ;
            return `<div class="grid tier-row" style="padding-inline:0;" data-tier="${esc(t.id)}">
              <div class="tier-name-col">
                <h2 class="t-lead">${esc(t.name)}</h2>
                <p class="t-micro tnum" style="margin-top:4px;">${t.left}자리 남음 · ${t.left} left</p>
                ${t.id === "pop-pass" ? `
                  <div class="day-select-wrap">
                    <label class="t-micro" for="day-pass-select">희망 참여일 · Preferred Day</label>
                    <select class="select-input t-small" id="day-pass-select">
                      <option value="">요일 선택 · Choose a day</option>
                      ${DATA.days.map((d) => `<option value="${esc(d.id)}"${state.ticketDay === d.id ? " selected" : ""}>${esc(d.label)}</option>`).join("")}
                    </select>
                    <span class="error-chip t-micro" id="day-pass-error" ${state.ticketError ? "" : "hidden"}>희망 참여일을 선택해 주세요</span>
                  </div>
                ` : ""}
              </div>
              <div class="tier-inc-col t-small">${esc(t.includes)}</div>
              <div class="tier-price-col t-lead tnum">${t.price === 0 ? "FREE" : `₩${t.price.toLocaleString("ko-KR")}`}</div>
              <div class="tier-step-col">
                <div class="stepper">
                  <button type="button" class="btn-stepper" data-step="-1" data-tid="${esc(t.id)}" aria-label="Decrease" ${atMin ? 'aria-disabled="true"' : ""}>${atMin ? svgStrike() : ""}${svgPixelIcon("minus", 14)}</button>
                  <output class="stepper-val t-lead tnum">${qty}</output>
                  <button type="button" class="btn-stepper" data-step="1" data-tid="${esc(t.id)}" aria-label="Increase" ${atMax ? 'aria-disabled="true"' : ""}>${atMax ? svgStrike() : ""}${svgPixelIcon("plus", 14)}</button>
                </div>
              </div>
            </div>`;
          }).join("")}
        </div>
        <div class="col-full passes-total-row">
          <div><p class="t-micro">(TOTAL · 합계)</p><p class="t-h2 tnum" id="tickets-total" aria-live="polite">₩0</p></div>
          <button type="button" class="btn-primary t-small" id="reserve-btn"><span>GET A APP · 초대장 받기</span></button>
        </div>
      </div>

      <div class="grid faq-sec" id="faq">
        <p class="col-1-3 t-micro">(FAQ · 자주 묻는 질문)</p>
        <div class="col-5-12">
          <h2 class="t-h2">Questions · 안내</h2>
          <div class="faq-list">
            ${DATA.faq.map((item) => `
              <details class="faq-item">
                <summary class="faq-summary t-lead"><span>${esc(item.q)}</span><span class="faq-icon-plus">${svgPixelIcon("plus", 16)}</span><span class="faq-icon-minus">${svgPixelIcon("minus", 16)}</span></summary>
                <p class="faq-answer t-body">${esc(item.a)}</p>
              </details>
            `).join("")}
          </div>
        </div>
      </div>

      <dialog class="raster-dialog" id="reserve-dialog" aria-labelledby="dlg-title">
        <h2 class="t-h2" id="dlg-title">까치 앱 초대장이 준비되었습니다!</h2>
        <p class="t-body" id="dlg-body" style="margin-top:16px;"></p>
        <div style="margin-top:24px;"><button type="button" class="btn-text t-small u-anim" id="dlg-close">(Close · 닫기)</button></div>
      </dialog>
    </section>
  `;

  const capCtrl = buildCapacityGrid(document.getElementById("tickets-capacity-wrap")!, { withSelection: true, instant: true });
  const totalEl = document.getElementById("tickets-total")!;
  const reserveBtn = document.getElementById("reserve-btn")!;
  const daySelect = document.getElementById("day-pass-select") as HTMLSelectElement;
  const dayErr = document.getElementById("day-pass-error")!;
  const dialog = document.getElementById("reserve-dialog") as HTMLDialogElement;
  const dlgBody = document.getElementById("dlg-body")!;
  const dlgClose = document.getElementById("dlg-close")!;

  function refreshTotals() {
    let totalCost = 0, totalQty = 0;
    DATA.tickets.forEach((t) => {
      const q = state.ticketQty[t.id] || 0;
      totalQty += q; totalCost += q * t.price;
      const row = document.querySelector(`.tier-row[data-tier="${t.id}"]`);
      if (row) {
        const out = row.querySelector(".stepper-val");
        if (out) out.textContent = String(q);
        const dec = row.querySelector('[data-step="-1"]') as HTMLElement;
        const inc = row.querySelector('[data-step="1"]') as HTMLElement;
        const maxQ = Math.min(4, t.left);
        const setDis = (btn: HTMLElement | null, dis: boolean) => {
          if (!btn) return;
          btn.setAttribute("aria-disabled", dis ? "true" : "false");
          const existing = btn.querySelector(".btn-strike");
          if (dis && !existing) btn.insertAdjacentHTML("afterbegin", svgStrike());
          if (!dis && existing) existing.remove();
        };
        setDis(dec, q <= 0); setDis(inc, q >= maxQ);
      }
    });
    totalEl.textContent = totalCost === 0 && totalQty > 0 ? "FREE (₩0)" : `₩${totalCost.toLocaleString("ko-KR")}`;
    capCtrl.setSelected(totalQty);
    const isDisabled = totalQty === 0;
    reserveBtn.setAttribute("aria-disabled", isDisabled ? "true" : "false");
    const rStrike = reserveBtn.querySelector(".btn-strike");
    if (isDisabled && !rStrike) reserveBtn.insertAdjacentHTML("afterbegin", svgStrike());
    if (!isDisabled && rStrike) rStrike.remove();
  }

  document.getElementById("tickets-tier-list")!.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest(".btn-stepper") as HTMLElement | null;
    if (!btn || btn.getAttribute("aria-disabled") === "true") return;
    const tid = btn.dataset.tid!;
    const delta = Number(btn.dataset.step);
    const tier = DATA.tickets.find((t) => t.id === tid)!;
    const maxQ = Math.min(4, tier.left);
    const cur = state.ticketQty[tid] || 0;
    state.ticketQty[tid] = Math.max(0, Math.min(maxQ, cur + delta));
    if (tid === "pop-pass" && state.ticketQty[tid] === 0) { state.ticketError = false; dayErr.hidden = true; }
    refreshTotals();
  });

  daySelect.addEventListener("change", () => {
    state.ticketDay = daySelect.value;
    if (state.ticketDay) { state.ticketError = false; dayErr.hidden = true; }
  });

  reserveBtn.addEventListener("click", () => {
    if (reserveBtn.getAttribute("aria-disabled") === "true") return;
    if ((state.ticketQty["pop-pass"] || 0) > 0 && !state.ticketDay) {
      state.ticketError = true; dayErr.hidden = false; daySelect.focus(); return;
    }
    const parts: string[] = [];
    DATA.tickets.forEach((t) => {
      const q = state.ticketQty[t.id] || 0;
      if (q > 0) parts.push(`${q} × ${t.name}${t.id === "pop-pass" && state.ticketDay ? ` (${dayById(state.ticketDay).label})` : ""}`);
    });
    dlgBody.textContent = `선택하신 구성(${parts.join(", ")})으로 까치 iOS/Android 베타 다운로드 링크와 성수·연남 팝미팅 체크인 패스가 발급되었습니다. (데모 확인)`;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dlgClose.focus();
  });

  dlgClose.addEventListener("click", () => { if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open"); reserveBtn.focus(); });
  refreshTotals();
}

export function renderNotFound(main: HTMLElement): void {
  document.title = "404" + DATA.copy.siteTitleSuffix;
  const ch = window.innerWidth >= 768 ? 16 : 8;
  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="404">
      <div class="grid"><div class="col-full">
        ${svgBitmapText("404", ch, DATA.tokens.ink, { className: "notfound-bitmap", ariaHidden: true, bold: true })}
        <h1 class="t-h1" tabindex="-1">페이지를 찾을 수 없습니다 · Nothing at this address.</h1>
        <div style="margin-top:32px;"><a class="btn-text t-lead u-anim" href="#/">(홈으로 돌아가기 · Back to Home)</a></div>
      </div></div>
    </section>
  `;
}
