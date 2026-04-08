import { describe, it, expect } from 'vitest';
import {
  CMP_DEFINITIONS,
  GENERIC_BANNER_SELECTORS,
  REJECT_BUTTON_PATTERNS,
  COOKIE_TEXT_PATTERNS,
} from '../src/cmp-selectors.js';

describe('CMP selectors', () => {
  describe('CMP_DEFINITIONS', () => {
    it('contains at least 9 known CMPs', () => {
      expect(CMP_DEFINITIONS.length).toBeGreaterThanOrEqual(9);
    });

    it('each CMP has required fields', () => {
      for (const cmp of CMP_DEFINITIONS) {
        expect(cmp.name).toBeTruthy();
        expect(cmp.bannerSelector).toBeTruthy();
        expect(cmp.rejectSelectors.length).toBeGreaterThan(0);
        expect(cmp.acceptSelectors.length).toBeGreaterThan(0);
      }
    });

    it('includes Cookiebot', () => {
      const cookiebot = CMP_DEFINITIONS.find((c) => c.name === 'Cookiebot');
      expect(cookiebot).toBeDefined();
      expect(cookiebot!.bannerSelector).toBe('#CybotCookiebotDialog');
      expect(cookiebot!.rejectSelectors).toContain('#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll');
    });

    it('includes OneTrust', () => {
      const oneTrust = CMP_DEFINITIONS.find((c) => c.name === 'OneTrust');
      expect(oneTrust).toBeDefined();
      expect(oneTrust!.bannerSelector).toBe('#onetrust-banner-sdk');
      expect(oneTrust!.rejectSelectors).toContain('#onetrust-reject-all-handler');
    });

    it('includes Complianz', () => {
      const complianz = CMP_DEFINITIONS.find((c) => c.name === 'Complianz');
      expect(complianz).toBeDefined();
      expect(complianz!.rejectSelectors).toContain('.cmplz-deny');
    });

    it('includes CookieYes', () => {
      const cookieyes = CMP_DEFINITIONS.find((c) => c.name === 'CookieYes');
      expect(cookieyes).toBeDefined();
      expect(cookieyes!.rejectSelectors).toContain('.cky-btn-reject');
    });

    it('includes Iubenda', () => {
      const iubenda = CMP_DEFINITIONS.find((c) => c.name === 'Iubenda');
      expect(iubenda).toBeDefined();
      expect(iubenda!.rejectSelectors).toContain('.iubenda-cs-reject-btn');
    });

    it('includes Didomi', () => {
      const didomi = CMP_DEFINITIONS.find((c) => c.name === 'Didomi');
      expect(didomi).toBeDefined();
      expect(didomi!.rejectSelectors).toContain('#didomi-notice-disagree-button');
    });
  });

  describe('GENERIC_BANNER_SELECTORS', () => {
    it('has generic selectors defined', () => {
      expect(GENERIC_BANNER_SELECTORS.length).toBeGreaterThan(10);
    });

    it('includes common cookie banner selectors', () => {
      expect(GENERIC_BANNER_SELECTORS).toContain('#cookie-consent');
      expect(GENERIC_BANNER_SELECTORS).toContain('.cookie-banner');
      expect(GENERIC_BANNER_SELECTORS).toContain('.cookie-consent');
    });
  });

  describe('REJECT_BUTTON_PATTERNS', () => {
    it('has multilingual reject patterns', () => {
      expect(REJECT_BUTTON_PATTERNS.length).toBeGreaterThan(20);
    });

    it('includes English patterns', () => {
      expect(REJECT_BUTTON_PATTERNS).toContain('reject');
      expect(REJECT_BUTTON_PATTERNS).toContain('decline');
      expect(REJECT_BUTTON_PATTERNS).toContain('reject all');
    });

    it('includes Dutch patterns', () => {
      expect(REJECT_BUTTON_PATTERNS).toContain('weigeren');
      expect(REJECT_BUTTON_PATTERNS).toContain('afwijzen');
    });

    it('includes German patterns', () => {
      expect(REJECT_BUTTON_PATTERNS).toContain('ablehnen');
      expect(REJECT_BUTTON_PATTERNS).toContain('alle ablehnen');
    });

    it('includes French patterns', () => {
      expect(REJECT_BUTTON_PATTERNS).toContain('tout refuser');
      expect(REJECT_BUTTON_PATTERNS).toContain('refuser');
    });
  });

  describe('COOKIE_TEXT_PATTERNS', () => {
    it('has multilingual cookie text patterns', () => {
      expect(COOKIE_TEXT_PATTERNS.length).toBeGreaterThan(10);
    });

    it('includes English cookie text', () => {
      expect(COOKIE_TEXT_PATTERNS).toContain('cookie');
      expect(COOKIE_TEXT_PATTERNS).toContain('we use cookies');
    });

    it('includes Dutch cookie text', () => {
      expect(COOKIE_TEXT_PATTERNS).toContain('wij gebruiken cookies');
    });
  });
});
