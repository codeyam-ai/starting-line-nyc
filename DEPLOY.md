# Hosting: Vercel + Namecheap

The site runs on **Vercel (free Hobby plan)**, built from the GitHub repo
`codeyam-ai/starting-line-nyc`. The main domain is **startinglinenyc.com**, and
**atthestartingline.com** redirects to it. Both domains are registered at
Namecheap.

## How the build works (already set up in the repo)

- `vercel.json` builds the SQLite race database (`dev.db`) from
  `prisma/race-data.json` during every Vercel build, then builds the site.
- `next.config.ts` ships `dev.db` with every server route. The site only
  reads it, so Vercel's read-only filesystem is fine.
- `package.json` skips the Playwright browser download on Vercel (it's only
  needed for local testing).
- No environment variables are required.

Every push to `main` on GitHub redeploys the site automatically.

## One-time setup. You do these steps; none have been run for you.

### 1. Create the Vercel project
1. Go to **vercel.com** → **Sign Up** → **Continue with GitHub**. Choose the
   **Hobby** plan.
2. On the dashboard, click **Add New… → Project**.
3. Under **Import Git Repository**, find `starting-line-nyc`. If it isn't
   listed, click **Adjust GitHub App Permissions** and give Vercel access to the
   `codeyam-ai` organization. This may need a GitHub org owner to approve it.
4. Leave every setting at its default (Framework: Next.js; the build command
   comes from `vercel.json`) and click **Deploy**.
5. When it finishes, open the `….vercel.app` link and check that the race list,
   a race detail page and **My Races** all load.

### 2. Add both domains in Vercel
1. In the project, open **Settings → Domains**.
2. Add `startinglinenyc.com`. If Vercel offers to add `www.startinglinenyc.com`
   too, accept and keep its suggested redirect between the two.
3. Add `atthestartingline.com` (and `www`). In its row, click **Edit** and
   choose **Redirect to** `startinglinenyc.com`.
4. Vercel then shows the DNS records each domain needs. **Keep that page open.**

### 3. Point the domains at Vercel in Namecheap (repeat for each domain)
1. In Namecheap: **Domain List** → **Manage** next to the domain → **Advanced DNS** tab.
2. Under **Host Records**, delete Namecheap's default parking records (usually
   a `CNAME` for `www` pointing to `parkingpage.namecheap.com`, and a
   `URL Redirect Record` for `@`).
3. Add the records Vercel showed you. They're usually:
   - **A Record**: Host `@`, Value = the IP address Vercel shows
   - **CNAME Record**: Host `www`, Value = the `…vercel-dns…` name Vercel shows
4. Save. Vercel's Domains page turns green once DNS updates, usually within
   minutes but sometimes up to a few hours. Vercel adds the HTTPS certificate
   automatically.
