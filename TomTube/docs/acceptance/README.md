# 真实浏览器验收录屏

录制时间（UTC）：2026-11-07T00:56:36.130Z

录屏来自实际运行的 TomTube 应用，使用系统 Chromium、Playwright 原生录屏和系统 FFmpeg。桌面和移动端各自连续录制，没有使用静态页面或截图合成冒充操作。MP4 为原录屏转码，未剪辑；GIF 是桌面录屏前段的缩小节选。视频没有音轨，页面中的播放操作已静音。

| 文件 | 时长 | 分辨率 | 格式 / 校验 |
| --- | --- | --- | --- |
| [desktop-acceptance.mp4](desktop-acceptance.mp4) | 54.9 秒 | 1440 × 900 | H.264 / 完整解码通过 |
| [mobile-acceptance.mp4](mobile-acceptance.mp4) | 9.8 秒 | 390 × 844 | H.264 / 完整解码通过 |

## 桌面录屏时间线

| 时间（约） | 真实操作 / 验证内容 |
| --- | --- |
| 00:01 | Homepage: database-backed video feed |
| 00:04 | Dark appearance |
| 00:08 | Live search suggestions |
| 00:09 | Database search results |
| 00:12 | Actual HTML5 media playback |
| 00:16 | Local demo account sign-in |
| 00:18 | Persistent video-like interaction |
| 00:19 | Persistent channel-subscription toggle |
| 00:20 | Comment persisted and displayed |
| 00:23 | Creator channel with actual videos |
| 00:26 | Original portrait Shorts |
| 00:29 | Switch to another distinct Short |
| 00:32 | Upload workflow |
| 00:34 | Selected actual local MP4, title and description |
| 00:36 | Server accepted upload for asynchronous processing |
| 00:38 | Creator Studio and processing queue |
| 00:40 | FFmpeg worker completed: uploaded video is ready |
| 00:43 | Newly uploaded and transcoded video actually plays |
| 00:49 | Authenticated viewing history |
| 00:51 | Persisted private playlists |
| 00:53 | Desktop recording complete; no page-level JavaScript exceptions |

时间戳来自自动化步骤开始时间，浏览器录屏起点可能有小幅偏差。移动端录屏展示首页、滚动与真实视频播放，并断言页面没有横向溢出。

## 可复现录制

先按项目 README 启动服务与独立媒体 worker，然后在 TomTube 目录运行：

```bash
node scripts/record-acceptance.mjs
```

录制脚本使用本地 Demo 账号，会真实新增一条验收评论和一条视频，切换点赞和订阅状态，并保存观看历史。需要 `/usr/bin/chromium` 和 `/usr/bin/ffmpeg`；脚本在已忽略的 storage 目录中为 Playwright 配置系统 FFmpeg。

脚本包含实际视频时间前进、上传返回 202、后台任务进入 ready、转码后视频可播放、历史记录存在和浏览器无页面级异常等断言。录屏说明这些操作已成功执行，不代表所有原始需求都已完成。

[完整测试报告](../TEST_REPORT.md) · [已知限制](../KNOWN_LIMITATIONS.md) · [回到仓库展示](../../../README.md)
