// This file does the rendering. You shouldn't need to edit it —
// your league name, banner, and points settings live in data.js,
// and your coaches + weekly results live in your Google Sheet.

document.addEventListener("DOMContentLoaded", () => {
  // The on-page heading starts blank and is filled in entirely by the
  // sheet's Page Title once it loads (see applyPageMeta below) — no
  // hardcoded name here, so there's nothing stale to flash on screen
  // first. The browser tab itself always just says "WackLabs" — set
  // once in index.html's <title> — and isn't tied to this at all.

  // Show the banner from data.js immediately (no flash of "no banner").
  // If the sheet defines its own Banner rows, loadStandings() below will
  // swap it out once the sheet finishes loading.
  applyBanner(ANNOUNCEMENT || {});

  loadStandings();
});

// Keeps track of the currently-running countdown timer (if any), so a
// second call to applyBanner (e.g. once the sheet's own Banner rows
// load in) never leaves an old interval ticking alongside a new one.
let countdownInterval = null;

function applyBanner(ann) {
  const banner = document.getElementById("banner");
  const countdownEl = document.getElementById("banner-countdown");

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  if (ann && ann.active && ann.text && ann.link) {
    document.getElementById("banner-text").textContent = ann.text;
    document.getElementById("banner-link").href = ann.link;
    banner.hidden = false;
    countdownInterval = startBannerCountdown(countdownEl, ann.deadline);
  } else {
    banner.hidden = true;
    countdownEl.hidden = true;
    countdownEl.textContent = "";
  }
}

// Starts a live-ticking "time left" countdown inside the banner, next
// to the banner text, counting down to the given deadline (a date/time
// string from the Banner Countdown row — see data.js). Returns the
// interval ID so the caller can clear it later, or null if there's no
// valid deadline to count down to (the countdown just stays hidden).
function startBannerCountdown(countdownEl, deadlineValue) {
  const deadline = deadlineValue ? new Date(deadlineValue) : null;
  if (!deadline || isNaN(deadline.getTime())) {
    countdownEl.hidden = true;
    countdownEl.textContent = "";
    countdownEl.classList.remove("banner-countdown-locked");
    const bannerTextEl = document.getElementById("banner-text");
    if (bannerTextEl) bannerTextEl.hidden = false;
    return null;
  }

  // Declared before tick() runs (rather than as a const assigned after
  // the initial tick() call below) so that if the deadline has ALREADY
  // passed the very first time this runs, tick() can safely check it
  // instead of crashing trying to clear an interval that doesn't exist
  // yet.
  let intervalId = null;

  const bannerTextEl = document.getElementById("banner-text");

  const tick = () => {
    const msLeft = deadline.getTime() - Date.now();
    countdownEl.hidden = false;
    if (msLeft <= 0) {
      // Once it's locked, "click here to enter" no longer makes sense,
      // so the banner's own text hides and just the (bigger, flashing)
      // "Contest locked" pill is left showing.
      countdownEl.textContent = "Contest locked";
      countdownEl.classList.add("banner-countdown-locked");
      if (bannerTextEl) bannerTextEl.hidden = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      countdownInterval = null;
      return;
    }
    countdownEl.classList.remove("banner-countdown-locked");
    if (bannerTextEl) bannerTextEl.hidden = false;
    countdownEl.textContent = "Locks in " + formatCountdown(msLeft);
  };

  tick();
  // No point starting a ticking interval for a deadline that's already
  // passed — tick() above already showed "Contest locked".
  if (deadline.getTime() > Date.now()) {
    intervalId = setInterval(tick, 1000);
  }
  return intervalId;
}

// Turns a millisecond duration into a compact "1d 04h 09m 30s"-style
// string, dropping the days/hours parts once they hit zero so it
// doesn't show "0d 0h 5m 30s" for something locking in 5 minutes.
function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = n => String(n).padStart(2, "0");
  if (days > 0) return days + "d " + pad(hours) + "h " + pad(minutes) + "m " + pad(seconds) + "s";
  if (hours > 0) return hours + "h " + pad(minutes) + "m " + pad(seconds) + "s";
  return minutes + "m " + pad(seconds) + "s";
}

