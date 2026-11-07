PRAGMA foreign_keys=ON;
CREATE TABLE "User" (
"id" TEXT PRIMARY KEY NOT NULL,
"email" TEXT NOT NULL UNIQUE,
"username" TEXT NOT NULL UNIQUE,
"name" TEXT NOT NULL,
"password" TEXT NOT NULL,
"bio" TEXT NOT NULL DEFAULT "",
"avatar" TEXT NOT NULL DEFAULT "",
"banner" TEXT NOT NULL DEFAULT "",
"createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Session" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"expires" TEXT NOT NULL
);
CREATE INDEX "Session_userId" ON "Session" ("userId");
CREATE TABLE "Video" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"title" TEXT NOT NULL,
"description" TEXT NOT NULL,
"category" TEXT NOT NULL,
"tags" TEXT NOT NULL DEFAULT "",
"thumbnail" TEXT NOT NULL,
"source" TEXT NOT NULL,
"duration" REAL NOT NULL,
"width" INTEGER NOT NULL DEFAULT 1280,
"height" INTEGER NOT NULL DEFAULT 720,
"views" INTEGER NOT NULL DEFAULT 0,
"visibility" TEXT NOT NULL DEFAULT "public",
"status" TEXT NOT NULL DEFAULT "ready",
"demo" INTEGER NOT NULL DEFAULT 0,
"createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Video_category_visibility_createdAt" ON "Video" ("category","visibility","createdAt");
CREATE INDEX "Video_userId" ON "Video" ("userId");
CREATE TABLE "VideoAsset" (
"id" TEXT PRIMARY KEY NOT NULL,
"videoId" TEXT NOT NULL REFERENCES "Video"("id") ON DELETE CASCADE,
"path" TEXT NOT NULL,
"kind" TEXT NOT NULL
);
CREATE INDEX "VideoAsset_videoId" ON "VideoAsset" ("videoId");
CREATE TABLE "Comment" (
"id" TEXT PRIMARY KEY NOT NULL,
"videoId" TEXT NOT NULL REFERENCES "Video"("id") ON DELETE CASCADE,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"parentId" TEXT REFERENCES "Comment"("id") ON DELETE CASCADE,
"body" TEXT NOT NULL,
"createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Comment_videoId_createdAt" ON "Comment" ("videoId","createdAt");
CREATE TABLE "Like" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"targetId" TEXT NOT NULL,
"kind" TEXT NOT NULL DEFAULT "video",
"value" INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX "Like_userId_targetId_kind" ON "Like" ("userId","targetId","kind");
CREATE TABLE "Subscription" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"channelId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Subscription_userId_channelId" ON "Subscription" ("userId","channelId");
CREATE TABLE "Playlist" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"name" TEXT NOT NULL
);
CREATE INDEX "Playlist_userId" ON "Playlist" ("userId");
CREATE TABLE "PlaylistItem" (
"id" TEXT PRIMARY KEY NOT NULL,
"playlistId" TEXT NOT NULL REFERENCES "Playlist"("id") ON DELETE CASCADE,
"videoId" TEXT NOT NULL REFERENCES "Video"("id") ON DELETE CASCADE,
"position" INTEGER NOT NULL
);
CREATE UNIQUE INDEX "PlaylistItem_playlistId_videoId" ON "PlaylistItem" ("playlistId","videoId");
CREATE TABLE "WatchHistory" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"videoId" TEXT NOT NULL REFERENCES "Video"("id") ON DELETE CASCADE,
"progress" REAL NOT NULL DEFAULT 0,
"updatedAt" TEXT NOT NULL
);
CREATE UNIQUE INDEX "WatchHistory_userId_videoId" ON "WatchHistory" ("userId","videoId");
CREATE TABLE "Notification" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"body" TEXT NOT NULL,
"read" INTEGER NOT NULL DEFAULT 0,
"createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "VideoProcessingJob" (
"id" TEXT PRIMARY KEY NOT NULL,
"userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
"title" TEXT NOT NULL,
"description" TEXT NOT NULL,
"category" TEXT NOT NULL,
"visibility" TEXT NOT NULL,
"file" TEXT NOT NULL,
"status" TEXT NOT NULL DEFAULT "queued",
"error" TEXT NOT NULL DEFAULT "",
"videoId" TEXT,
"createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);