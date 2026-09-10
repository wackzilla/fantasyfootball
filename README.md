Fantasy Football Site — How This Sheet Works

HOW TO USE THIS FILE
1. Click the "Fantasy Standings" tab below.
2. Click cell A1, then select the whole filled-in range (A1 down through
    the last coach row, and across through the last week column).
    Easiest way: click cell A1, then press Ctrl+Shift+End
    (Cmd+Shift+End on Mac) to select to the last used cell.
3. Copy (Ctrl+C / Cmd+C).
4. In your Google Sheet, click cell A1 and paste (Ctrl+V / Cmd+V).
    (This also copies the green header highlighting below.)

BANNER  (rows 1–4: Banner Active / Text / Link / Countdown)
Controls the announcement bar at the top of your website. Edit
Banner Text and Banner Link each week, and set Banner Active to
TRUE or FALSE to show or hide it.

Banner Countdown is optional -- fill it in with a date/time (e.g.
2026-09-14 13:00:00) and the banner shows a live "Locks in
1d 04h 09m 30s" countdown next to the banner text, ticking down
by the second to that moment -- handy for a DraftKings entry
deadline. Type it in your own local time; every visitor's
browser converts it to their own clock automatically. Leave it
blank for no countdown.

LEAGUE LEADER  (row 5)
Shows a wide photo to the left of the standings table, with a
"Current Leader" label above it -- NOT cropped to a circle, so a
normal upright photo works fine as-is. Just type that coach's
username here (e.g. DaBears4141) and upload their photo to the
repo named currentleader_<username, lowercase> (e.g.
currentleader_dabears4141). The file extension doesn't matter --
.jpg, .jpeg, and .png are all tried automatically. Leave it
blank to show no photo. (You can still paste a full image link
instead if you'd rather -- anything starting with http is used
as-is.)

COMMISH MESSAGE + SUBJECT  (rows 6–7)
Whatever you type in Commish Message shows on the page as the
body of a fake email, in a retro Windows-98-style window --
addressed "To: All Coaches," CC'd to Roger Goodell, and signed
off by "The Commish" with a fancy signature. Commish Subject
sets that email's Subject line -- leave it blank and it just
says "League Update." Leave the Commish Message row out (or
the cell blank) to hide that section entirely.

STANDINGS TABLE + STANDINGS/PODIUM PHOTOS  (row 9 down)
Row 9 is the header row (Coach, Week 1, Week 2, ...). Rows 10+
are your coaches, one per row, with real Week 1 results already
filled in as a starting point.

No Photo column needed -- each coach's small CIRCULAR headshot
(shown next to their name in the standings table, and on "This
Week's Podium" whenever they finish 1st/2nd/3rd) is looked up
automatically from their name in the Coach column. A coach
named "allydee18" just needs a photo uploaded to the repo as
profpic_<their name, lowercase> (e.g. profpic_allydee18). The
file extension doesn't matter -- .jpg, .jpeg, and .png are all
tried automatically. Since this one gets cropped into a circle,
crop the photo yourself first -- a square image with the face
centered -- so it doesn't get cut off awkwardly. No matching
photo file? That coach just gets a default silhouette instead
-- totally fine, no photo required.

Need to override that for one coach -- a different photo name
than their Coach cell, or a full link to a photo hosted
elsewhere? Add an optional "Photo" column next to "Coach" and
fill it in just for that coach; leave it blank for everyone
else.

Each week, type that week's finishing place (1, 2, 3, ...) into
the matching week column for each coach. Leave a cell blank for
anyone who hasn't played that week yet.

IMPORTANT — DON'T DO THIS
Don't rename or delete the "Fantasy Standings" tab in your Google
Sheet once it's set up there. The website is wired to that exact
tab by an ID number in its link, not by its name -- replacing it
would change that ID and the site would need SHEET_CSV_URL (in
data.js) updated to match, or it'll stop pulling in results.
<img width="561" height="1649" alt="image" src="https://github.com/user-attachments/assets/7443474e-ee17-4b46-a0fa-5984b4166dbd" />