// Shows the "Message from the Commish" email-style box if a Commish
// Message was set in the sheet; hides it if not. The Subject line is
// optional too — falls back to a generic subject if left blank.
function applyCommishMessage(commish) {
  const section = document.getElementById("commish-section");
  const text = document.getElementById("commish-message");
  const subject = document.getElementById("commish-subject");
  if (!commish || !commish.message) {
    section.hidden = true;
    return;
  }
  text.textContent = commish.message;
  subject.textContent = commish.subject || "League Update";
  section.hidden = false;
  armCommishEnvelope();
}

// Makes the Commish's message "arrive" in a little envelope that flies
// onto the page and pops its flap open as you scroll down to it (see
// .commish-envelope-wrap / .envelope in style.css for the actual fly-
// in/open/reveal animation). Skips itself entirely -- leaving the
// message window just sitting there, visible right away -- if the
// browser doesn't support IntersectionObserver or the visitor has
// motion reduced; the CSS only hides the window and shows the
// envelope once the "js-envelope-armed" class below is added, so
// doing nothing here is a safe, fully-visible fallback rather than a
// half-broken one.
function armCommishEnvelope() {
  const wrap = document.getElementById("commish-envelope-wrap");
  if (!wrap || !("IntersectionObserver" in window)) return;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  wrap.classList.add("js-envelope-armed");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          wrap.classList.add("envelope-play");
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(wrap);
}

// Makes the standings table (heading, legend and table -- not the
// Current Leader photo panel next to it) open like a pair of
// mechanical bay doors -- meeting in the middle, then sliding apart,
// top one up and bottom one down -- as you scroll down to it (see
// .standings-door-wrap / .standings-door in style.css for the actual
// animation). Only runs once per page load (loadStandings only calls
// this after a successful render, and that only happens once), and
// skips itself entirely -- leaving the standings just sitting there,
// visible right away -- without IntersectionObserver support or with
// motion reduced, same safe-fallback approach as armCommishEnvelope
// above.
function armStandingsDoor() {
  const wrap = document.getElementById("standings-door-wrap");
  if (!wrap || !("IntersectionObserver" in window)) return;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  wrap.classList.add("js-door-armed");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          wrap.classList.add("door-play");
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );
  observer.observe(wrap);
}

// Shows the photo panel with the current points leader's own photo —
// the same one used for their standings/podium avatar (see
// renderStandings) — automatically following whoever's actually on
// top. Falls back to a default silhouette (rather than hiding the
// whole panel) if that coach has no matching photo file, or none of
// the candidate image URLs (see resolvePhotoCandidates) load
// successfully; only hides the panel entirely if there's no leader
// at all (an empty standings table).
function applyPhoto(candidates) {
  const panel = document.getElementById("photo-panel");
  const img = document.getElementById("team-photo");
  if (!candidates || !candidates.length) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  loadImageWithFallback(img, candidates, () => {
    img.replaceWith(makeSilhouette("leader-photo-silhouette"));
  });
}

