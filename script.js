// This file does the rendering. You shouldn't need to edit it —
// everything you change week to week lives in data.js.

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

  renderStandings();
});

function renderStandings() {
  // Only show columns for weeks that actually have data, in order.
  const weeks = [...WEEKLY_RESULTS]
    .map(w => w.week)
    .sort((a, b) => a - b);

  // Points earned by each coach, per week, plus their running total.
  const rows = COACHES.map(coach => {
    const weekCells = weeks.map(weekNum => {
      const weekData = WEEKLY_RESULTS.find(w => w.week === weekNum);
      const place = weekData && weekData.places ? weekData.places[coach.name] : undefined;
      return { week: weekNum, place };
    });

    const total = weekCells.reduce((sum, cell) => {
      if (!cell.place) return sum;
      return sum + (POINTS_BY_PLACE[cell.place] || 0);
    }, 0);

    return { coach, weekCells, total };
  });

  // Highest total first; alphabetical by name as a tiebreaker.
  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.coach.name.localeCompare(b.coach.name);
  });

  // --- Header ---
  const head = document.getElementById("standings-head");
  const headRow = document.createElement("tr");
  headRow.innerHTML =
    "<th>Coach</th>" +
    weeks.map(w => `<th>Week ${w}</th>`).join("") +
    "<th>Total</th>";
  head.appendChild(headRow);

  // --- Body ---
  const body = document.getElementById("standings-body");
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    const rank = i + 1;
    if (rank <= 3) tr.classList.add("rank-" + rank);

    const nameCell = `<td class="coach-cell">${escapeHtml(row.coach.name)} <span class="handle">(${escapeHtml(row.coach.handle)})</span></td>`;
    const weekTds = row.weekCells
      .map(cell => `<td class="week-cell">${cell.place ? placeCellHtml(cell.place) : "&ndash;"}</td>`)
      .join("");
    const totalTd = `<td class="total-cell">${totalCellHtml(row.total, rank)}</td>`;

    tr.innerHTML = nameCell + weekTds + totalTd;
    body.appendChild(tr);
  });
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
