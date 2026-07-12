# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] — 2026-07-12

### Added
- **localStorage / sessionStorage tracking**: web-storage keys matching known tracker patterns that appear or persist after "Reject All" are now reported as violations. Previously only HTTP cookies were checked, so storage-based tracking could slip through as a false pass.
- **`--cmp-delay <ms>` flag** to control how long to wait for the consent banner to load (was a hardcoded 2s).

### Changed
- After a successful "Reject All", the scanner now waits for the banner to actually be dismissed before measuring the post-rejection state, reducing timing-related false negatives.
- Stricter CLI validation for `--format` and `--timeout`.
- The library entry point can now be imported without launching a browser (CLI runs only when invoked directly).
- **Publishing hardened**: npm provenance attestation on release, a conditional `exports` map, `prepublishOnly` now runs lint + tests + build, and CI runs a non-blocking dependency audit.

### Removed
- Dropped the misleading `playwright` keyword — the package uses Puppeteer.


## [1.1.1] — 2026-05-20

### Changed
- Switched the `author` email and all TrustYourWebsite links to the canonical trustyourwebsite.com domain.

### Docs
- Added a GitHub Pages landing page.


## [1.1.0] — 2026-04-19

### Added
- **Usercentrics CMP detection**: detects Usercentrics consent banners and clicks "Reject All" via shadow DOM piercing. Usercentrics was listed in package keywords but had no detection code — now fully supported.
- **8 new tracker domains**: YouTube, Reddit Analytics, Reddit Ads, Amazon Ads, Crazy Egg, VWO (Visual Website Optimizer), plus googlevideo.com and assoc-amazon.com.
- **6 new tracking cookie patterns**: YouTube (YSC, VISITOR_INFO1_LIVE, PREF), Reddit (_rdt_uuid), Amazon (ad-id, ad-privacy).
- **Navigation retry logic**: page loads now retry up to 3 times with exponential backoff (1s, 2s) on timeout and network errors. CMP-heavy pages are inherently slow — this dramatically improves reliability.


## [1.0.1] — 2026-04-18

### Changed
- Expanded npm keywords for better discoverability (added cookies, consent-management, eprivacy, tracking, web-privacy, usercentrics, auditor, cli, nodejs, typescript, playwright, reject-all).
- Fixed the `author` field to include email and homepage URL (was name-only).
- Added `"sideEffects": false` for better bundler tree-shaking.
- Added `"publishConfig": { "access": "public" }` to make scoped public publishing explicit.
- Normalized `repository.url` to the `git+https://...git` form npm expects.

### Docs
- Added a "Built by [TrustYourWebsite]" byline under the badges in README.md.
- Added a `## Related` section linking the sibling [@trustyourwebsite/dns-auth-check](https://github.com/trustyourwebsite/dns-auth-check) and [@trustyourwebsite/security-headers](https://github.com/trustyourwebsite/security-headers) packages.

No runtime behaviour changes. Safe drop-in upgrade from 1.0.0.

## [1.0.0] — 2026-04-08

Initial public release.

- Loads a URL with a headless browser, finds and clicks "Reject All" on the cookie banner, then audits what happens next.
- Detects tracking cookies that persist after rejection (Google Analytics, Facebook, Hotjar and more).
- Flags outbound network requests to known tracker domains that fire after rejection.
- Identifies common CMPs (Cookiebot, OneTrust, Usercentrics, etc.).
- Multilingual "Reject All" button detection across 13 languages.
- JSON, text and table output with CI-friendly exit codes.