async function loadStandings() {
  const head = document.getElementById("standings-head");
  const body = document.getElementById("standings-body");

  if (!SHEET_CSV_URL || SHEET_CSV_URL.indexOf("PASTE_YOUR") === 0) {
    showMessage(body, "Set SHEET_CSV_URL in data.js to connect your Google Sheet.");
    return;
  }

  showMessage(body, "Loading standings…");

  try {
    // Cache-bust so we always get the latest version of the sheet, not a
    // stale copy the browser (or a phone) has cached.
    const url = SHEET_CSV_URL + (SHEET_CSV_URL.indexOf("?") === -1 ? "?" : "&") + "_=" + Date.now();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const csvText = await response.text();

    // If SHEET_CSV_URL points at the wrong kind of link, Google sends
    // back an HTML page (a sign-in page, or the interactive spreadsheet
    // viewer) instead of plain CSV data. Catch that early with a clear
    // message instead of trying to render it as if it were real rows.
    const looksLikeHtml = /^\s*<(!doctype|html)/i.test(csvText) || csvText.indexOf("<script") !== -1;
    if (looksLikeHtml) {
      throw new Error(
        "That link returned a web page instead of CSV data. In data.js, " +
        "SHEET_CSV_URL needs to be the CSV export/publish link, not a " +
        "regular Sheets link."
      );
    }

    const rows = parseCSV(csvText).filter(r => r.some(cell => cell.trim() !== ""));
    if (rows.length < 2) throw new Error("Sheet looks empty");

    // Optional Banner rows and a Commish Message row anywhere above the
    // "Coach" header row let the sheet control those too — see the
    // Instructions tab in the sheet. (The Current Leader photo isn't
    // set from a row anymore — renderStandings below sets it straight
    // from whoever's actually leading.)
    const bannerFromSheet = extractBannerRows(rows);
    if (bannerFromSheet) applyBanner(bannerFromSheet);
    applyCommishMessage({
      message: extractCommishMessage(rows),
      subject: extractCommishSubject(rows),
    });
    applyPageMeta({
      title: extractPageTitle(rows),
      subtitle: extractPageSubtitle(rows),
    });

    renderStandings(rows, head, body);
    armStandingsDoor();
  } catch (err) {
    console.error("Couldn't load standings from Google Sheet:", err);
    const message = err && err.message && err.message.indexOf("web page instead of CSV") !== -1
      ? err.message
      : "Couldn't load standings right now. Check back in a bit, or double-check the sheet is published and SHEET_CSV_URL in data.js is correct.";
    showMessage(body, message);
  }
}

// Looks for rows shaped like "Banner Active" / "Banner Text" / "Banner
// Link" / "Banner Countdown Date" / "Banner Countdown Time" anywhere in
// the sheet and turns them into a banner object. Returns null if none
// of those rows are present (so the caller keeps whatever banner
// data.js already set).
function extractBannerRows(rows) {
  const map = {};
  rows.forEach(r => {
    const match = /^banner\s+(active|text|link|countdown(?:\s+date|\s+time)?)$/i.exec((r[0] || "").trim());
    if (match) map[match[1].toLowerCase().replace(/\s+/g, " ")] = (r[1] || "").trim();
  });
  const hasAny = map.active || map.text || map.link || map.countdown
    || map["countdown date"] || map["countdown time"];
  if (!hasAny) return null;

  // Countdown Date + Countdown Time are combined into the single
  // "YYYY-MM-DD HH:MM:SS"-ish string startBannerCountdown expects.
  // Still honors an old, un-split "Banner Countdown" row too, so a
  // sheet that hasn't been updated to the two-cell version yet keeps
  // working exactly as before.
  let deadline = map.countdown || "";
  if (map["countdown date"] || map["countdown time"]) {
    deadline = (map["countdown date"] || "") + " " + (map["countdown time"] || "");
    deadline = deadline.trim();
  }

  return {
    active: /^(true|yes|1|on)$/i.test(map.active || ""),
    text: map.text || "",
    link: map.link || "",
    deadline,
  };
}

// Turns a sheet's photo cell (or a coach's name, when there's no
// override) into a list of image URLs to try, in order. If it's
// already a full link (starts with http), that's the only candidate —
// used as-is. Otherwise it's treated as a username and turned into a
// standard photo link using PODIUM_PHOTO_REPO_BASE (see data.js) —
// the one base now used for every standings/podium/leader photo —
// tried as .jpg, .jpeg, then .png, since it's easy to upload a photo
// as the "wrong" file type without noticing.
function resolvePhotoCandidates(value, base) {
  const v = (value || "").trim();
  if (!v) return [];
  if (/^https?:\/\//i.test(v)) return [v];
  const slug = v.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!base || !slug) return [];
  return ["jpg", "jpeg", "png"].map(ext => base + slug + "." + ext);
}

