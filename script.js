// This file does the rendering. You shouldn't need to edit it —
// everything you change week to week lives in data.js.

document.addEventListener("DOMContentLoaded", () => {
  // League name
  document.getElementById("league-name").textContent = LEAGUE_NAME;
  document.title = LEAGUE_NAME + " — Standings";

  // Announcement banner
  if (ANNOUNCEMENT && ANNOUNCEMENT.active) {
    const banner = document.getElementById("banner");
    document.getElementById("banner-text").textContent = ANNOUNCEMENT.text;
    document.getElementById("banner-link").href = ANNOUNCEMENT.link;
    banner.hidden = false;
  }

  // Standings table — sort by wins desc, then points desc
  const sorted = [...STANDINGS].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.points - a.points;
  });

  const body = document.getElementById("standings-body");
  sorted.forEach((row, i) => {
    const tr = document.createElement("tr");
    const rank = i + 1;
    if (rank <= 3) tr.classList.add("rank-" + rank);

    tr.innerHTML = `
      <td class="rank">${rank}</td>
      <td>${escapeHtml(row.name)}</td>
      <td>${row.wins}</td>
      <td>${row.points}</td>
    `;
    body.appendChild(tr);
  });
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
