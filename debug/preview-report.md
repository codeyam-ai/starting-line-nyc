Live Preview goes blank in Codespaces when the app port is private

Environment: codeyam-editor 0.1.16 (commit bdf0a5d, production channel), Next.js 16.4.3 with Turbopack, GitHub Codespaces, Chrome. The editor runs on port 14199 (private), its app proxy on 3000, and the Next dev server on 3001.

Symptom: after a codespace restart, the Live Preview pane is blank. It used to work with every forwarded port left private. The project now works only because a startup script makes port 3000 public, which is a workaround.

WHAT ACTUALLY CHANGED

The preview no longer uses the editor's own address. Before, it loaded the app through the editor's own address (-14199.app.github.dev/__codeyam_preview/). Port 14199 is private, and that works because the user is already signed in to the editor. Now the preview loads the app port's forwarded address (-3000.app.github.dev). That address needs its own Codespaces sign-in, which can't complete inside an iframe.

The switch comes from a stored verdict that the app doesn't hydrate under the subpath, in .codeyam/state/preview-subpath-hydration.json:
  {"failedUrl":"http://127.0.0.1:14199/__codeyam_preview/",
   "counterpartUrl":"http://localhost:3000/",
   "recordedAt":"2026-10-26T19:19:03Z"}

FINDINGS

1. The verdict is committed to git and inherited by every clone and codespace.
   It arrived in app commit b102f83 ("feat: Main page v2...") and is not gitignored. It predates this codespace's editor logs, which begin 2026-10-27 13:51. It is never re-checked or expired, so one bad probe anywhere pins every later environment to the separate-address mode.

2. The subpath genuinely fails to hydrate right now.
   `editor diagnose-preview --path /` reports:
     127.0.0.1:14199/__codeyam_preview/  -> did NOT hydrate
     127.0.0.1:3001/                     -> hydrated
   The HTML is equivalent on both routes: the proxy adds only its 4 standard instrumentation scripts, and none of the 12 subresources checked disagreed. So the failure happens on the client side. The cause is UNCONFIRMED, because I couldn't load the subpath in a headless browser without the editor's session token. Candidates:
     - The HMR WebSocket upgrade is not forwarded under the editor port or subpath.
     - The Next 16 app router rejects or re-navigates when location.pathname is /__codeyam_preview/ but the page was rendered for /.
     - Dev-origin blocking. This seems unlikely: the probe origin is 127.0.0.1, and dev-server.log has 0 "Blocked cross-origin" lines.

3. In Codespaces, the separate-address mode points at a private port with no detection.
   A private forwarded port answers 302 -> https://github.dev/pf-signin?id=... ; port 3001 shows this live. That sign-in page won't render in an iframe, so the pane is blank. Meanwhile `server-identity` reports "preview: serving — the app answered at http://127.0.0.1:3000/", because it probes localhost, not the address the browser loads. Nothing tells the user why the pane is blank.

4. The allowedDevOrigins check gives a false negative.
   preview-verify reported previewDevOriginAllowlist ... satisfied:false, verifiedBy:"configText". It only parses next.config.ts and misses the CODEYAM_PREVIEW_HOSTS env var, which the running dev server does have. Its value includes the -3000 host but not the editor's -14199 host.

5. Ruled out:
   - GitHub CLI login. There is no stored gh credential; gh uses only the Codespaces-provided GITHUB_TOKEN. The git credential helper is the stock /.codespaces/bin/gitcredential_github.sh, and no auth errors appear in the logs.
   - Chrome cross-site cookies. app.github.dev is not on the Public Suffix List, so the -14199 and -3000 addresses are the same site.

PROPOSED FIX

