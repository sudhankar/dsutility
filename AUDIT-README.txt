DSUTILITY v61

Deep development-gate audit build.

Completed in this pass:
- Repaired GPF calculation logic to match the supplied SAMPLECAL progressive-balance method: monthly interest uses (opening balance + that month's progressive balance) × annual rate / 12.
- Verified the supplied 2009-10 sample numerically: interest Rs 12,160 and closing balance Rs 1,72,160.
- Kept the GPF statement at exactly 12 months; first month/year controls the generated month headers.
- Removed user-facing references to a hidden progressive column.
- Added GPF FAQ structured data and the missing GPF calculator guide.
- Added GPF guide to the tool's related-reading links and kept the blog index/sitemap consistent.
- Removed external Google Fonts requests and use a system font stack to reduce third-party requests and improve first-load privacy/performance.
- Bumped the service-worker cache version to v56.
- Clarified the homepage privacy wording so it refers to supported file processing rather than making an unnecessarily broad claim for every utility.
- Verified all local HTML links resolve and sitemap coverage matches all HTML pages.
- Verified all local JavaScript files pass Node syntax checks.

Important:
- This is not a claim of guaranteed Google Search ranking or AdSense approval. Google explicitly states that indexing/ranking and AdSense approval are not guaranteed; the site is being aligned with people-first content, navigation, original content, policy-safe ad placement and good page experience.
- Final production release still requires real desktop/mobile browser interaction tests, including PDF editor touch interactions, large-PDF tests, export tests and device-specific checks.


v61 pass:
- Site-wide page audit across 128 HTML pages: shared header navigation and footer verified on every page.
- Fixed tool-page polish.css relative paths and restored constrained article reading width.
- Standardized missing canonical/Open Graph/Twitter metadata and missing tool/blog breadcrumbs where appropriate.
- Added related-tool discovery blocks to tool pages lacking them; ensured guide links for the requested major tools.
- Fixed SIP/SWP/FD/RD output calculations and labels; SIP includes SIP/Lumpsum mode and all four calculators now show calculated values.
- Resume and marriage biodata print output is isolated to the document preview; biodata supports centered transparent emblem choices and multiple border styles.
- Improved image-tool presentation; passport photo background removal uses the same connected-edge tolerance approach as the dedicated remover, with optional target-KB export; student photo+signature mode supports 15/20/25/50 KB targets.
- Collage Maker now includes frame width, JPEG quality and shuffle controls.
- All 63 JavaScript files pass Node syntax validation; structural HTML/header/footer/link checks pass.
- Financial spot tests produce non-zero expected sample outputs.
- Browser/device-specific QA remains a release gate where a real interactive browser/device is required.
