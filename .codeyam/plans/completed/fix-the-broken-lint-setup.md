---
title: "Fix the broken lint setup"
mode: backend
createdAt: "2026-10-27T14:57:44Z"
source: proposed-plan
---

## Summary

Lint cannot start. `eslint.config.mjs` imports `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, but the installed `eslint-config-next` is v15 while the app runs Next 16, and ESLint fails with ERR_MODULE_NOT_FOUND before checking any file.

## Key Decisions

- Align `eslint-config-next` with the installed Next major version rather than rewriting the config by hand.

## Implementation

- Bump `eslint-config-next` in `package.json` to the version matching `next`.
- Confirm `npx eslint` runs on `app/` and `.devcontainer/codeyam-preview-origin.test.ts`, then fix any findings.