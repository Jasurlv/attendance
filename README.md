# Site Attendance: web admin (step 1)

Next.js 15 (App Router) + Tailwind CSS + PostgreSQL (Prisma). Admins add building sites and workers.
The worker phone app (React Native) and check-in API come in the next steps.

## Run it

Requires Node 20+ and either Docker or your own PostgreSQL.

```bash
# 1. Database (skip if you already have PostgreSQL)
docker compose up -d

# 2. Settings
cp .env.example .env
#    then edit .env: set AUTH_SECRET (run: openssl rand -base64 32) and ADMIN_PASSWORD

# 3. Install, create tables, create the first admin
npm install
npx prisma migrate dev --name init
npm run db:seed

# 4. Start
npm run dev          # http://localhost:3000
```

Sign in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env`.

For production: `npm run build && npm start`, with `AUTH_SECRET` and `DATABASE_URL` set as
environment variables, and run behind HTTPS (the session cookie is `secure` in production).
Apply schema changes with `npx prisma migrate deploy`.

## What is in this step

- Admin login (username + bcrypt password, signed httpOnly cookie, 7 days)
- **Sites**: name, map pin, check-in radius (default 50 m), work hours, lunch, grace minutes, timezone
- **Workers**: name, username, password (with generator), site, hourly wage; search and filter by site;
  change password; unlink phone; deactivate or reactivate (history is kept)
- Dashboard with setup status

## Project layout

```
prisma/schema.prisma        Site, User, AttendanceEvent (the check-in table is ready for step 2)
prisma/seed.ts              creates the first admin
src/middleware.ts           redirects signed-out visitors to /login
src/lib/auth.ts             requireAdmin(): called by every admin page AND every server action
src/app/(admin)/sites/      list, new, edit, map picker
src/app/(admin)/workers/    list, new, edit
```

## Notes

- Map tiles and address search use OpenStreetMap / Nominatim. That is fine for an admin tool used
  occasionally; for heavy use, switch to a paid provider.
- Login has no rate limiting yet. Add it before exposing the dashboard on the public internet.
- The site timezone defaults to `Europe/Riga`. Change the default in `src/app/(admin)/sites/site-form.tsx`
  (`emptySite`) and `prisma/schema.prisma` if your sites are elsewhere.