// Points an <img> at the first of several candidate URLs, moving on to
// the next one if a URL 404s (or otherwise fails to load), and calling
// onAllFailed() if none of them work.
function loadImageWithFallback(img, candidates, onAllFailed) {
  let i = -1;
  img.onerror = () => {
    i++;
    if (i < candidates.length) {
      img.src = candidates[i];
    } else {
      onAllFailed();
    }
  };
  img.onerror();
}

// Looks for a row shaped like "Commish Message" anywhere in the sheet
// and returns its value, or "" if there isn't one.
function extractCommishMessage(rows) {
  const row = rows.find(r => /^commish\s+message$/i.test((r[0] || "").trim()));
  return row ? (row[1] || "").trim() : "";
}

// Looks for a row shaped like "Commish Subject" anywhere in the sheet
// and returns its value, used as the email's Subject line — or "" if
// there isn't one (applyCommishMessage falls back to a generic
// subject in that case).
function extractCommishSubject(rows) {
  const row = rows.find(r => /^commish\s+subject$/i.test((r[0] || "").trim()));
  return row ? (row[1] || "").trim() : "";
}

// Looks for a row shaped like "Winner Quote" anywhere in the sheet and
// returns its value, or "" if there isn't one (applyWinnerQuote hides
// the quote line under the podium in that case).
function extractWinnerQuote(rows) {
  const row = rows.find(r => /^winner\s+quote$/i.test((r[0] || "").trim()));
  return row ? (row[1] || "").trim() : "";
}

// Shows the italicized, quoted "Winner Quote" line under the podium if
// one is set in the sheet; hides it if not.
function applyWinnerQuote(quote) {
  const el = document.getElementById("winner-quote");
  const textEl = document.getElementById("winner-quote-text");
  if (!el || !textEl) return;
  const trimmed = (quote || "").trim();
  if (!trimmed) {
    el.hidden = true;
    textEl.textContent = "";
    return;
  }
  textEl.textContent = trimmed;
  el.hidden = false;
}

// Looks for a row shaped like "Loser Quote" anywhere in the sheet and
// returns its value, or "" if there isn't one (applyLoserQuote hides
// the quote line under The Dumpster in that case).
function extractLoserQuote(rows) {
  const row = rows.find(r => /^loser\s+quote$/i.test((r[0] || "").trim()));
  return row ? (row[1] || "").trim() : "";
}

// Shows the italicized, quoted "Loser Quote" line under The Dumpster if
// one is set in the sheet; hides it if not.
function applyLoserQuote(quote) {
  const el = document.getElementById("loser-quote");
  const textEl = document.getElementById("loser-quote-text");
  if (!el || !textEl) return;
  const trimmed = (quote || "").trim();
  if (!trimmed) {
    el.hidden = true;
    textEl.textContent = "";
    return;
  }
  textEl.textContent = trimmed;
  el.hidden = false;
}

// Looks for a row shaped like "Page Title" anywhere in the sheet and
// returns its value, or "" if there isn't one — in which case
// applyPageMeta leaves LEAGUE_NAME (data.js) showing instead.
function extractPageTitle(rows) {
  const row = rows.find(r => /^page\s+title$/i.test((r[0] || "").trim()));
  return row ? (row[1] || "").trim() : "";
}

// Looks for a row shaped like "Page Subtitle" anywhere in the sheet
// and returns its value, or "" if there isn't one — in which case
// applyPageMeta leaves the subtitle text already in index.html showing.
function extractPageSubtitle(rows) {
  const row = rows.find(r => /^page\s+subtitle$/i.test((r[0] || "").trim()));
  return row ? (row[1] || "").trim() : "";
}

// Swaps in the sheet's Page Title / Page Subtitle, if set, so the big
// title and the line underneath it can be controlled from the sheet
// just like everything else. Leaves whatever's already on the page
// (LEAGUE_NAME from data.js, and index.html's default subtitle text)
// untouched for whichever one isn't set in the sheet.
function applyPageMeta(meta) {
  if (meta && meta.title) {
    const titleEl = document.getElementById("league-name");
    if (titleEl) titleEl.textContent = meta.title;
  }
  if (meta && meta.subtitle) {
    const subtitleEl = document.getElementById("page-subtitle");
    if (subtitleEl) subtitleEl.textContent = meta.subtitle;
  }
}