1. Find and fix the hydration failure under the subpath. Load /__codeyam_preview/ in Playwright with the session token, capture console errors and failed requests including WebSocket upgrades, then fix the cause in the proxy. Add a regression test running Next 16 app-router under the subpath.
2. Stop the verdict travelling between machines. Gitignore preview-subpath-hydration.json (or key it to machine and editor version), and re-probe on editor start or version change rather than trusting a stale record.
3. Don't send the preview to a private forwarded port in Codespaces. Before switching to the separate address, check whether that address is reachable from the browser. If it returns a pf-signin redirect, stay on the editor's address, or tell the user plainly why the preview can't load.
4. Make the health check honest. server-identity's "preview:" row should probe the address the pane actually loads.
5. Fix the allowedDevOrigins check so it reads CODEYAM_PREVIEW_HOSTS from the dev server's environment. When the preview uses the editor's address, include the editor's own forwarded host.
6. Project cleanup once 1-3 ship: delete the committed verdict, switch back with `preview-origin-mode same-origin`, and remove the `dedicated --origin` and `ports visibility 3000:public` lines from .devcontainer/codeyam-preview-origin.sh. Keep the `prisma db push` line.

HOW TO CONFIRM THE FIX

Leave port 3000 private, restart the codespace, and load the preview in Chrome:
  - diagnose-preview shows the subpath hydrated.
  - server-identity shows the editor's address as the preview origin.
  - The pane renders and its controls work.
## Raw outputs (collected 2026-10-27, read-only)

