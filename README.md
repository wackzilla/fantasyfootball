# Fantasy Contest Site

A plain static website — no build tools, no frameworks, no server. Just
HTML/CSS/JS files that you host for free on GitHub Pages, with an optional
custom domain on top.

**Total cost: $0/year on the free subdomain, or ~$10–15/year if you add a
custom domain.**

## What's in this folder

- `index.html` — the page structure (you shouldn't need to touch this)
- `style.css` — styling (you shouldn't need to touch this)
- `script.js` — fetches your Google Sheet and renders the table (you
  shouldn't need to touch this)
- `data.js` — settings you set once: league name, announcement banner,
  points-per-place, and the link to your published Google Sheet
- `CNAME` — only used if you add a custom domain (see below)

Weekly results themselves live in your Google Sheet, not in these files
— see the Instructions tab in your sheet if you need a refresher on how
it's wired up.

## Part 1: Publish it for free with GitHub Pages

1. Go to [github.com](https://github.com) and create a free account if you
   don't have one.
2. Click the **+** in the top right → **New repository**. Name it whatever
   you like (e.g. `fantasy-contest`). Set it to **Public**. Create it.
3. On the new repo's page, click **Add file → Upload files**, and drag in
   all the files from this folder (`index.html`, `style.css`, `script.js`,
   `data.js`). Commit the changes.
4. Go to the repo's **Settings** tab → **Pages** (left sidebar).
5. Under "Build and deployment", set **Source** to **Deploy from a
   branch**, branch **main**, folder **/ (root)**. Save.
6. Wait about a minute, then refresh that page — GitHub will show you your
   live URL, something like:
   `https://yourusername.github.io/fantasy-contest/`
7. Send that link to your group. Done — that's the whole hosting bill: $0.

## Part 2 (optional): Add a custom domain (~$10–15/year)

If you'd rather have something like `lowellfantasy.com` instead of the
github.io link:

1. Buy a domain from a registrar. Cheap, reputable options: **Namecheap**,
   **Porkbun**, or **Cloudflare Registrar** (Cloudflare sells at cost, so
   it's often the cheapest — usually $9–12/year for a `.com`).
2. In your repo, open the `CNAME` file (included in this folder) and
   replace its contents with just your domain, e.g.:
   ```
   lowellfantasy.com
   ```
   Upload/commit that change.
3. In your repo's **Settings → Pages**, enter your custom domain in the
   "Custom domain" box and save. GitHub will show you the DNS records you
   need.
4. In your domain registrar's DNS settings, add:
   - Four **A records** for the root domain (`@`) pointing to GitHub
     Pages' IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - One **CNAME record** for `www` pointing to
     `yourusername.github.io`
5. DNS changes can take anywhere from a few minutes to a few hours to take
   effect. Once it does, go back to Settings → Pages and check **Enforce
   HTTPS** so the site loads securely.

## Updating results each week

Open your Google Sheet and type in that week's finishing place for each
coach. That's it — no GitHub, no commits. The page automatically sorts
and ranks everyone, and hides weeks that don't have results yet.

The banner and league name still live in `data.js` in GitHub, since they
change far less often.

## Notes

- This intentionally has zero dependencies and no build step, so it will
  keep working indefinitely without maintenance.
- If your group ever outgrows a hand-edited file (e.g. you want people to
  submit their own picks through a form), that's a bigger step up — worth
  a separate conversation when you get there.
