// ============================================================
//  SETTINGS — set these once, they rarely change.
//  Your coaches and weekly results now live in your Google Sheet,
//  not in this file — see the Instructions tab in that sheet.
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
// see the Instructions tab in that sheet for the Banner rows.
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
// PHOTOS — just type a username, not a full link
// There are two different kinds of photo, since they're shown in two
// different shapes on the page:
//
//   League Leader (the sheet row) -> the wide photo next to the
//   season standings table. Not cropped to a circle, so a normal
//   upright photo works fine as-is.
//
//   Photo (the per-coach column) -> the small circular headshot on
//   "This Week's Podium." Crop this one square with the face centered
//   before uploading, so it doesn't get awkwardly cut off.
//
// For either one, just type that coach's username instead of pasting
// the whole GitHub link, e.g. typing "DaBears4141" for League Leader
// is the same as pasting:
//   https://raw.githubusercontent.com/wackzilla/fantasyfootball/main/currentleader_dabears4141.jpg
// and typing "DaBears4141" in the Photo column is the same as pasting:
//   https://raw.githubusercontent.com/wackzilla/fantasyfootball/main/profpic_dabears4141.jpg
//
// That means every photo file uploaded to the repo needs to be named
// to match — "currentleader_" + username for League Leader photos,
// "profpic_" + username for podium photos, both all lowercase, e.g.
// currentleader_dabears4141.jpg and profpic_dabears4141.jpg. If you'd
// rather paste a full link instead (a different file type, a photo
// hosted somewhere else, etc.), that still works too, for either one —
// anything starting with "http" is used as-is instead of being turned
// into a username-based link.
// --------------------------------------------------------------
const PHOTO_REPO_BASE = "https://raw.githubusercontent.com/wackzilla/fantasyfootball/main/currentleader_";
const PODIUM_PHOTO_REPO_BASE = "https://raw.githubusercontent.com/wackzilla/fantasyfootball/main/profpic_";

// --------------------------------------------------------------
// GOOGLE SHEET
// Paste your sheet's CSV export link here — it must be the CSV
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
//   League Leader   | DaBears4141
//   Commish Message | Don't forget to set your lineup by Sunday!
//
// For League Leader, just type that coach's username (see PHOTOS,
// above) and upload their photo to the repo as currentleader_<their
// username, lowercase>.jpg. Leave the row out (or the cell blank) to
// show no photo. (This row used to be called "Photo URL" — that name
// still works too, no need to rename it in an existing sheet.)
//
// For Commish Message, whatever you type shows in a code-block/
// terminal-style box on the page. Leave the row out (or the cell
// blank) to hide that section entirely.
//
// You can also add a "Photo" COLUMN (not a row) next to "Coach" in
// the standings table itself, one username per coach:
//
//   Coach                 | Photo        | Week 1 | ...
//   Ally (allydee18)      | allydee18    | 2 |
//
// This powers "This Week's Podium" near the top of the page, which
// automatically shows the 1st/2nd/3rd place finishers of the most
// recently played week with their photo from this column. Leave a
// coach's Photo cell blank and they just get a default silhouette
// on the podium instead — totally fine, no photo required.
// --------------------------------------------------------------
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1i0RPTsLocLLkUhVbfsHhdhwat_xBpcATwYkoSmd6Z4Q/export?format=csv&gid=1064215180";
