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

function applyBanner(ann) {
  const banner = document.getElementById("banner");
  if (ann && ann.active && ann.text && ann.link) {
    document.getElementById("banner-text").textContent = ann.text;
    document.getElementById("banner-link").href = ann.link;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

// Shows the "Message from the Commish" terminal box if a Commish
// Message was set in the sheet; hides it if not.
function applyCommishMessage(message) {
  const section = document.getElementById("commish-section");
  const text = document.getElementById("commish-message");
  if (!message) {
    section.hidden = true;
    return;
  }
  text.textContent = message;
  section.hidden = false;
}

// Shows the photo panel if a League Leader photo was set in the sheet;
// hides it (and gracefully falls back) if not set, or if none of the
// candidate image URLs (see resolvePhotoCandidates) load successfully.
function applyPhoto(candidates) {
  const panel = document.getElementById("photo-panel");
  const img = document.getElementById("team-photo");
  if (!candidates || !candidates.length) {
    panel.hidden = true;
    return;
  }
  img.onload = () => { panel.hidden = false; };
  loadImageWithFallback(img, candidates, () => { panel.hidden = true; });
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

    // Optional Banner rows, a League Leader row, and a Commish Message
    // row anywhere above the "Coach" header row let the sheet control
    // those too — see the Instructions tab in the sheet.
    const bannerFromSheet = extractBannerRows(rows);
    if (bannerFromSheet) applyBanner(bannerFromSheet);
    applyPhoto(extractLeagueLeaderPhoto(rows));
    applyCommishMessage(extractCommishMessage(rows));

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
// Link" anywhere in the sheet and turns them into a banner object.
// Returns null if none of those rows are present (so the caller keeps
// whatever banner data.js already set).
function extractBannerRows(rows) {
  const map = {};
  rows.forEach(r => {
    const match = /^banner\s+(active|text|link)$/i.exec((r[0] || "").trim());
    if (match) map[match[1].toLowerCase()] = (r[1] || "").trim();
  });
  if (!map.active && !map.text && !map.link) return null;
  return {
    active: /^(true|yes|1|on)$/i.test(map.active || ""),
    text: map.text || "",
    link: map.link || "",
  };
}

// Looks for a row shaped like "League Leader" anywhere in the sheet and
// returns a list of image URLs to try, or [] if there isn't one.
// ("Photo URL" is accepted too, since that was this row's name before —
// no need to rename it in an existing sheet unless you want to.)
function extractLeagueLeaderPhoto(rows) {
  const row = rows.find(r => /^(league\s+leader|photo\s+url)$/i.test((r[0] || "").trim()));
  const base = typeof PHOTO_REPO_BASE !== "undefined" ? PHOTO_REPO_BASE : "";
  return row ? resolvePhotoCandidates((row[1] || "").trim(), base) : [];
}

// Turns a sheet's photo cell into a list of image URLs to try, in
// order. If it's already a full link (starts with http), that's the
// only candidate — used as-is. Otherwise it's treated as a username
// and turned into a standard photo link using the given base —
// PHOTO_REPO_BASE for League Leader, or PODIUM_PHOTO_REPO_BASE for the
// per-coach Photo column (see data.js) — tried as .jpg, .jpeg, then
// .png, since it's easy to upload a photo as the "wrong" file type
// without noticing.
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

function renderStandings(rows, head, body) {
  // The standings table starts at whichever row's first cell says
  // "Coach" — everything before that (e.g. Banner rows) is ignored here.
  const headerIndex = rows.findIndex(r => (r[0] || "").trim().toLowerCase() === "coach");
  if (headerIndex === -1) {
    showMessage(body, 'Couldn\'t find your standings table — make sure one row in the sheet starts with "Coach" in the first column.');
    return;
  }
  const header = rows[headerIndex];

  // Find every column whose header looks like "Week N" (case-insensitive).
  const weekColumns = [];
  header.forEach((label, colIndex) => {
    const match = /week\s*(\d+)/i.exec(label || "");
    if (match) weekColumns.push({ colIndex, week: parseInt(match[1], 10) });
  });
  weekColumns.sort((a, b) => a.week - b.week);

  // One data row per coach (column A = coach name). Skip blank rows and
  // any stray meta row (Banner/Photo URL/Commish Message), in case one
  // ended up below the header.
  const coachRows = rows.slice(headerIndex + 1).filter(r => {
    const first = (r[0] || "").trim();
    return first !== ""
      && !/^banner\s+(active|text|link)$/i.test(first)
      && !/^(league\s+leader|photo\s+url)$/i.test(first)
      && !/^commish\s+message$/i.test(first);
  });

  // Optional "Photo" column, one per coach, used for the weekly podium
  // below. Not required — coaches without one just get a default
  // silhouette on the podium.
  const photoColIndex = header.findIndex(label => (label || "").trim().toLowerCase() === "photo");

  // Only keep week columns where at least one coach has a result —
  // this is what hides Week 5, Week 6, etc. before they happen.
  const visibleWeekColumns = weekColumns.filter(wc =>
    coachRows.some(r => (r[wc.colIndex] || "").trim() !== "")
  );

  const rowsData = coachRows.map(r => {
    const name = r[0].trim();
    const weekCells = visibleWeekColumns.map(wc => {
      const raw = (r[wc.colIndex] || "").trim();
      const place = raw ? parseInt(raw, 10) : undefined;
      return { week: wc.week, place: Number.isFinite(place) ? place : undefined };
    });
    const total = weekCells.reduce((sum, cell) => {
      if (!cell.place) return sum;
      return sum + (POINTS_BY_PLACE[cell.place] || 0);
    }, 0);
    const podiumBase = typeof PODIUM_PHOTO_REPO_BASE !== "undefined" ? PODIUM_PHOTO_REPO_BASE : "";
    const photoCandidates = photoColIndex !== -1 ? resolvePhotoCandidates(r[photoColIndex], podiumBase) : [];
    return { name, weekCells, total, photoCandidates };
  });

  // Highest total first; alphabetical by name as a tiebreaker.
  rowsData.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

  // Whoever ends up on top after sorting is shown as the "Current
  // Leader" above the photo, if a photo is showing.
  const leaderNameEl = document.getElementById("leader-name");
  if (leaderNameEl) {
    leaderNameEl.textContent = rowsData.length ? rowsData[0].name : "";
  }

  renderPodium(rowsData, visibleWeekColumns);

  // --- Header ---
  head.innerHTML = "";
  const headRow = document.createElement("tr");
  headRow.innerHTML =
    "<th>Coach</th>" +
    visibleWeekColumns.map(wc => `<th>Week ${wc.week}</th>`).join("") +
    "<th>Total</th>";
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
// finishers of the most recently played week (the highest-numbered
// visible week column), each with their photo from the sheet's Photo
// column — or a default silhouette if they don't have one set, or if
// their photo fails to load.
function renderPodium(rowsData, visibleWeekColumns) {
  const section = document.getElementById("podium-section");
  const track = document.getElementById("podium");
  const weekLabel = document.getElementById("podium-week-label");
  if (!section || !track) return;

  if (!visibleWeekColumns.length) {
    section.hidden = true;
    return;
  }

  const targetWeek = visibleWeekColumns[visibleWeekColumns.length - 1].week;

  const placements = {};
  rowsData.forEach(row => {
    const cell = row.weekCells.find(c => c.week === targetWeek);
    if (cell && cell.place >= 1 && cell.place <= 3 && !placements[cell.place]) {
      placements[cell.place] = row;
    }
  });

  if (!placements[1] && !placements[2] && !placements[3]) {
    section.hidden = true;
    return;
  }

  if (weekLabel) weekLabel.textContent = "Week " + targetWeek;

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
