# API reference

Responses are JSON except uploaded media. Errors return `{error:string}` and a non-2xx status. All mutation requests require the application's Origin header. Authenticated operations use the HttpOnly session cookie.

| Endpoint | Methods | Behavior |
|---|---|---|
| /api/me | GET | Safe current profile or null |
| /api/auth/register | POST | email, password (10–100), lowercase username, name; starts session |
| /api/auth/login | POST | email/password; starts session |
| /api/auth/logout | POST | Invalidates session and removes cookie |
| /api/videos | GET | q, category, sort (date/views/duration); DB search and recommendation order |
| /api/watch/:id | GET | Visible video, channel, like/subscription states, comments; increments demo view count |
| /api/channel/:username | GET | Profile, subscriber count, visible or owned videos |
| /api/library | GET | Authenticated playlists/items/history/likes/subscriptions/jobs/notifications |
| /api/profile | POST | Own name/bio/avatar/banner; optional password + newPassword |
| /api/image | POST | Authenticated multipart file; 5 MB limit, decode to WebP; returns url |
| /api/upload | POST | Multipart file/title/description/category/visibility; 202 job, asynchronously processed |
| /api/media/:file | GET | Actual uploaded media with byte-range handling; enforces private visibility |
| /api/video/:id | PATCH, DELETE | Owner metadata edits or cascading record/file deletion |
| /api/comment | POST | videoId, body (1–2000), optional parentId |
| /api/comment/:id | PATCH, DELETE | Own comment edit/delete |
| /api/like | POST | id, kind (video/comment), value (1/-1); unique toggle |
| /api/subscribe | POST | Channel user ID in id; unique toggle |
| /api/history | POST, DELETE | id, bounded progress; delete id or clear own history |
| /api/playlist | POST, DELETE | Create with name; update owned id with name, videoId/remove/position; delete owned id |

Visibility: public is discoverable; unlisted is accessible by direct URL; private watch and media require ownership. All playlists are private in this iteration. Source quality is the actual stored resolution; no nonexistent adaptive renditions are advertised.