function renderStandings(rows, head, body) {
  // The standings table starts at whichever row's first cell says
  // "Coach" — everything before that (e.g. Banner rows) is ignored here.
  const headerIndex = rows.findIndex(r => (r[0] || "").trim().toLowerCase() === "coach");
  if (headerIndex === -1) {
    showMessage(body, 'Couldn\'t find your standings table — make sure one row in the sheet starts with "Coach" in the first column.');
    return;
  }
  const header = rows[headerIndex];

  // Optional "Photo" column, one per coach. Not required anymore — by
  // default, each coach's podium/standings photo is looked up straight
  // from their Coach name (column A), matched to a file uploaded as
  // profpic_<coach name, lowercase>. A "Photo" column, if present and
  // filled in for a given coach, overrides that (e.g. to paste a full
  // image link, or use a different username than the Coach cell).
  const photoColIndex = header.findIndex(label => (label || "").trim().toLowerCase() === "photo");

  // Every other column (besides Coach, the optional Photo column, and
  // a literal "Total" column if the sheet has one) is a contest column
  // — shown in the table/podium using its header cell's exact text, in
  // the same left-to-right order it's in on the sheet. This is what
  // lets a column be named "NFL Season Opener" instead of being forced
  // into "Week 1" — type whatever you want as that column's header in
  // the sheet and it shows up exactly that way on the site.
  const contestColumns = [];
  header.forEach((label, colIndex) => {
    if (colIndex === 0 || colIndex === photoColIndex) return;
    const trimmed = (label || "").trim();
    if (!trimmed || trimmed.toLowerCase() === "total") return;
    contestColumns.push({ colIndex, label: trimmed });
  });

  // One data row per coach (column A = coach name). Skip blank rows and
  // any stray meta row (Banner/Commish Message/Page Title/Page
  // Subtitle), in case one ended up below the header. "League Leader" /
  // "Photo URL" are matched too, in case an older sheet still has that
  // row left over from before the Current Leader photo became
  // automatic — it's simply ignored now rather than treated as a coach.
  const coachRows = rows.slice(headerIndex + 1).filter(r => {
    const first = (r[0] || "").trim();
    return first !== ""
      && !/^banner\s+(active|text|link|countdown(?:\s+date|\s+time)?)$/i.test(first)
      && !/^(league\s+leader|photo\s+url)$/i.test(first)
      && !/^commish\s+(message|subject)$/i.test(first)
      && !/^page\s+(title|subtitle)$/i.test(first)
      && !/^winner\s+quote$/i.test(first)
      && !/^loser\s+quote$/i.test(first);
  });

  // Only keep contest columns where at least one coach has a result —
  // this is what hides not-yet-played contests before they happen.
  const visibleContestColumns = contestColumns.filter(cc =>
    coachRows.some(r => (r[cc.colIndex] || "").trim() !== "")
  );

  const rowsData = coachRows.map(r => {
    const name = r[0].trim();
    const weekCells = visibleContestColumns.map(cc => {
      const raw = (r[cc.colIndex] || "").trim();
      const place = raw ? parseInt(raw, 10) : undefined;
      return { colIndex: cc.colIndex, label: cc.label, place: Number.isFinite(place) ? place : undefined };
    });
    const total = weekCells.reduce((sum, cell) => {
      if (!cell.place) return sum;
      return sum + (POINTS_BY_PLACE[cell.place] || 0);
    }, 0);
    const podiumBase = typeof PODIUM_PHOTO_REPO_BASE !== "undefined" ? PODIUM_PHOTO_REPO_BASE : "";
    const photoOverride = photoColIndex !== -1 ? (r[photoColIndex] || "").trim() : "";
    const photoCandidates = resolvePhotoCandidates(photoOverride || name, podiumBase);
    return { name, weekCells, total, photoCandidates };
  });

  // Highest total first; alphabetical by name as a tiebreaker.
  rowsData.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

  // For each contest column, the worst (highest-numbered) place anyone
  // got that week — used to mark that cell with a poop badge instead of
  // a plain place, below. Only counts as "last place" when it's outside
  // the medal range (4th or worse); with 3 or fewer coaches, whoever
  // finished last already has a medal, so there's no separate poop
  // badge to add. Ties for last all get marked, same as the medals.
  const lastPlaceByCol = {};
  visibleContestColumns.forEach(cc => {
    let worst = 0;
    rowsData.forEach(row => {
      const cell = row.weekCells.find(c => c.colIndex === cc.colIndex);
      if (cell && cell.place && cell.place > worst) worst = cell.place;
    });
    lastPlaceByCol[cc.colIndex] = worst > 3 ? worst : null;
  });

  // The single worst season Total gets a poop badge too — but only if
  // exactly one coach has it. A tie for last means no one gets singled
  // out. Same medal-range exception as above: with 3 or fewer coaches,
  // last place already has a trophy.
  const totals = rowsData.map(row => row.total);
  const worstTotal = totals.length ? Math.min(...totals) : null;
  const worstTotalIsUnique = worstTotal !== null && totals.filter(t => t === worstTotal).length === 1;

  // Whoever ends up on top after sorting is the "Current Leader" —
  // shown with their own standings/podium photo (or no panel at all,
  // if they don't have one), automatically following the points lead
  // as it changes week to week.
  const leaderNameEl = document.getElementById("leader-name");
  if (leaderNameEl) {
    leaderNameEl.textContent = rowsData.length ? rowsData[0].name : "";
  }
  applyPhoto(rowsData.length ? rowsData[0].photoCandidates : []);

  renderPodium(rowsData, visibleContestColumns, extractWinnerQuote(rows));
  renderDumpster(rowsData, visibleContestColumns, extractLoserQuote(rows));

  // --- Header --- (each contest column's <th> uses its exact sheet
  // header text, built as DOM text nodes rather than innerHTML so a
  // column name is never accidentally parsed as markup.)
  head.innerHTML = "";
  const headRow = document.createElement("tr");
  const coachTh = document.createElement("th");
  coachTh.textContent = "Coach";
  headRow.appendChild(coachTh);
  visibleContestColumns.forEach(cc => {
    const th = document.createElement("th");
    th.textContent = cc.label;
    headRow.appendChild(th);
  });
  const totalTh = document.createElement("th");
  totalTh.textContent = "Total";
  headRow.appendChild(totalTh);
  head.appendChild(headRow);

  // --- Body ---
  body.innerHTML = "";
  if (rowsData.length === 0) {
    showMessage(body, "No coaches found — check that your sheet has one row per coach under the header row.");
    return;
  }

  rowsData.forEach((row, i) => {
    const tr = document.createElement("tr");
    const rank = i + 1;
    if (rank <= 3) tr.classList.add("rank-" + rank);

    const nameTd = document.createElement("td");
    nameTd.className = "coach-cell";
    if (row.photoCandidates && row.photoCandidates.length) {
      const img = document.createElement("img");
      img.className = "coach-avatar";
      img.alt = "";
      loadImageWithFallback(img, row.photoCandidates, () => {
        img.replaceWith(makeSilhouette("coach-avatar coach-avatar-silhouette"));
      });
      nameTd.appendChild(img);
    } else {
      nameTd.appendChild(makeSilhouette("coach-avatar coach-avatar-silhouette"));
    }
    const nameSpan = document.createElement("span");
    nameSpan.textContent = row.name;
    nameTd.appendChild(nameSpan);

    const weekTds = row.weekCells
      .map(cell => {
        if (!cell.place) return `<td class="week-cell">&ndash;</td>`;
        const isLast = lastPlaceByCol[cell.colIndex] !== null && cell.place === lastPlaceByCol[cell.colIndex];
        return `<td class="week-cell">${placeCellHtml(cell.place, isLast)}</td>`;
      })
      .join("");
    const isWorstTotal = rank > 3 && worstTotalIsUnique && row.total === worstTotal;
    const totalTd = `<td class="total-cell">${totalCellHtml(row.total, rank, isWorstTotal)}</td>`;

    tr.appendChild(nameTd);
    tr.insertAdjacentHTML("beforeend", weekTds + totalTd);
    body.appendChild(tr);
  });
}

