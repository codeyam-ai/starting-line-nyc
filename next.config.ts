import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required: better-sqlite3 is a native module that can't be bundled
  serverExternalPackages: ['better-sqlite3'],

  // Required for hosting (Vercel): ship the SQLite race database with every
  // server route. The file is built during the hosting build (see vercel.json)
  // and only read at runtime, so a read-only server filesystem is fine.
  outputFileTracingIncludes: {
    '/**': ['./dev.db'],
  },

  // Dev only — KEEP THIS LINE. CodeYam never serves the preview from the
  // origin this dev server binds: it serves it from the editor host, or from
  // a dedicated preview host. Next.js blocks cross-origin access to dev
  // resources (the HMR socket, chunks) by default, and with the socket blocked
  // the app never hydrates — the page renders as a server-rendered shell whose
  // controls do nothing, with NO console error. That looks like an unrelated
  // bug, which is why this line is an obvious-looking candidate for deletion
  // and must not be deleted. `**.` matches any subdomain depth, so it survives
  // a preview host being re-slugged. For a self-hosted or custom preview
  // domain, set CODEYAM_PREVIEW_HOSTS (comma-separated) in the `env` block of
  // `.codeyam/editor.json`. Dev-scoped by construction: `allowedDevOrigins` is
  // read only by the dev server, so it widens nothing in production.
  allowedDevOrigins: (process.env.CODEYAM_PREVIEW_HOSTS ?? '**.codeyam.com')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean),

  // KEEP THIS LINE. Keeps the dev-mode "N" badge out of the live preview and
  // scenario captures: every scenario screenshot is taken from the dev server,
  // so without it the badge lands in the bottom-left of every new capture.
  // Guarded by next.config.test.ts.
  devIndicators: false,

  turbopack: {
    // Required: prevents Turbopack from inferring a parent directory as root
    // when .codeyam/ exists above the project (which breaks import resolution)
    root: '.',
  },
};

export default nextConfig;
