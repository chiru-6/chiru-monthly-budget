# Chiru — public website and private budget accounts

The public home page offers ChatGPT sign-in and a temporary, non-persistent demo. Signing in opens a personal workspace. Authentication is handled by Sites; Chiru does not store passwords. An existing or newly created ChatGPT account is required.

## Account data

Budget records are stored in Cloudflare D1 under the stable, Site-specific authenticated user ID. Every read and write is authorized on the server. A client-provided owner never determines access. Requests include an account identity check to prevent stale tabs from uploading one account's edits into another signed-in account.

Writes use an atomic revision check. If another device updates the same workspace, the stale save is rejected. The user can download unsaved edits before loading the latest account version. Network failures remain visible in the save-status banner. Online access is required; account records are not cached in localStorage or a service worker.

The previous local-only browser workspace is retained. Settings offers an explicit migration dialog which names the current account and replaces its workspace only after the user confirms. File backup and restore remain available. Imported workbook files are parsed locally; selected transaction records are saved to the account.

## Development

Requires Node 22.13+ (Node 24 used for verification). Run npm ci, npm run db:generate only for new schema changes, and npm run build. Apply pending local D1 migrations using the documented starter command with dist/server/wrangler.json and .wrangler/state. Then npm run dev.

The maintained Sites/Vinext integration supports mock ChatGPT sign-in on loopback development only. Hosted auth uses the Sites dispatcher. Do not implement or override the reserved /signin-with-chatgpt, /signout-with-chatgpt, or /callback routes.

## Tests

- node test.cjs: budgeting calculations and spreadsheet parsing.
- node tests/accounts.test.mjs (Node 24): actual SQLite migration and queries; anonymous access rejection, two-account isolation, ownership spoofing, account switching, revision conflicts, CSRF validation, schema validation and cache headers.
- Browser verification: public landing, local sign-in, empty workspace, transaction save to D1, reload persistence and sign-out.

Limits: one currency per workspace, 20,000 transactions, 5 MB workspace payload, 10 MB workbook input. No bank connection, PDF/OCR, separate email/password login or real-time collaboration. Reopen/reload another device to load the latest saved version. Keep periodic backups.

## Source

- app/page.tsx: public landing page
- app/api/: authenticated session and workspace endpoints
- lib/workspace-service.mjs: server validation, authorization and atomic storage
- db/schema.ts and drizzle/: durable database schema and migrations
- public/budget.html, app.js, account.js, core.js, style.css: budgeting UI, account save queue and calculations

SheetJS 0.20.3 is bundled under its Apache-2.0 license in public/vendor/SHEETJS-LICENSE.txt. Optional Google Fonts have system-font fallbacks.