// Builds the "Most Recent Podium" section: the 1st/2nd/3rd place
// finishers of the most recently played contest (the rightmost visible
// contest column on the sheet), each with their photo (looked up from
// their name, or overridden by the sheet's optional Photo column) — or
// a default silhouette if no matching photo file exists, or if their
// photo fails to load. The label next to the heading (e.g. "Week 3", or
// "NFL Season Opener") is always that column's own header text from the
// sheet, whatever it's been named. winnerQuote (from the sheet's
// optional Winner Quote row) shows as an italicized, quoted line
// centered under the podium, and hides along with the rest of this
// section when there's no podium to show.
function renderPodium(rowsData, visibleContestColumns, winnerQuote) {
  const section = document.getElementById("podium-section");
  const track = document.getElementById("podium");
  const weekLabel = document.getElementById("podium-week-label");
  if (!section || !track) return;

  if (!visibleContestColumns.length) {
    section.hidden = true;
    applyWinnerQuote("");
    return;
  }

  const targetColumn = visibleContestColumns[visibleContestColumns.length - 1];

  const placements = {};
  rowsData.forEach(row => {
    const cell = row.weekCells.find(c => c.colIndex === targetColumn.colIndex);
    if (cell && cell.place >= 1 && cell.place <= 3 && !placements[cell.place]) {
      placements[cell.place] = row;
    }
  });

  if (!placements[1] && !placements[2] && !placements[3]) {
    section.hidden = true;
    applyWinnerQuote("");
    return;
  }

  if (weekLabel) weekLabel.textContent = targetColumn.label;
  applyWinnerQuote(winnerQuote);

  track.innerHTML = "";
  [2, 1, 3].forEach(place => {
    const row = placements[place];
    if (!row) return;
    track.appendChild(buildPodiumSlot(place, row));
  });

  section.hidden = false;
}

