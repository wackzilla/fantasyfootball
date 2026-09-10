// ============================================================
//  EDIT THIS FILE EACH WEEK — it's the only file you need to touch.
//  Nothing here requires any coding knowledge, just careful typing.
//  When you're done editing, save the file and re-upload/commit it
//  (see README.md for the exact steps). The page updates itself
//  from whatever is in here.
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
// SEASON STANDINGS
// Add one line per person. The page automatically sorts everyone
// by wins (highest first), then by points as a tiebreaker, and
// numbers the ranks for you — so you never have to reorder this
// list by hand, just update the numbers.
//
// To add a new person, copy a line and change the details.
// Make sure every line except the last one ends with a comma.
// --------------------------------------------------------------
const STANDINGS = [
  { name: "Alice",   wins: 0, points: 0 },
  { name: "Bob",     wins: 0, points: 0 },
  { name: "Charlie", wins: 0, points: 0 },
  { name: "Dana",    wins: 0, points: 0 },
];
