# Profile subpages update

Replace these three files in your existing project:

- `src/App.tsx`
- `src/Profile.tsx`
- `src/styles.css`

**Do not replace the entire `src` folder.** Keep your existing `main.tsx`, `profileDb.ts`, `StepPage.tsx`, `NavBar.tsx`, etc.

With `npm run dev`, the persistent bottom navigation's Profile link opens the profile overview. Tabs provide separate routes:

- `#/profile` — Overview
- `#/profile/checklist` — Roadmap checklist
- `#/profile/care-team` — My care team
- `#/profile/resources` — Saved resources
- `#/profile/account` — My information

No new database migration required. All saves and checklist changes use the existing Supabase functions. After copying the files, run `npm run build` to check types and deployment readiness.