```
$ codeyam-editor editor server-identity
CodeYam editor server identity
  reachable URL:  https://lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev
  preview origin: https://lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev (escalated)
  capture origin: http://localhost:3000
  project dir:    /workspaces/starting-line-nyc
  in container:   yes (cloud VM container)
  UI bundle:      embedded (this binary's own)
  pid / version:  3989 / 0.1.16
  build:          bdf0a5d66 (same build as this CLI)
  capture DB:     file:/workspaces/starting-line-nyc/.codeyam/tmp/db-sandbox/capture.db
  preview proxy:  /__codeyam_preview → 127.0.0.1:3000
  preview:        serving — the app answered at http://127.0.0.1:3000/
  shell dialect:  posix (bash/zsh, incl. Git Bash on Windows)
  started at:     2026-10-27T14:53:09.194Z
  config:         current (matches .codeyam/ on disk)
  program file:   current (the file this server runs still exists)

$ gh codespace ports --json sourcePort,visibility,browseUrl   (codespace GITHUB_TOKEN)
[{"browseUrl":"https://lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev","sourcePort":3000,"visibility":"public"},{"browseUrl":"https://lonely-skull-4q4w56jxwrrfj9gp-3001.app.github.dev","sourcePort":3001,"visibility":"private"},{"browseUrl":"https://lonely-skull-4q4w56jxwrrfj9gp-14199.app.github.dev","sourcePort":14199,"visibility":"private"},{"browseUrl":"https://lonely-skull-4q4w56jxwrrfj9gp-14859.app.github.dev","sourcePort":14859,"visibility":"private"},{"browseUrl":"https://lonely-skull-4q4w56jxwrrfj9gp-28974.app.github.dev","sourcePort":28974,"visibility":"private"}]

$ env -u GITHUB_TOKEN -u GH_TOKEN gh codespace ports ...
To get started with GitHub CLI, please run:  gh auth login -s codespace

$ grep -n sameOriginSafe .codeyam/stack.json
109:    "sameOriginSafe": false

$ previewOrigin in .codeyam/editor.local.json (gitignored)
38:  "previewOrigin": "https://lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev"

$ grep -n -i previewOrigin .codeyam/editor.json
(none)

$ cat .codeyam/state/preview-subpath-hydration.json
{
  "failedUrl": "http://127.0.0.1:14199/__codeyam_preview/",
  "counterpartUrl": "http://localhost:3000/",
  "recordedAt": "2026-10-26T19:19:03.279075192+00:00"
}
$ git log -- .codeyam/state/preview-subpath-hydration.json
b102f83 2026-10-26 19:48:22 +0000 feat: Main page v2 and calendar logo

$ gh auth status   (token line removed)
github.com
  ✓ Logged in to github.com account nseldeib (GITHUB_TOKEN)
  - Active account: true
  - Git operations protocol: https

$ env -u GITHUB_TOKEN -u GH_TOKEN gh auth status
You are not logged into any GitHub hosts. To log in, run: gh auth login

$ git config --show-origin --get-all credential.helper
file:/etc/gitconfig	/.codespaces/bin/gitcredential_github.sh
GITHUB_TOKEN set: yes  GH_TOKEN set: 

$ ss -ltnp (relevant ports)
LISTEN 0      128        127.0.0.1:14859      0.0.0.0:*    users:(("codeyam-editor",pid=3989,fd=27)) 
LISTEN 0      128          0.0.0.0:14199      0.0.0.0:*    users:(("codeyam-editor",pid=3989,fd=26)) 
LISTEN 0      128        127.0.0.1:3000       0.0.0.0:*    users:(("codeyam-editor",pid=3989,fd=30)) 
LISTEN 0      511        127.0.0.1:3001       0.0.0.0:*    users:(("next-server (v1",pid=4892,fd=22))
LISTEN 0      128            [::1]:3000          [::]:*    users:(("codeyam-editor",pid=3989,fd=31)) 
LISTEN 0      128            [::1]:14859         [::]:*    users:(("codeyam-editor",pid=3989,fd=28)) 

$ curl localhost:3000/
200 
$ curl localhost:14199/__codeyam_preview/   (no session token)
401
$ curl -I private forwarded port 3001 (no auth)
HTTP/2 302 
location: https://github.dev/pf-signin?id=<redacted>&cluster=use&name=lonely-skull-4q4w56jxwrrfj9gp&port=3001&pb=https%3A%2F%2Flonely-skull-4q4w56jxwrrfj9gp-3001.app.github.dev%2Fauth%2Fpostback%2Ftunnel%3Ftunnel%3D1
$ curl public forwarded port 3000 (no auth)
200

$ CODEYAM_PREVIEW_HOSTS in the running next-server env
CODEYAM_PREVIEW_HOSTS=lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev,**.codeyam.com,.codeyam.com
$ grep -ci "blocked cross-origin" .codeyam/logs/dev-server.log
0

$ codeyam-editor editor diagnose-preview --path /
━━━ Preview Diagnostic: / ━━━

  proxy port 3000 — HTTP 200, no Transfer-Encoding, Content-Length: 91862
  direct port 3001 — HTTP 200, Transfer-Encoding: chunked, no Content-Length

Script tags — proxy: 22, direct: 18
  Added by proxy:
    + (inline) (function () { if (window.__codeyamErrorCaptureInstalled) re…
    + (inline) (function() { var SCENARIO_HEADER = 'X-Codeyam-Scenario'; va…
    + (inline) (function() { var active = false; var overlay = null; var to…
    + (inline) // codeyam-hash-scroll shim — injected late, before the clos…

Subresources (proxy, direct, external https://lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev) — 12 checked, 3 skipped (cross-origin or over the 12 cap)
  No subresource disagreed across the legs probed.

Browser hydration probe (the check no HTTP comparison can make)
  http://127.0.0.1:14199/__codeyam_preview/ — did NOT hydrate
  http://127.0.0.1:3001/ — hydrated

Most likely cause: proxy altered the document — proxy injected 4 extra script(s) into the document. Every added script was CHECKED against codeyam's own instrumentation set and matched (fetch/mock patch, inspector, error capture, hash-scroll, storage seeding, mock clock). Those are injected into every proxied page and do not break hydration on their own, so this finding does not explain a dead page — read the browser hydration probe above for a verdict that does. If that probe was inconclusive, the likeliest remaining causes are a dropped WebSocket upgrade (the dev server's HMR socket) or a console error — run `editor client-errors`.

$ cat .codeyam/logs/codespaces-preview-origin.log
Live Preview now served from its own origin (https://lonely-skull-4q4w56jxwrrfj9gp-3000.app.github.dev): set `preview.sameOriginSafe: false` in /workspaces/starting-line-nyc/.codeyam/stack.json and `previewOrigin` in /workspaces/starting-line-nyc/.codeyam/editor.local.json. Undo with `codeyam-editor editor preview-origin-mode same-origin`.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

The database is already in sync with the Prisma schema.


$ codeyam-editor --version
codeyam-editor 0.1.16
channel: production
branch:  codeyam.com
commit:  bdf0a5d
build:   branch
$ next version
16.4.3
```
