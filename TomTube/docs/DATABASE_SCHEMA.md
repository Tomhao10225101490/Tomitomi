# Database

Canonical model names and fields: `prisma/schema.prisma`. Executed DDL: `prisma/migrations/202611060001_init/migration.sql`.

| Model | Purpose / constraints |
|---|---|
| User | Unique email and username, bcrypt hash, channel identity and profile |
| Session | Random opaque primary key, account foreign key, expiration |
| Video | Owner FK, metadata, source dimensions, visibility, processing state; category/date and owner indexes |
| VideoAsset | Video FK and generated storage paths |
| Comment | Video/user FKs, optional parent FK, time index |
| Like | Unique user + target + kind; polymorphic video/comment target validated by API |
| Subscription | Unique subscriber + channel pair with user FKs |
| Playlist | Owner FK, private collection |
| PlaylistItem | Playlist/video FKs, unique video per playlist, numeric order |
| WatchHistory | Unique user/video, bounded playback progress, updated timestamp |
| Notification | Account FK, message, read state |
| VideoProcessingJob | Account FK, queue state, original file path and final video reference |

Foreign keys are present in checked-in SQL. Prisma models currently represent relationship IDs as scalars rather than Prisma relation fields. The transactional local migration runner tracks applied SQL in `_local_migrations`. It is not a replacement claim for a successfully executed Prisma Migrate CLI. PostgreSQL full-text search and production migrations remain outside verified scope.

The seed is repeatable via unique IDs/upserts; it preserves existing accounts and video edits, writes original media deterministically, and ensures 60 demo records across 12 channels plus a viewer account. Each channel has five records with a reusable original landscape sample and one distinct portrait short. Playback duration and resolution are actual source metadata, not inflated mock durations. View counts and prewritten comments are illustrative and marked demo.
