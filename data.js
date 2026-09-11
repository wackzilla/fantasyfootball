// ============================================================
//  SETTINGS — set these once, they rarely change.
//  Your coaches and weekly results now live in your Google Sheet,
//  not in this file — see the Instructions tab in that sheet.
// ============================================================

// The name shown at the top of the page (fallback / default). You can
// instead control the page's title and the line underneath it from
// your Google Sheet with Page Title / Page Subtitle rows — see GOOGLE
// SHEET, below. If your sheet has those rows, they override what's set
// here; this is just what shows before the sheet loads, or if you
// never add those rows to the sheet at all.
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
// One photo per coach, shown in three places: a small circular
// headshot next to their name in the standings table, on "This
// Week's Podium" whenever they finish 1st/2nd/3rd, AND next to the
// "Current Leader" label above the standings table whenever they're
// the one on top of the season standings — that one updates
// automatically as the points lead changes week to week, no manual
// "who's leading" step required.
//
// It's looked up automatically from that coach's name in the Coach
// column — a coach named "DaBears4141" just needs a photo uploaded
// to the repo as profpic_dabears4141 (all lowercase). The file
// extension doesn't matter — .jpg, .jpeg, and .png are all tried
// automatically, so it's fine if a photo happens to save as one type
// or another. Crop it square with the face centered before
// uploading, so it doesn't get cut off awkwardly when shown as a
// circle. No matching photo file? That coach just gets a default
// silhouette (or, for the Current Leader panel, no photo shown at
// all) — totally fine, no photo required.
//
// If a coach's photo needs a different name than their Coach cell
// (or you'd rather paste a full link to a photo hosted elsewhere),
// you can still add an optional "Photo" column next to Coach and
// fill it in just for that coach — see GOOGLE SHEET, below.
// --------------------------------------------------------------
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
// Leave a cell blank for a coach who hasn't played that contest yet
// — the page automatically only shows contest columns with at least
// one result filled in, and skips blank cells for anyone else.
//
// Each contest column's header can say whatever you want — it
// doesn't have to say "Week N". Rename a column's header cell to
// "NFL Season Opener", "Wild Card Round", or anything else, and the
// standings table and "This Week's Podium" heading both show that
// exact text, no code changes needed.
//
// Optionally, add rows ABOVE the "Coach" row to control the page
// title/subtitle and the banner from the sheet instead of the
// LEAGUE_NAME/ANNOUNCEMENT settings above, and/or to show a "message
// from the Commish" text box on the page:
//
//   Page Title       | Viva la Fútbol
//   Page Subtitle    | ¡Vámonos! Fútbol season is here.
//   Banner Active    | TRUE
//   Banner Text      | Week 3 contest is live!
//   Banner Link      | https://www.draftkings.com/...
//   Banner Countdown | 2026-09-14 13:00:00
//   Commish Message  | Don't forget to set your lineup by Sunday!
//   Commish Subject  | Week 3 Power Rankings + a PSA
//   Winner Quote     | That was one for the ages! -- tateboyce
//
// Page Title and Page Subtitle are both optional — leave either row
// out (or the cell blank) to keep whatever's set in this file
// (LEAGUE_NAME above, and the default subtitle text in index.html)
// instead.
//
// Banner Countdown is optional — add it to show a live "Locks in
// 1d 04h 09m 30s" countdown next to the banner text, ticking down by
// the second to whatever date/time you type (that's when DraftKings
// contest entries lock). Type it in your own local time — every
// visitor's browser converts it to their own clock automatically.
// Leave the row out (or the cell blank) for no countdown.
//
// For Commish Message, whatever you type shows on the page as the
// body of a fake email in a retro Windows-98-style window, addressed
// to "All Coaches," CC'd to Roger Goodell, and signed off by "The
// Commish." Commish Subject sets that email's Subject line (leave it
// blank and it just says "League Update"). Leave the Commish Message
// row out (or the cell blank) to hide that section entirely.
//
// Winner Quote is optional too — add it to show an italicized, quoted
// line centered under "This Week's Podium" (e.g. Winner Quote |
// That was one for the ages! -- tateboyce). It shows/hides along with
// the podium itself, so there's no need to clear it out between weeks
// if you'd rather just leave last week's quote in place.
//
// There's no "League Leader" row anymore — the wide photo above the
// standings table now automatically follows whoever's actually on
// top of the season standings, using that same coach's own photo
// (see PHOTOS, above). No manual step each week; it just follows the
// points lead. (If your sheet still has an old League Leader or
// Photo URL row left over, it's simply ignored now.)
//
// Standings/podium photos don't need a column at all — they're looked
// up automatically from each coach's name (see PHOTOS, above). A
// coach named "allydee18" just needs a photo uploaded as
// profpic_allydee18, and it'll show up next to their name in the
// table, on "This Week's Podium" whenever they finish 1st/2nd/3rd,
// and above the standings table whenever they're the season leader.
// No matching photo file? They just get a default silhouette instead
// (or, for the Current Leader panel, no photo at all) — totally
// fine, no photo required.
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
