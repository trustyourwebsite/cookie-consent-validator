# API Reference

## CLI options

```
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

## Exit codes

- `0` — pass, no violations found.
- `1` — violations found.
- `2` — error.

## Library exports

```typescript
import { validateConsent } from '@trustyourwebsite/cookie-consent-validator';

const result = await validateConsent('https://example.com', {
  timeout: 10000,
  waitAfterReject: 3000,
  screenshot: true,
});

console.log(result.cmpDetected);         // 'Cookiebot'
console.log(result.rejectButtonFound);    // true
console.log(result.rejectButtonClicked);  // true
console.log(result.violations);           // [...violations]
console.log(result.passed);               // false
```

## Supported CMPs

| CMP | Detection | Reject button |
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

Generic detection supports 13 languages: English, Dutch, German, French, Italian, Spanish, Portuguese, Polish, Swedish, Danish, Norwegian, Finnish and Czech.
