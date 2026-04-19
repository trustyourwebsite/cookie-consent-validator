import puppeteer from 'puppeteer';
import type { Page, Browser, HTTPRequest } from 'puppeteer';
import * as path from 'node:path';
import type { Cookie, TrackerRequest, Violation, ConsentValidationResult, ValidateConsentOptions } from './types.js';
import { detectCMP, clickRejectButton } from './cmp-detector.js';
import { matchTracker } from './tracker-domains.js';
import { isTrackingCookie, getTrackingCookieCategory } from './cookie-classifier.js';

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_WAIT_AFTER_REJECT = 3000;

/**
 * Validate cookie consent on a URL by:
 * 1. Loading the page and recording cookies + tracker requests
 * 2. Detecting the CMP and clicking "Reject All"
 * 3. Recording cookies + tracker requests again
 * 4. Comparing before/after to find violations
 */
export async function validateConsent(
  url: string,
  options: ValidateConsentOptions = {},
): Promise<ConsentValidationResult> {
  const {
    timeout = DEFAULT_TIMEOUT,
    waitAfterReject = DEFAULT_WAIT_AFTER_REJECT,
    screenshot = false,
    outputDir = process.cwd(),
    verbose = false,
  } = options;

  const log = verbose ? console.log.bind(console) : () => {};

  let browser: Browser | null = null;

  try {
    log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Track network requests
    const requestsBefore: string[] = [];
    const requestsAfter: string[] = [];
    let trackingPhase: 'before' | 'after' = 'before';

    page.on('request', (req: HTTPRequest) => {
      const reqUrl = req.url();
      if (trackingPhase === 'before') {
        requestsBefore.push(reqUrl);
      } else {
        requestsAfter.push(reqUrl);
      }
    });

    // Navigate to URL with retry logic for transient failures
    log(`Navigating to ${url}...`);
    const RETRY_DELAYS = [1000, 2000];
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout });
        break;
      } catch (navError) {
        const isRetryable =
          navError instanceof Error &&
          (navError.message.includes('TimeoutError') ||
            navError.message.includes('timeout') ||
            navError.message.includes('net::') ||
            navError.message.includes('Navigation timeout'));
        if (!isRetryable || attempt === MAX_ATTEMPTS) {
          throw navError;
        }
        log(`Navigation attempt ${attempt} failed, retrying in ${RETRY_DELAYS[attempt - 1]}ms...`);
        await sleep(RETRY_DELAYS[attempt - 1]);
      }
    }

    // Wait for potential CMP to load (some CMPs load async)
    await sleep(2000);

    // Record cookies before interaction
    const cookiesBefore = await getCookies(page);
    log(`Cookies before: ${cookiesBefore.length}`);

    // Find tracker requests before rejection
    const trackersBefore = classifyTrackerRequests(requestsBefore);
    log(`Tracker requests before: ${trackersBefore.length}`);

    // Take screenshot before
    let screenshotBefore: string | undefined;
    if (screenshot) {
      screenshotBefore = path.join(outputDir, 'before-reject.png');
      await page.screenshot({ path: screenshotBefore, fullPage: false });
      log(`Screenshot saved: ${screenshotBefore}`);
    }

    // Detect CMP
    log('Detecting CMP...');
    const cmp = await detectCMP(page);
    log(`CMP detected: ${cmp.name || 'none'}`);
    log(`Reject button: ${cmp.rejectSelector || 'not found'}`);

    // Click reject button
    let rejectClicked = false;
    if (cmp.rejectSelector) {
      log('Clicking reject button...');
      trackingPhase = 'after';
      rejectClicked = await clickRejectButton(page, cmp.rejectSelector);
      log(`Reject clicked: ${rejectClicked}`);
    } else {
      trackingPhase = 'after';
    }

    // Wait after rejection
    if (rejectClicked) {
      log(`Waiting ${waitAfterReject}ms after rejection...`);
      await sleep(waitAfterReject);
    }

    // Record cookies after rejection
    const cookiesAfter = await getCookies(page);
    log(`Cookies after: ${cookiesAfter.length}`);

    // Find tracker requests after rejection
    const trackersAfter = classifyTrackerRequests(requestsAfter);
    log(`Tracker requests after: ${trackersAfter.length}`);

    // Take screenshot after
    let screenshotAfter: string | undefined;
    if (screenshot) {
      screenshotAfter = path.join(outputDir, 'after-reject.png');
      await page.screenshot({ path: screenshotAfter, fullPage: false });
      log(`Screenshot saved: ${screenshotAfter}`);
    }

    // Find violations
    const violations = findViolations(cookiesBefore, cookiesAfter, trackersAfter);

    return {
      url,
      timestamp: new Date().toISOString(),
      cmpDetected: cmp.name,
      rejectButtonFound: !!cmp.rejectSelector,
      rejectButtonClicked: rejectClicked,
      cookiesBefore,
      cookiesAfter,
      trackersBefore,
      trackersAfter,
      violations,
      passed: violations.length === 0,
      screenshotBefore,
      screenshotAfter,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      url,
      timestamp: new Date().toISOString(),
      cmpDetected: null,
      rejectButtonFound: false,
      rejectButtonClicked: false,
      cookiesBefore: [],
      cookiesAfter: [],
      trackersBefore: [],
      trackersAfter: [],
      violations: [],
      passed: false,
      error: message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function getCookies(page: Page): Promise<Cookie[]> {
  const puppeteerCookies = await page.cookies();
  return puppeteerCookies.map((c) => ({
    name: c.name,
    domain: c.domain,
    value: c.value,
    path: c.path,
    expires: c.expires,
    httpOnly: c.httpOnly ?? false,
    secure: c.secure,
    sameSite: c.sameSite,
  }));
}

function classifyTrackerRequests(urls: string[]): TrackerRequest[] {
  const trackers: TrackerRequest[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    const match = matchTracker(url);
    if (match && !seen.has(match.name)) {
      seen.add(match.name);
      trackers.push({ url, name: match.name, category: match.category });
    }
  }

  return trackers;
}

function findViolations(
  cookiesBefore: Cookie[],
  cookiesAfter: Cookie[],
  trackersAfter: TrackerRequest[],
): Violation[] {
  const violations: Violation[] = [];
  const beforeNames = new Set(cookiesBefore.map((c) => c.name));

  // Check for tracking cookies that persist or appear after rejection
  for (const cookie of cookiesAfter) {
    if (isTrackingCookie(cookie)) {
      const persisted = beforeNames.has(cookie.name);
      violations.push({
        type: 'cookie',
        name: cookie.name,
        domain: cookie.domain,
        category: getTrackingCookieCategory(cookie.name),
        description: persisted
          ? `${getTrackingCookieCategory(cookie.name)} cookie persists after rejection`
          : `${getTrackingCookieCategory(cookie.name)} cookie set after rejection`,
      });
    }
  }

  // Check for tracker requests fired after rejection
  for (const tracker of trackersAfter) {
    violations.push({
      type: 'request',
      name: tracker.name,
      domain: new URL(tracker.url).hostname,
      category: tracker.category,
      description: `${tracker.name} request fired after rejection`,
    });
  }

  return violations;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
