# Examples

## CLI usage

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

## Example output

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
```

## Programmatic usage

```typescript
import { validateConsent } from '@trustyourwebsite/cookie-consent-validator';

const result = await validateConsent('https://example.com', {
  timeout: 10000,
  waitAfterReject: 3000,
  screenshot: true,
});

console.log(result.passed);      // false
console.log(result.violations);  // [...violations]
```

## CI/CD integration

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
