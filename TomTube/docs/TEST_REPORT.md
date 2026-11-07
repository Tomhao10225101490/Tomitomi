# Final test report

Executed 2026-11-07 (Asia/Shanghai), against the production Next.js server and a real FFmpeg worker in this cloud instance.

| Check | Observed result | Evidence |
|---|---|---|
| TypeScript | PASS, exit 0 | logs/typecheck.log |
| ESLint | PASS, no reported warnings/errors | logs/lint.log |
| Unit tests | PASS, 6 tests / 1 suite | logs/unit.log |
| API integration | PASS, 1 multi-step integration test | logs/e2e.log |
| Chromium E2E | PASS, 1 multi-step browser test | logs/e2e.log |
| Production build | PASS, optimized route output generated | logs/build.log |
| Local SQL migration | PASS, initial application and no-op repeat | logs/migrate.log, logs/migrate-repeat.log |
| Seed | PASS, 12 demo channels, 60 demo videos, viewer account, actual original media | logs/seed.log |
| Actual playback | PASS, HTML video time advances after play | tests/browser/app.spec.ts |
| Worker processing | PASS, queued upload becomes ready; resulting video accessible | logs/worker.log |
| Source media ranges | PASS, authenticated private upload returns 206 for bytes 0–99 | tests/browser/app.spec.ts |
| Screenshots | PASS, 10 actual Chromium captures | screenshots/ |
| Native Prisma Migrate CLI | BLOCKED, official engine download host denied | logs/migrate.log history / docs/KNOWN_LIMITATIONS.md |
| PostgreSQL | NOT RUN; SQLite fallback used | README.md |

Integration assertions include registration, cookie session, unauthenticated denial, CSRF rejection, DB search, unique toggle likes, subscription state, persistent comments, cross-owner video edit denial, playlist creation/item insertion, history progress, multipart upload, bounded worker transcoding, private video access by owner, byte ranges, anonymous private-watch/media denial, deleted media denial, image upload/profile persistence, publication by metadata edit, cleanup and login/logout.

Browser assertions include 60+ video cards, search result count, actual playing media, login, comment persistence through API refresh, channel navigation, portrait Shorts, actual upload submission, Studio, history, viewport widths 1920/1440/1280/390, mobile document overflow and no page-level JavaScript exceptions. the requested 1280×800 size is captured in screenshots/extra-home-1280.png. Native fullscreen, PiP and every keyboard shortcut are implemented but not all individually automated.

Earlier failures were real: seed FFmpeg spawning required cloud execution permissions; Prisma engine fetch was denied; simultaneous dev/build corrupted generated Next outputs; a FFmpeg filter quoting error failed upload processing. Corrected workflow stops the server during builds and uses a separate permitted worker. The final run records two passed Playwright tests in 10.4 seconds. No assertions were deleted to hide failures.

This validates the documented local workflow, not every item in the original specification. See KNOWN_LIMITATIONS.md for unimplemented items and production gaps.
