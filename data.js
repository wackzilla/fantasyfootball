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
// this week's DraftKings contest, and optionally a live countdown
// ticking down to when entries lock.
//   active: true  -> banner is shown
//   active: false -> banner is hidden (e.g. between weeks)
//   deadline: when entries lock, e.g. "2026-09-14 13:00:00" — shows a
//     live "Locks in 1d 04h 09m 30s" countdown next to the banner
//     text that ticks down by the second. Leave it "" for no
//     countdown. Typed in your own local time (whatever timezone
//     you're in when you set it) — every visitor's browser converts
//     it to their own clock automatically.
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
  link: "https://www.draftkings.com/",
  deadline: ""
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
// PHOTOS — no Photo column needed, just name the files right
// There are two different kinds of photo, since they're shown in two
// different shapes on the page:
//
//   League Leader (the sheet row) -> the wide photo next to the
//   season standings table. Not cropped to a circle, so a normal
//   upright photo works fine as-is. Set by typing a username into
//   the League Leader row (see GOOGLE SHEET, below).
//
//   Standings / podium photo -> the small circular headshot next to
//   a coach's name in the standings table, and on "This Week's
//   Podium." Crop this one square with the face centered before
//   uploading, so it doesn't get awkwardly cut off. This one is
//   automatic — it's looked up straight from that coach's name in
//   the Coach column, no separate column needed.
//
// Either way, the photo file uploaded to the repo just needs to be
// named to match — "currentleader_" + username for the League Leader
// photo, "profpic_" + coach name for standings/podium photos, both
// all lowercase, e.g. currentleader_dabears4141.jpg and
// profpic_dabears4141.png for a coach named "DaBears4141". The file
// extension doesn't matter — .jpg, .jpeg, and .png are all tried
// automatically, so it's fine if a photo happens to save as one type
// or another.
//
// If a coach's photo needs a different name than their Coach cell
// (or you'd rather paste a full link to a photo hosted elsewhere),
// you can still add an optional "Photo" column next to Coach and
// fill it in just for that coach — see GOOGLE SHEET, below.
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
//   Coach          | Week 1 | Week 2 | Week 3 | ...
//   allydee18      |   2    |        |        |
//   tateboyce      |   4    |        |        |
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
//   Banner Active    | TRUE
//   Banner Text      | Week 3 contest is live!
//   Banner Link      | https://www.draftkings.com/...
//   Banner Countdown | 2026-09-14 13:00:00
//   League Leader    | DaBears4141
//   Commish Message  | Don't forget to set your lineup by Sunday!
//   Commish Subject  | Week 3 Power Rankings + a PSA
//
// Banner Countdown is optional — add it to show a live "Locks in
// 1d 04h 09m 30s" countdown next to the banner text, ticking down by
// the second to whatever date/time you type (that's when DraftKings
// contest entries lock). Type it in your own local time — every
// visitor's browser converts it to their own clock automatically.
// Leave the row out (or the cell blank) for no countdown.
//
// For League Leader, just type that coach's username (see PHOTOS,
// above) and upload their photo to the repo as currentleader_<their
// username, lowercase>.jpg. Leave the row out (or the cell blank) to
// show no photo. (This row used to be called "Photo URL" — that name
// still works too, no need to rename it in an existing sheet.)
//
// For Commish Message, whatever you type shows on the page as the
// body of a fake email in a retro Windows-98-style window, addressed
// to "All Coaches," CC'd to Roger Goodell, and signed off by "The
// Commish." Commish Subject sets that email's Subject line (leave it
// blank and it just says "League Update"). Leave the Commish Message
// row out (or the cell blank) to hide that section entirely.
//
// Standings/podium photos don't need a column at all — they're looked
// up automatically from each coach's name (see PHOTOS, above). A
// coach named "allydee18" just needs a photo uploaded as
// profpic_allydee18, and it'll show up next to their name in the
// table and on "This Week's Podium" whenever they finish 1st/2nd/3rd.
// No matching photo file? They just get a default silhouette instead
// — totally fine, no photo required.
//
// If you ever need to override that for one coach — a different
// photo name than their Coach cell, or a full link to a photo hosted
// elsewhere — add an optional "Photo" COLUMN next to "Coach" and
// fill it in just for that coach; leave it blank for everyone else:
//
//   Coach          | Photo           | Week 1 | ...
//   allydee18      |                 | 2      |
//   tateboyce      | tates-real-pic  | 4      |
// --------------------------------------------------------------
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1i0RPTsLocLLkUhVbfsHhdhwat_xBpcATwYkoSmd6Z4Q/export?format=csv&gid=1064215180";
