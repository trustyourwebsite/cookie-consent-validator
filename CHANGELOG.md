# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
