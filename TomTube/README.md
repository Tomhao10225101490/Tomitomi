# TomTube

Your World. Your Videos. An independent local video-sharing application, not affiliated with Google or YouTube. Seeded channels, view counts, comments and artwork are explicitly fictional demo content.

## Run

Node 24, npm, FFmpeg/FFprobe and a C++ toolchain (for the SQLite driver) are required.

```sh
cd /workspace/Tomitomi/TomTube
npm ci
cp .env.example .env # only on a fresh checkout; preserve existing configuration
npm run db:generate
npm run db:setup
npm run build
npm start
# Separate terminal, same directory:
npm run worker
```

Local address: `http://localhost:3000`. Development: `npm run dev` instead of the production build/start. Stop the server before building: Next development and production builds share `.next`.

Local-only demonstration account: `demo@tomtube.local` / `TomTubeDemo!2026`. Never reuse these credentials outside local development. Registration creates independent accounts.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

Playwright uses `/usr/bin/chromium` in this environment. Change `executablePath` for other machines. Start the server and worker before E2E. Tests exercise real database writes and create clearly named test accounts and uploads. Screenshots go in `screenshots/`; logs in `logs/`.

## Storage and database

Prisma 6 JavaScript engine with the official `better-sqlite3` adapter, SQLite WAL database `prisma/tomtube.db`. No external database or credentials needed. Checked-in SQL migrations have keys, unique constraints and cascading foreign keys; `prisma/migrate.ts` applies pending SQL transactionally. This fallback does **not** claim Prisma Migrate CLI or PostgreSQL validation: the native Prisma schema engine download is blocked by the environment network policy. `db:generate` selects the JavaScript engine and points unused native engine selectors at `/bin/true` solely to prevent fetching unused binaries; no downloaded artifacts bypass integrity checks and these selectors are not used at runtime.

Uploads: 100 MB, 30 minutes, 10 jobs/account/hour. Worker: one job at a time, 180-second transcode timeout, 15-second probe/thumbnail timeout, two encoder threads. Input is decoded by FFprobe, never executed. Output is H.264/AAC MP4; failed processing removes input and partial output. Private uploaded media is served through an authenticated range endpoint. Public original samples live in `public/media`. User uploads live in `storage/media`; temporary files in `storage/incoming`.

See `docs/KNOWN_LIMITATIONS.md` before deploying. This is a working local development application, not a production-hardened hosted service.
