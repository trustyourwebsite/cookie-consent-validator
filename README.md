# Cookie Consent Validator

Verify that cookie consent banners actually work. Clicks "Reject All" and checks if tracking cookies and scripts really stop.

[![npm version](https://img.shields.io/npm/v/@trustyourwebsite/cookie-consent-validator.svg)](https://www.npmjs.com/package/@trustyourwebsite/cookie-consent-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/trustyourwebsite/cookie-consent-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/trustyourwebsite/cookie-consent-validator/actions/workflows/ci.yml)

Built by [TrustYourWebsite](https://trustyourwebsite.com) — automated website compliance scanning for EU businesses.

## Why?

Under GDPR and the Dutch Telecommunicatiewet, websites must stop all non-essential tracking when users reject cookies. The Dutch Data Protection Authority (AP) has fined companies like Kruidvat (€600K) and Coolblue (€40K) for non-compliant cookie banners, and has warned 200+ organizations in 2025.

Most cookie banners look compliant but aren't — tracking continues after clicking "Reject All". This tool catches that.

## Quick Start

```bash
# Run directly with npx (no install needed)
npx @trustyourwebsite/cookie-consent-validator https://example.com

# Or install globally
npm install -g @trustyourwebsite/cookie-consent-validator
cookie-consent-validator https://example.com
```

## CLI Options

```bash
cookie-consent-validator <url> [options]

Options:
  --format <format>         Output format: json, text, table (default: table)
  --timeout <ms>            Page load timeout in ms (default: 30000)
  --wait-after-reject <ms>  Wait time after clicking reject (default: 3000)
  --screenshot              Save before/after screenshots
  --output, -o <file>       Save report to file
  --verbose, -v             Show debug output
  --help, -h                Show help
  --version                 Show version
```

### Examples

```bash
# Basic scan
cookie-consent-validator https://example.com

# JSON output for CI/CD
cookie-consent-validator https://example.com --format json

# Save report and screenshots
cookie-consent-validator https://example.com --screenshot --output report.json

# Verbose mode for debugging
cookie-consent-validator https://example.com --verbose
```

### Example Output

```
Cookie Consent Validation Report
================================
URL:             https://example.com
CMP Detected:    Cookiebot
Reject Button:   Found and clicked

Cookies Before Reject: 12
Cookies After Reject:  8
Tracking Cookies After: 3  ← VIOLATIONS

VIOLATIONS:
  ✗ _ga (.google-analytics.com) — Google Analytics cookie persists after rejection
  ✗ _fbp (.facebook.com) — Facebook cookie persists after rejection
  ✗ _gcl_au (.example.com) — Google Ads cookie persists after rejection

Tracker Requests After Reject: 2
  ✗ www.google-analytics.com — Google Analytics request fired after rejection
  ✗ connect.facebook.net — Facebook Pixel request fired after rejection

Result: FAIL — 5 violations found

Full scan with remediation advice → https://trustyourwebsite.com
```

## Use as a Library

```typescript
import { validateConsent } from '@trustyourwebsite/cookie-consent-validator';

const result = await validateConsent('https://example.com', {
  timeout: 10000,
  waitAfterReject: 3000,
  screenshot: true,
});

console.log(result.cmpDetected);       // 'Cookiebot'
console.log(result.rejectButtonFound);  // true
console.log(result.rejectButtonClicked); // true
console.log(result.violations);         // [...violations]
console.log(result.passed);             // false
```

## Use in CI/CD

Exit code `0` = pass, `1` = violations found, `2` = error.

### GitHub Actions

```yaml
- name: Check cookie consent compliance
  run: npx @trustyourwebsite/cookie-consent-validator https://your-site.com --format json --output consent-report.json

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: consent-report
    path: consent-report.json
```

## Supported CMPs

| CMP | Detection | Reject Button |
|-----|-----------|---------------|
| Cookiebot | `#CybotCookiebotDialog` | `#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll` |
| OneTrust | `#onetrust-banner-sdk` | `#onetrust-reject-all-handler` |
| Quantcast | `#qc-cmp2-container` | `button[mode="secondary"]` |
| Didomi | `#didomi-notice` | `#didomi-notice-disagree-button` |
| Osano | `.osano-cm-window` | `.osano-cm-deny` |
| Complianz | `.cmplz-cookiebanner` | `.cmplz-deny` |
| CookieYes | `.cky-consent-container` | `.cky-btn-reject` |
| Iubenda | `.iubenda-cs-container` | `.iubenda-cs-reject-btn` |
| Borlabs Cookie | `#BorlabsCookieBox` | `[data-cookie-refuse]` |
| TrustArc | `#truste-consent-banner` | `.truste-consent-required` |
| CookieFirst | `#cookiefirst-root` | `[data-cookiefirst-action="reject"]` |
| Custom/Generic | Text-based detection | Multilingual button text matching |

Generic detection supports 13 languages: English, Dutch, German, French, Italian, Spanish, Portuguese, Polish, Swedish, Danish, Norwegian, Finnish, and Czech.

## What It Checks

1. **Cookie persistence** — Tracking cookies (Google Analytics, Facebook, Hotjar, etc.) that remain set after clicking "Reject All"
2. **Tracker requests** — Network requests to known tracking domains that fire after rejection
3. **CMP detection** — Identifies which consent management platform is in use
4. **Reject button** — Whether a "Reject All" button exists and is clickable

## Full Website Compliance Scan

This tool checks cookie consent only. For a complete compliance scan covering GDPR, accessibility, security headers, copyright, and more:

**[TrustYourWebsite.com](https://trustyourwebsite.com)** — Automated compliance scanning for European businesses

## Related

- [TrustYourWebsite](https://trustyourwebsite.com) — Full website compliance scanning for EU businesses
- [@trustyourwebsite/dns-auth-check](https://github.com/trustyourwebsite/dns-auth-check) — SPF, DKIM, DMARC, BIMI and MTA-STS email authentication auditor
- [@trustyourwebsite/security-headers](https://github.com/trustyourwebsite/security-headers) — HTTP security headers grader (HSTS, CSP, X-Frame-Options)

## Contributing

Contributions welcome! Please open an issue first to discuss what you'd like to change.

```bash
git clone https://github.com/trustyourwebsite/cookie-consent-validator.git
cd cookie-consent-validator
npm install
npm test
npm run build
```

## License

MIT — built by [TrustYourWebsite](https://trustyourwebsite.com)
