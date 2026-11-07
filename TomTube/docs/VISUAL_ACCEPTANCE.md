# Visual acceptance

Actual Chromium screenshots, not generated concepts:

1. screenshots/01-home-light.png
2. screenshots/02-home-dark.png
3. screenshots/03-watch.png
4. screenshots/04-search.png
5. screenshots/05-channel.png
6. screenshots/06-shorts.png
7. screenshots/07-upload.png
8. screenshots/08-studio.png
9. screenshots/09-mobile-home.png
10. screenshots/10-mobile-watch.png

Inspected light homepage, mobile homepage and Shorts captures directly. Desktop uses a 64px fixed header, 230px expanded sidebar, 34px feed inset, 3-column 16:9 grid at 1440px, 4 columns at 1920px, compact sidebar at narrower widths. Mobile uses a 58px header, bottom navigation and a single-column feed. Watch layout has a flexible player column and 370px recommendation sidebar; recommendations move below at narrower sizes. Cards, search, action pills, descriptions and comments follow familiar video-platform proportions with independent TomTube branding. Light/dark surfaces share the same geometry.

Browser test checked no horizontal document overflow at 1920, 1280 and 390 widths, then captured mobile playback. Mobile title wrapping and controls were inspected from actual screenshots. Portrait Shorts deliberately show original synthetic test patterns; these are valid playable test assets, not natural footage.

External YouTube access is checked in logs/reference-access.log. The managed allowlist blocks that destination, so no claim is made of a current live pixel comparison. Layout is based on established desktop video-platform conventions. The result is a functional local implementation; further content art direction and comprehensive accessibility review remain useful work.
