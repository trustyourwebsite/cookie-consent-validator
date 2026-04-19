import type { Page, ElementHandle } from 'puppeteer';
import { CMP_DEFINITIONS, GENERIC_BANNER_SELECTORS, REJECT_BUTTON_PATTERNS, COOKIE_TEXT_PATTERNS } from './cmp-selectors.js';

export interface CMPDetectionResult {
  name: string | null;
  rejectSelector: string | null;
  bannerFound: boolean;
}

/**
 * Detect which CMP (Cookie Management Platform) is present on the page.
 * Checks known CMPs first, then falls back to generic banner detection.
 */
export async function detectCMP(page: Page): Promise<CMPDetectionResult> {
  // Check known CMPs in order of market share
  for (const cmp of CMP_DEFINITIONS) {
    const banner = await page.$(cmp.bannerSelector);
    if (!banner) continue;

    // Shadow DOM CMPs (e.g., Usercentrics) render inside a shadow root
    if (cmp.shadowDom) {
      const shadowRejectFound = await page.evaluate(
        (containerSel: string, rejectSels: string[]) => {
          const container = document.querySelector(containerSel);
          if (!container?.shadowRoot) return false;
          for (const sel of rejectSels) {
            const btn = container.shadowRoot.querySelector(sel);
            if (btn) return true;
          }
          return false;
        },
        cmp.bannerSelector,
        cmp.rejectSelectors,
      );

      // For shadow DOM CMPs, use a special selector prefix to signal shadow DOM handling
      const rejectSelector = shadowRejectFound
        ? `shadow:${cmp.bannerSelector}:${cmp.rejectSelectors[0]}`
        : null;
      return { name: cmp.name, rejectSelector, bannerFound: true };
    }

    // Check if banner is visible
    const isVisible = await banner.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    if (!isVisible) continue;

    // Find a working reject selector
    for (const selector of cmp.rejectSelectors) {
      const btn = await page.$(selector);
      if (btn) {
        const btnVisible = await btn.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        if (btnVisible) {
          return { name: cmp.name, rejectSelector: selector, bannerFound: true };
        }
      }
    }

    // CMP found but no reject button
    return { name: cmp.name, rejectSelector: null, bannerFound: true };
  }

  // Fallback: detect generic cookie banners
  return detectGenericBanner(page);
}

async function detectGenericBanner(page: Page): Promise<CMPDetectionResult> {
  // Check generic banner selectors
  for (const selector of GENERIC_BANNER_SELECTORS) {
    try {
      const banner = await page.$(selector);
      if (!banner) continue;

      const isVisible = await banner.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
      if (!isVisible) continue;

      // Look for reject button within this banner
      const rejectSelector = await findRejectButton(page, banner);
      return { name: 'Custom', rejectSelector, bannerFound: true };
    } catch {
      // Selector failed, try next
    }
  }

  // Last resort: look for dialog/banner elements with cookie text
  const result = await page.evaluate(
    (textPatterns: string[], rejectPatterns: string[]) => {
      const candidates = [
        ...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [role="banner"]'),
        ...document.querySelectorAll('[class*="cookie"], [class*="consent"], [class*="gdpr"], [class*="privacy"]'),
        ...document.querySelectorAll('[id*="cookie"], [id*="consent"], [id*="gdpr"], [id*="privacy"]'),
      ];

      for (const el of candidates) {
        const text = (el.textContent || '').toLowerCase();
        const hasCookieText = textPatterns.some((p) => text.includes(p));
        if (!hasCookieText) continue;

        // Found a cookie banner — look for reject button
        const buttons = el.querySelectorAll('button, a[role="button"], [type="submit"], [class*="btn"]');
        for (const btn of buttons) {
          const btnText = (btn.textContent || '').trim().toLowerCase();
          if (rejectPatterns.some((p) => btnText.includes(p))) {
            const selector = btn.id
              ? `#${btn.id}`
              : btn.className
                ? `.${(btn.className as string).split(' ').join('.')}`
                : null;
            return { found: true, rejectSelector: selector };
          }
        }

        return { found: true, rejectSelector: null };
      }

      return { found: false, rejectSelector: null };
    },
    COOKIE_TEXT_PATTERNS,
    REJECT_BUTTON_PATTERNS,
  );

  if (result.found) {
    return { name: 'Custom', rejectSelector: result.rejectSelector, bannerFound: true };
  }

  return { name: null, rejectSelector: null, bannerFound: false };
}

async function findRejectButton(page: Page, banner: ElementHandle): Promise<string | null> {
  const result = await page.evaluate(
    (el: Element, patterns: string[]) => {
      const buttons = el.querySelectorAll('button, a[role="button"], [type="submit"], [class*="btn"]');
      for (const btn of buttons) {
        const btnText = (btn.textContent || '').trim().toLowerCase();
        if (patterns.some((p) => btnText.includes(p))) {
          return btn.id
            ? `#${btn.id}`
            : btn.className
              ? `.${(btn.className as string).split(' ').join('.')}`
              : null;
        }
      }
      return null;
    },
    banner,
    REJECT_BUTTON_PATTERNS,
  );
  return result;
}

/**
 * Click the reject button, handling common edge cases.
 * @returns true if the button was clicked successfully.
 */
export async function clickRejectButton(page: Page, selector: string): Promise<boolean> {
  // Handle shadow DOM selectors (format: "shadow:<container>:<innerSelector>")
  if (selector.startsWith('shadow:')) {
    const parts = selector.split(':');
    const containerSelector = parts[1];
    const innerSelector = parts.slice(2).join(':');
    try {
      const clicked = await page.evaluate(
        (containerSel: string, innerSel: string) => {
          const container = document.querySelector(containerSel);
          if (!container?.shadowRoot) return false;
          const btn = container.shadowRoot.querySelector(innerSel) as HTMLElement | null;
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        },
        containerSelector,
        innerSelector,
      );
      return clicked;
    } catch {
      return false;
    }
  }

  try {
    await page.waitForSelector(selector, { visible: true, timeout: 5000 });
    await page.click(selector);
    return true;
  } catch {
    // Try clicking via JavaScript as fallback
    try {
      const clicked = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          (el as HTMLElement).click();
          return true;
        }
        return false;
      }, selector);
      return clicked;
    } catch {
      return false;
    }
  }
}
