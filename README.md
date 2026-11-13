# Roadmap profile upgrade

Copy these files into your existing project (replace App.tsx and StepPage.tsx):

- `src/App.tsx`
- `src/StepPage.tsx`
- `src/Profile.tsx` (new)
- `src/NavBar.tsx` (new)
- `src/profileDb.ts` (new)

Append `profile-styles.css` to your existing `src/styles.css`.

In Supabase SQL Editor run `supabase/profile_migration.sql` **after** running the original `supabase/schema.sql`.

No new npm packages are needed.

Run `npm run build` then push to GitHub to deploy.

Important: `src/seed.ts` contains fabricated example providers, phone numbers and events. Replace them with verified sources or clearly label them as mock examples before real patients use the app.

Security note: diagnosis data is sensitive health information. RLS protects rows at the database level, but production patient use may require HIPAA/other privacy compliance, contracts, access controls and a security assessment.
