// ============================================================
//  SETTINGS — set these once, they rarely change.
//  Your coaches and weekly results now live in your Google Sheet,
//  not in this file. See SETUP-GUIDE.md for how to connect it.
// ============================================================

// The name shown at the top of the page.
const LEAGUE_NAME = "Your League Name Here";

// --------------------------------------------------------------
// THIS WEEK'S ANNOUNCEMENT BANNER (fallback / default)
// Shows a highlighted bar at the top of the page with a link to
// this week's DraftKings contest.
//   active: true  -> banner is shown
//   active: false -> banner is hidden (e.g. between weeks)
//
// You can instead control this from your Google Sheet each week —
// see SETUP-GUIDE.md, Part 8, "Adding the banner to the sheet."
// If your sheet has Banner rows, they override what's set here;
// this is just what shows before the sheet loads, or if you never
// add Banner rows to the sheet at all.
// --------------------------------------------------------------
const ANNOUNCEMENT = {
  active: true,
  text: "Week 1 contest is live — click here to enter on DraftKings!",
  link: "https://www.draftkings.com/"
};

// --------------------------------------------------------------
// POINTS
// How many season-standings points each finishing place is worth.
// Any place not listed here (4th and below) is worth 0 points.
// --------------------------------------------------------------
const POINTS_BY_PLACE = {
  1: 5,
  2: 3,
  3: 1,
};

// --------------------------------------------------------------
// GOOGLE SHEET
// Paste your sheet's CSV export link here. See SETUP-GUIDE.md,
// Part 8, for exactly how to get this link — it must be the CSV
// link (contains "format=csv" or "output=csv"), not a regular
// docs.google.com/.../edit link, or the page won't be able to
// read it.
//
// Your sheet should have one row per coach, with a "Coach" header
// row above them:
//
//   Coach                 | Week 1 | Week 2 | Week 3 | ...
//   Ally (allydee18)      |   2    |        |        |
//   Tate (tateboyce)      |   4    |        |        |
//   ...
//
// Leave a cell blank for a coach who hasn't played that week yet
// — the page automatically only shows weeks with at least one
// result filled in, and skips blank cells for anyone else.
//
// Optionally, add rows ABOVE the "Coach" row to control the
// banner from the sheet instead of the ANNOUNCEMENT block above:
//
//   Banner Active | TRUE
//   Banner Text   | Week 3 contest is live!
//   Banner Link   | https://www.draftkings.com/...
//
// --------------------------------------------------------------
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1i0RPTsLocLLkUhVbfsHhdhwat_xBpcATwYkoSmd6Z4Q/edit?gid=0#gid=0";
