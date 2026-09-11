// This file does the rendering. You shouldn't need to edit it —
// your league name, banner, and points settings live in data.js,
// and your coaches + weekly results live in your Google Sheet.

document.addEventListener("DOMContentLoaded", () => {
  // League name
  document.getElementById("league-name").textContent = LEAGUE_NAME;
  document.title = LEAGUE_NAME + " — Standings";

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
    return null;
  }

  const tick = () => {
    const msLeft = deadline.getTime() - Date.now();
    countdownEl.hidden = false;
    if (msLeft <= 0) {
      countdownEl.textContent = "Contest locked";
      clearInterval(intervalId);
      countdownInterval = null;
      return;
    }
    countdownEl.textContent = "Locks in " + formatCountdown(msLeft);
  };

  tick();
  const intervalId = setInterval(tick, 1000);
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
  } catch (err) {
    console.error("Couldn't load standings from Google Sheet:", err);
    const message = err && err.message && err.message.indexOf("web page instead of CSV") !== -1
      ? err.message
      : "Couldn't load standings right now. Check back in a bit, or double-check the sheet is published and SHEET_CSV_URL in data.js is correct.";
    showMessage(body, message);
  }
}

// Looks for rows shaped like "Banner Active" / "Banner Text" / "Banner
// Link" / "Banner Countdown" anywhere in the sheet and turns them into
// a banner object. Returns null if none of those rows are present (so
// the caller keeps whatever banner data.js already set).
function extractBannerRows(rows) {
  const map = {};
  rows.forEach(r => {
    const match = /^banner\s+(active|text|link|countdown)$/i.exec((r[0] || "").trim());
    if (match) map[match[1].toLowerCase()] = (r[1] || "").trim();
  });
  if (!map.active && !map.text && !map.link && !map.countdown) return null;
  return {
    active: /^(true|yes|1|on)$/i.test(map.active || ""),
    text: map.text || "",
    link: map.link || "",
    deadline: map.countdown || "",
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
    document.title = meta.title + " — Standings";
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
      && !/^banner\s+(active|text|link|countdown)$/i.test(first)
      && !/^(league\s+leader|photo\s+url)$/i.test(first)
      && !/^commish\s+(message|subject)$/i.test(first)
      && !/^page\s+(title|subtitle)$/i.test(first);
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

  // Whoever ends up on top after sorting is the "Current Leader" —
  // shown with their own standings/podium photo (or no panel at all,
  // if they don't have one), automatically following the points lead
  // as it changes week to week.
  const leaderNameEl = document.getElementById("leader-name");
  if (leaderNameEl) {
    leaderNameEl.textContent = rowsData.length ? rowsData[0].name : "";
  }
  applyPhoto(rowsData.length ? rowsData[0].photoCandidates : []);

  renderPodium(rowsData, visibleContestColumns);

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
      .map(cell => `<td class="week-cell">${cell.place ? placeCellHtml(cell.place) : "&ndash;"}</td>`)
      .join("");
    const totalTd = `<td class="total-cell">${totalCellHtml(row.total, rank)}</td>`;

    tr.appendChild(nameTd);
    tr.insertAdjacentHTML("beforeend", weekTds + totalTd);
    body.appendChild(tr);
  });
}

// Builds the "This Week's Podium" section: the 1st/2nd/3rd place
// finishers of the most recently played contest (the rightmost visible
// contest column on the sheet), each with their photo (looked up from
// their name, or overridden by the sheet's optional Photo column) — or
// a default silhouette if no matching photo file exists, or if their
// photo fails to load. The label next to the heading (e.g. "Week 3", or
// "NFL Season Opener") is always that column's own header text from the
// sheet, whatever it's been named.
function renderPodium(rowsData, visibleContestColumns) {
  const section = document.getElementById("podium-section");
  const track = document.getElementById("podium");
  const weekLabel = document.getElementById("podium-week-label");
  if (!section || !track) return;

  if (!visibleContestColumns.length) {
    section.hidden = true;
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
    return;
  }

  if (weekLabel) weekLabel.textContent = targetColumn.label;

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
// medal; everyone else just gets the plain ordinal (1st, 2nd, 3rd, 4th...).
function placeCellHtml(place) {
  const label = ordinal(place);
  if (place >= 1 && place <= 3) {
    const medal = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" }[place];
    return `<span class="place-badge place-${place}">${medal} ${label}</span>`;
  }
  return label;
}

// The Total cell for the top 3 coaches overall gets a trophy badge;
// everyone else just gets the plain number.
function totalCellHtml(total, rank) {
  if (rank >= 1 && rank <= 3) {
    return `<span class="trophy-badge trophy-${rank}">\u{1F3C6} ${total}</span>`;
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
