import { describe, it, expect } from 'vitest';
import {
  classifyCookie,
  isTrackingCookie,
  isEssentialCookie,
  getTrackingCookieCategory,
  TRACKING_COOKIE_PATTERNS,
  ESSENTIAL_COOKIE_PATTERNS,
} from '../src/cookie-classifier.js';
import type { Cookie } from '../src/types.js';

function makeCookie(name: string, domain = '.example.com'): Cookie {
  return {
    name,
    domain,
    value: 'test',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
  };
}

describe('cookie-classifier', () => {
  describe('classifyCookie', () => {
    it('classifies Google Analytics cookies as tracking', () => {
      expect(classifyCookie(makeCookie('_ga'))).toBe('tracking');
      expect(classifyCookie(makeCookie('_gid'))).toBe('tracking');
      expect(classifyCookie(makeCookie('_gat_gtag_UA_123'))).toBe('tracking');
    });

    it('classifies Facebook cookies as tracking', () => {
      expect(classifyCookie(makeCookie('_fbp'))).toBe('tracking');
      expect(classifyCookie(makeCookie('_fbc'))).toBe('tracking');
      expect(classifyCookie(makeCookie('fr'))).toBe('tracking');
    });

    it('classifies Hotjar cookies as tracking', () => {
      expect(classifyCookie(makeCookie('_hjid'))).toBe('tracking');
      expect(classifyCookie(makeCookie('_hjSessionUser_123'))).toBe('tracking');
    });

    it('classifies session cookies as essential', () => {
      expect(classifyCookie(makeCookie('PHPSESSID'))).toBe('essential');
      expect(classifyCookie(makeCookie('JSESSIONID'))).toBe('essential');
      expect(classifyCookie(makeCookie('session_id'))).toBe('essential');
    });

    it('classifies CSRF cookies as essential', () => {
      expect(classifyCookie(makeCookie('_csrf'))).toBe('essential');
      expect(classifyCookie(makeCookie('XSRF-TOKEN'))).toBe('essential');
    });

    it('classifies CMP consent cookies as essential', () => {
      expect(classifyCookie(makeCookie('CookieConsent'))).toBe('essential');
      expect(classifyCookie(makeCookie('OptanonConsent'))).toBe('essential');
      expect(classifyCookie(makeCookie('cmplz_functional'))).toBe('essential');
    });

    it('classifies Cloudflare cookies as essential', () => {
      expect(classifyCookie(makeCookie('__cf_bm'))).toBe('essential');
      expect(classifyCookie(makeCookie('cf_clearance'))).toBe('essential');
    });

    it('classifies unknown cookies as unknown', () => {
      expect(classifyCookie(makeCookie('my_custom_cookie'))).toBe('unknown');
      expect(classifyCookie(makeCookie('prefs'))).toBe('unknown');
    });
  });

  describe('isTrackingCookie', () => {
    it('returns true for tracking cookies', () => {
      expect(isTrackingCookie(makeCookie('_ga'))).toBe(true);
      expect(isTrackingCookie(makeCookie('_fbp'))).toBe(true);
      expect(isTrackingCookie(makeCookie('_gcl_au'))).toBe(true);
    });

    it('returns false for non-tracking cookies', () => {
      expect(isTrackingCookie(makeCookie('PHPSESSID'))).toBe(false);
      expect(isTrackingCookie(makeCookie('my_pref'))).toBe(false);
    });
  });

  describe('isEssentialCookie', () => {
    it('returns true for essential cookies', () => {
      expect(isEssentialCookie(makeCookie('PHPSESSID'))).toBe(true);
      expect(isEssentialCookie(makeCookie('CookieConsent'))).toBe(true);
    });

    it('returns false for non-essential cookies', () => {
      expect(isEssentialCookie(makeCookie('_ga'))).toBe(false);
      expect(isEssentialCookie(makeCookie('custom'))).toBe(false);
    });
  });

  describe('getTrackingCookieCategory', () => {
    it('identifies Google Analytics cookies', () => {
      expect(getTrackingCookieCategory('_ga')).toBe('Google Analytics');
      expect(getTrackingCookieCategory('_gid')).toBe('Google Analytics');
    });

    it('identifies Google Ads cookies', () => {
      expect(getTrackingCookieCategory('_gcl_au')).toBe('Google Ads');
    });

    it('identifies Facebook cookies', () => {
      expect(getTrackingCookieCategory('_fbp')).toBe('Facebook');
      expect(getTrackingCookieCategory('fr')).toBe('Facebook');
    });

    it('identifies Hotjar cookies', () => {
      expect(getTrackingCookieCategory('_hjid')).toBe('Hotjar');
    });

    it('identifies LinkedIn cookies', () => {
      expect(getTrackingCookieCategory('li_sugr')).toBe('LinkedIn');
    });

    it('returns Unknown tracker for unmatched patterns', () => {
      expect(getTrackingCookieCategory('random_cookie')).toBe('Unknown tracker');
    });
  });

  describe('pattern arrays', () => {
    it('has tracking patterns defined', () => {
      expect(TRACKING_COOKIE_PATTERNS.length).toBeGreaterThan(0);
    });

    it('has essential patterns defined', () => {
      expect(ESSENTIAL_COOKIE_PATTERNS.length).toBeGreaterThan(0);
    });
  });
});
