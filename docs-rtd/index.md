# @trustyourwebsite/cookie-consent-validator

Built and maintained by [TrustYourWebsite](https://trustyourwebsite.com), a compliance scanner for EU websites.

Verify that cookie consent banners actually work. This Node.js CLI loads your site, clicks "Reject All", and then checks whether tracking cookies and tracker requests really stop.

## Why?

Under GDPR and the Dutch Telecommunicatiewet, websites must stop all non-essential tracking when users reject cookies. Most cookie banners look compliant but aren't — tracking continues after "Reject All".

The Dutch Data Protection Authority (AP) has fined companies over non-compliant cookie banners — Kruidvat €50,000 (reduced from €600,000 on objection in 2025) and Coolblue €40,000 — and has warned 200+ organisations in 2025. This tool catches the failure before a regulator does.

## Installation

```bash
# Run directly with npx (no install needed)
npx @trustyourwebsite/cookie-consent-validator https://example.com

# Or install globally
npm install -g @trustyourwebsite/cookie-consent-validator
cookie-consent-validator https://example.com
```

## What it checks

1. **Cookie persistence** — tracking cookies (Google Analytics, Facebook, Hotjar, etc.) that remain set after clicking "Reject All".
2. **Tracker requests** — network requests to known tracking domains that fire after rejection.
3. **CMP detection** — identifies which consent management platform is in use.
4. **Reject button** — whether a "Reject All" button exists and is clickable.

See the [API Reference](api.md) for options, exports and supported CMPs, or [Examples](examples.md) for CLI and CI/CD recipes.
