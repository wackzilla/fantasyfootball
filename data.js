// ============================================================
//  EDIT THIS FILE EACH WEEK — it's the only file you need to touch.
//  Scroll down to "WEEKLY_RESULTS" — that's the only part that
//  changes week to week. Everything above it is set-once.
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
// COACHES
// Set this once at the start of the season. "name" is what shows
// on the page, "handle" is their DraftKings username shown next
// to it. Use these exact "name" values down in WEEKLY_RESULTS.
// --------------------------------------------------------------
const COACHES = [
  { name: "Ally",   handle: "allydee18" },
  { name: "Tate",   handle: "tateboyce" },
  { name: "Zach",   handle: "wackzillaog" },
  { name: "Stef",   handle: "DaBears4141" },
  { name: "Bob",    handle: "saadameiser" },
  { name: "Val",    handle: "Pureluck88" },
  { name: "Heath",  handle: "heacar6" },
  { name: "Jen",    handle: "jenifred" },
  { name: "Landon", handle: "T-Bonez" },
];

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
// WEEKLY RESULTS  <-- THE ONLY PART YOU EDIT EACH WEEK
//
// One block per week. Each week lists what place (1 = first,
// 2 = second, etc.) every coach finished in that week's contest.
//
// TO ADD A NEW WEEK: copy an entire { ... } block below (including
// the commas), paste it after the last one, change "week" to the
// new week number, and update everyone's place.
//
// Weeks you haven't added yet simply won't show on the page — no
// need to hide or blank anything out.
// --------------------------------------------------------------
const WEEKLY_RESULTS = [
  {
    week: 1,
    places: {
      "Ally": 2,
      "Tate": 4,
      "Zach": 7,
      "Stef": 1,
      "Bob": 3,
      "Val": 8,
      "Heath": 6,
      "Jen": 9,
      "Landon": 5,
    }
  },
];
