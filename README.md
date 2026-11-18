# ◔ chiru. — Monthly Budget

**A calmer home for your monthly budget.** Plan spending, track recurring bills, build savings goals and import bank statements, all in a private workspace that follows you across devices.

🔗 **Live site:** https://chiru-monthly-budget.woollyrain15.chatgpt.site/
🧪 **Try it without signing in:** [demo mode](https://chiru-monthly-budget.woollyrain15.chatgpt.site/budget.html?demo=1)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_D1-F38020?style=flat&logo=cloudflare&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## ✨ Features

- **Plan:** set category budgets, track recurring bills, and get a heads-up when spending needs attention
- **Understand:** import Excel or CSV statements, then review categories and flag likely duplicates before anything is saved
- **Grow:** create savings goals, track progress, and budget for giving
- **Private by design:** every signed-in user gets an isolated workspace. All reads and writes are authorized server-side, and the client never decides who owns data
- **Safe multi-device saves:** atomic revision checks reject stale saves from another device or tab, and unsaved edits can be downloaded before reloading
- **Backup and restore:** export and re-import your whole workspace as a file
- **Demo mode:** explore the full UI with a temporary, non-persistent workspace

## 🏗️ Architecture

```
Browser (budget UI: public/*.js)
   │   spreadsheet files parsed locally with SheetJS
   ▼
Next.js app on Cloudflare Workers (vinext)
   ├─ app/page.tsx              public landing page
   ├─ app/api/…                 authenticated session + workspace endpoints
   └─ lib/workspace-service.mjs validation, authorization, atomic revisioned writes
   ▼
Cloudflare D1 (SQLite) via Drizzle ORM
   └─ workspaces(user_id PK, data, revision, updated_at)
```

Sign-in is handled by the hosting platform's "Sign in with ChatGPT", so the app never stores passwords.

## 🧪 Testing

- `node test.cjs`: budgeting calculations and spreadsheet parsing
- `node tests/accounts.test.mjs` (Node 24): real SQLite migrations and queries, covering anonymous-access rejection, two-account isolation, ownership spoofing, account switching, revision conflicts, CSRF validation, schema validation and cache headers

## 🚀 Running locally

Requires Node 22.13+.

```bash
npm ci
npm run build
npm run dev
```

Local development uses a mock sign-in on loopback only. See [TECHNICAL.md](TECHNICAL.md) for database migrations, auth routes, limits and full implementation notes.

## 📏 Limits

One currency per workspace · up to 20,000 transactions · 5 MB workspace · 10 MB workbook import. There's no direct bank connection; statements are imported from files.

---

Built by **[Chirandan Raaman Murugan](https://github.com/chiru-6)**. SheetJS 0.20.3 is bundled under the Apache-2.0 license (`public/vendor/SHEETJS-LICENSE.txt`).