function buildPodiumSlot(place, row) {
  const slot = document.createElement("div");
  slot.className = "podium-slot podium-slot-" + place;

  const photoWrap = document.createElement("div");
  photoWrap.className = "podium-photo-wrap";
  if (row.photoCandidates && row.photoCandidates.length) {
    const img = document.createElement("img");
    img.className = "podium-photo";
    img.alt = row.name;
    loadImageWithFallback(img, row.photoCandidates, () => {
      img.replaceWith(makeSilhouette("podium-photo podium-silhouette"));
    });
    photoWrap.appendChild(img);
  } else {
    photoWrap.appendChild(makeSilhouette("podium-photo podium-silhouette"));
  }

  // 1st place only gets the slow sweeping sheen across their photo —
  // a little extra shine for the winner.
  if (place === 1) {
    photoWrap.insertAdjacentHTML("beforeend", `<span class="lens-flare lens-flare-podium" aria-hidden="true"></span>`);
  }

  const name = document.createElement("div");
  name.className = "podium-name";
  name.textContent = row.name;

  const step = document.createElement("div");
  step.className = "podium-step";
  const medal = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" }[place];
  const label = document.createElement("span");
  label.className = "podium-place";
  label.textContent = medal + " " + ordinal(place);
  step.appendChild(label);

  slot.appendChild(photoWrap);
  slot.appendChild(name);
  slot.appendChild(step);
  return slot;
}

