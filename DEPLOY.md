# Hosting: Vercel + Namecheap

The site runs on **Vercel** (team "Nseldeib Stripe", free Hobby plan; project
`starting-line-nyc`), connected to the GitHub repo `codeyam-ai/starting-line-nyc`.
**Every push to `main` redeploys the site automatically.**

| Address | What it does |
| --- | --- |
| https://startinglinenyc.com | The main address |
| https://www.startinglinenyc.com | Redirects (308) to startinglinenyc.com |
| https://atthestartingline.com (and `www.`) | Redirects (308) to startinglinenyc.com, held for future expansion |
| https://starting-line-nyc.vercel.app | Vercel's own address for the site |

Both domains are registered at **Namecheap**, with their nameservers set to
Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). DNS records are managed in
Vercel (**Project → Settings → Domains**), not in Namecheap. Vercel issues the
HTTPS certificates automatically.

## How the build works

- `vercel.json` builds the SQLite race database (`dev.db`) from
  `prisma/race-data.json` during every Vercel build, then builds the site.
- `next.config.ts` ships `dev.db` with every server route. The site only
  reads it, so Vercel's read-only filesystem is fine.
- `package.json` skips the Playwright browser download on Vercel (it's only
  needed for local testing).
- No environment variables are required.

## Deploying by hand (rarely needed)

Pushing to `main` is the normal path. To deploy manually with the Vercel CLI,
run it from a clean export of the repo, **not** this working folder, which
holds local-only files (such as `.codeyam/secrets.json`) that must not be
uploaded:

```sh
D=$(mktemp -d) && git archive HEAD | tar -x -C "$D" && cd "$D"
vercel link --yes --project starting-line-nyc --scope nseldeib-stripe
rm -f .env.local        # `vercel link` writes a token here; it isn't needed
vercel deploy --prod --yes
```

## Changing a domain's nameservers in Namecheap

Namecheap → **Domain List** → **Manage** next to the domain → **Nameservers** →
choose **Custom DNS** → enter `ns1.vercel-dns.com` and `ns2.vercel-dns.com` →
click the green check to save.
