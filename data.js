// ============================================================
//  SETTINGS — set these once, they rarely change.
//  Your coaches and weekly results now live in your Google Sheet,
//  not in this file. See SETUP-GUIDE.md for how to connect it.
// ============================================================

// The name shown at the top of the page.
const LEAGUE_NAME = "Your League Name Here";

// --------------------------------------------------------------
// THIS WEEK'S ANNOUNCEMENT BANNER
// Shows a highlighted bar at the top of the page with a link to
// this week's DraftKings contest.
//   active: true  -> banner is shown
//   active: false -> banner is hidden (e.g. between weeks)
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
// Paste the "publish to web" CSV link for your sheet here.
// See SETUP-GUIDE.md, section "Connecting the Google Sheet", for
// exactly how to get this link (Google Sheets -> File -> Share ->
// Publish to web -> choose CSV -> Publish -> copy the link).
//
// Your sheet should look like this, one row per coach:
//
//   Coach                 | Week 1 | Week 2 | Week 3 | ...
//   Ally (allydee18)      |   2    |        |        |
//   Tate (tateboyce)      |   4    |        |        |
//   ...
//
// Leave a cell blank for a coach who hasn't played that week yet
// — the page automatically only shows weeks with at least one
// result filled in, and skips blank cells for anyone else.
// --------------------------------------------------------------
const SHEET_CSV_URL = "PASTE_YOUR_PUBLISHED_CSV_LINK_HERE";