// Builds "The Dumpster": whoever finished LAST in the most recent
// contest (the same rightmost visible contest column the podium uses),
// shown peeking out of a dumpster graphic with a poop-emoji crown. If
// more than one coach tied for last that week, all of them show up
// side by side. Hides entirely if there's no contest data yet.
// loserQuote (from the sheet's optional Loser Quote row) shows as an
// italicized, quoted line under the dumpster, with a stink cloud
// rising off the top of its box — hides along with the rest of this
// section when there's no dumpster to show.
function renderDumpster(rowsData, visibleContestColumns, loserQuote) {
  const section = document.getElementById("dumpster-section");
  const photoRow = document.getElementById("dumpster-photo-row");
  const nameEl = document.getElementById("dumpster-name");
  const weekLabel = document.getElementById("dumpster-week-label");
  if (!section || !photoRow || !nameEl) return;

  if (!visibleContestColumns.length) {
    section.hidden = true;
    applyLoserQuote("");
    return;
  }

  const targetColumn = visibleContestColumns[visibleContestColumns.length - 1];

  let worst = 0;
  rowsData.forEach(row => {
    const cell = row.weekCells.find(c => c.colIndex === targetColumn.colIndex);
    if (cell && cell.place && cell.place > worst) worst = cell.place;
  });

  if (!worst) {
    section.hidden = true;
    applyLoserQuote("");
    return;
  }

  const losers = rowsData.filter(row => {
    const cell = row.weekCells.find(c => c.colIndex === targetColumn.colIndex);
    return cell && cell.place === worst;
  });

  if (weekLabel) weekLabel.textContent = targetColumn.label;

  photoRow.innerHTML = "";
  losers.forEach(row => {
    if (row.photoCandidates && row.photoCandidates.length) {
      const img = document.createElement("img");
      img.className = "dumpster-photo";
      img.alt = row.name;
      loadImageWithFallback(img, row.photoCandidates, () => {
        img.replaceWith(makeSilhouette("dumpster-photo-silhouette"));
      });
      photoRow.appendChild(img);
    } else {
      photoRow.appendChild(makeSilhouette("dumpster-photo-silhouette"));
    }
  });

  nameEl.textContent = losers.map(row => row.name).join(" & ");
  section.hidden = false;
  applyLoserQuote(loserQuote);
}

// A plain default avatar for a coach with no photo set (or whose photo
// failed to load) — a generic head-and-shoulders silhouette. className
// controls its size/placement (see the podium and coach-cell call sites).
function makeSilhouette(className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<circle class="sil-bg" cx="32" cy="32" r="32"/>' +
    '<circle class="sil-fg" cx="32" cy="25" r="12"/>' +
    '<path class="sil-fg" d="M8 58c2-14 14-22 24-22s22 8 24 22"/>';
  return svg;
}

function showMessage(body, text) {
  body.innerHTML = `<tr><td class="status-message" colspan="99">${escapeHtml(text)}</td></tr>`;
}

// A week's place cell: top 3 finishers get a colored ribbon badge with a
// medal; whoever finished last that week (isLast, from renderStandings —
// only set for 4th place or worse, so it never overlaps a medal) gets a
// brown badge with a poop emoji instead; everyone else just gets the
// plain ordinal (1st, 2nd, 3rd, 4th...).
function placeCellHtml(place, isLast) {
  const label = ordinal(place);
  if (place >= 1 && place <= 3) {
    const medal = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" }[place];
    return `<span class="place-badge place-${place}">${medal} ${label}</span>`;
  }
  if (isLast) {
    return `<span class="place-badge place-last">\u{1F4A9} ${label}</span>`;
  }
  return label;
}

// The Total cell for the top 3 coaches overall gets a trophy badge; the
// single coach with the worst season total (isWorstTotal, from
// renderStandings — unset if there's a tie for last, or if there are 3
// or fewer coaches total) gets a brown poop badge; everyone else just
// gets the plain number.
function totalCellHtml(total, rank, isWorstTotal) {
  if (rank >= 1 && rank <= 3) {
    return `<span class="trophy-badge trophy-${rank}">\u{1F3C6} ${total}</span>`;
  }
  if (isWorstTotal) {
    return `<span class="trophy-badge trophy-last">\u{1F4A9} ${total}</span>`;
  }
  return total;
}

// 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th", ...
function ordinal(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// A small CSV parser that handles quoted fields (so coach names or
// handles containing a comma still work).
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = "";
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
