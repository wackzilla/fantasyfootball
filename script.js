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
      .map(cell => `<td class="week-cell">${cell.place ? cell.place : "&ndash;"}</td>`)
      .join("");
    const totalTd = `<td class="total-cell">${row.total}</td>`;

    tr.innerHTML = nameCell + weekTds + totalTd;
    body.appendChild(tr);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
