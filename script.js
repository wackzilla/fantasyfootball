// This file does the rendering. You shouldn't need to edit it —
// your league name, banner, and points settings live in data.js,
// and your coaches + weekly results live in your Google Sheet.

document.addEventListener("DOMContentLoaded", () => {
  // League name
  document.getElementById("league-name").textContent = LEAGUE_NAME;
  document.title = LEAGUE_NAME + " — Standings";

  // Announcement banner
  if (typeof ANNOUNCEMENT !== "undefined" && ANNOUNCEMENT.active) {
    const banner = document.getElementById("banner");
    document.getElementById("banner-text").textContent = ANNOUNCEMENT.text;
    document.getElementById("banner-link").href = ANNOUNCEMENT.link;
    banner.hidden = false;
  }

  loadStandings();
});

async function loadStandings() {
  const head = document.getElementById("standings-head");
  const body = document.getElementById("standings-body");

  if (!SHEET_CSV_URL || SHEET_CSV_URL.indexOf("PASTE_YOUR") === 0) {
    showMessage(body, "Set SHEET_CSV_URL in data.js to connect your Google Sheet — see SETUP-GUIDE.md.");
    return;
  }

  showMessage(body, "Loading standings…");

  try {
    // Cache-bust so we always get the latest published version of the
    // sheet, not a stale copy the browser (or a phone) has cached.
    const url = SHEET_CSV_URL + (SHEET_CSV_URL.indexOf("?") === -1 ? "?" : "&") + "_=" + Date.now();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const csvText = await response.text();
    const rows = parseCSV(csvText).filter(r => r.some(cell => cell.trim() !== ""));

    if (rows.length < 2) throw new Error("Sheet looks empty");

    renderStandings(rows, head, body);
  } catch (err) {
    console.error("Couldn't load standings from Google Sheet:", err);
    showMessage(body, "Couldn't load standings right now. Check back in a bit, or double-check the sheet is published and SHEET_CSV_URL in data.js is correct.");
  }
}

function renderStandings(rows, head, body) {
  const header = rows[0];

  // Find every column whose header looks like "Week N" (case-insensitive).
  const weekColumns = [];
  header.forEach((label, colIndex) => {
    const match = /week\s*(\d+)/i.exec(label || "");
    if (match) weekColumns.push({ colIndex, week: parseInt(match[1], 10) });
  });
  weekColumns.sort((a, b) => a.week - b.week);

  // One data row per coach (column A = coach name). Skip blank rows.
  const coachRows = rows.slice(1).filter(r => (r[0] || "").trim() !== "");

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
    return { name, weekCells, total };
  });

  // Highest total first; alphabetical by name as a tiebreaker.
  rowsData.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

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

    const nameCell = `<td class="coach-cell">${escapeHtml(row.name)}</td>`;
    const weekTds = row.weekCells
      .map(cell => `<td class="week-cell">${cell.place ? placeCellHtml(cell.place) : "&ndash;"}</td>`)
      .join("");
    const totalTd = `<td class="total-cell">${totalCellHtml(row.total, rank)}</td>`;

    tr.innerHTML = nameCell + weekTds + totalTd;
    body.appendChild(tr);
  });
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
