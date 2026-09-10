// ============================================================
//  SETTINGS — set these once, they rarely change.
//  Your coaches and weekly results now live in your Google Sheet,
//  not in this file. See SETUP-GUIDE.md for how to connect it.
// ============================================================

// The name shown at the top of the page.
const LEAGUE_NAME = "Viva la Fútbol";

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
  active: false,
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
// SITE PASSCODE (very basic — read this before relying on it)
// If set, visitors must enter this code once per browser before
// they can see the site. Leave as "" (empty quotes) to disable
// the passcode screen entirely.
//
// IMPORTANT: this is NOT real security. This is a public static
// site with no server, login system, or database behind it —
// anyone who opens their browser's "View Page Source" can read
// this code directly out of the page in about five seconds, the
// same way you're reading it here. It's a speed bump to keep
// search engines and people who stumble onto the link by accident
// out, not protection against anyone who's actually trying to get
// in. Since nothing on this site is sensitive (it's fantasy
// football standings), that trade-off is fine — just don't treat
// this as if it were a real password.
// --------------------------------------------------------------
const SITE_PASSCODE = "1941";

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
// banner from the sheet instead of the ANNOUNCEMENT block above,
// to show a photo to the left of the standings table, and/or to
// show a "message from the Commish" text box on the page:
//
//   Banner Active   | TRUE
//   Banner Text     | Week 3 contest is live!
//   Banner Link     | https://www.draftkings.com/...
//   League Leader   | https://raw.githubusercontent.com/you/repo/main/photo.jpg
//   Commish Message | Don't forget to set your lineup by Sunday!
//
// For League Leader, upload an image file to your GitHub repo (same
// as any other file — Add file -> Upload files), then use its raw
// link. Leave the row out (or the cell blank) to show no photo. (This
// row used to be called "Photo URL" — that name still works too, no
// need to rename it in an existing sheet.)
//
// For Commish Message, whatever you type shows in a code-block/
// terminal-style box on the page. Leave the row out (or the cell
// blank) to hide that section entirely.
//
// You can also add a "Photo" COLUMN (not a row) next to "Coach" in
// the standings table itself, one photo link per coach:
//
//   Coach                 | Photo                                          | Week 1 | ...
//   Ally (allydee18)      | https://raw.githubusercontent.com/you/repo/main/currentleader_allydee18.jpg | 2 |
//
// This powers "This Week's Podium" near the top of the page, which
// automatically shows the 1st/2nd/3rd place finishers of the most
// recently played week with their photo from this column. Leave a
// coach's Photo cell blank and they just get a default silhouette
// on the podium instead — totally fine, no photo required.
// --------------------------------------------------------------
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1i0RPTsLocLLkUhVbfsHhdhwat_xBpcATwYkoSmd6Z4Q/export?format=csv&gid=1064215180";
