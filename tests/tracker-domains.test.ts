import { describe, it, expect } from 'vitest';
import { TRACKING_DOMAINS, matchTracker } from '../src/tracker-domains.js';

describe('tracker-domains', () => {
  describe('TRACKING_DOMAINS', () => {
    it('has at least 25 tracking domains defined', () => {
      expect(TRACKING_DOMAINS.length).toBeGreaterThanOrEqual(25);
    });

    it('categorizes domains correctly', () => {
      const categories = new Set(TRACKING_DOMAINS.map((d) => d.category));
      expect(categories).toContain('analytics');
      expect(categories).toContain('advertising');
      expect(categories).toContain('social');
    });
  });

  describe('matchTracker', () => {
    it('matches Google Analytics URLs', () => {
      const match = matchTracker('https://www.google-analytics.com/collect?v=1&tid=UA-123');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Google Analytics');
      expect(match!.category).toBe('analytics');
    });

    it('matches Google Tag Manager URLs', () => {
      const match = matchTracker('https://www.googletagmanager.com/gtag/js?id=G-123');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Google Tag Manager');
    });

    it('matches Facebook Pixel URLs', () => {
      const match = matchTracker('https://connect.facebook.net/en_US/fbevents.js');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Facebook Pixel');
      expect(match!.category).toBe('advertising');
    });

    it('matches Facebook tracking URLs', () => {
      const match = matchTracker('https://www.facebook.com/tr?id=123&ev=PageView');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Facebook Tracking');
    });

    it('matches Hotjar URLs', () => {
      const match = matchTracker('https://static.hotjar.com/c/hotjar-123.js');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Hotjar');
      expect(match!.category).toBe('analytics');
    });

    it('matches DoubleClick URLs', () => {
      const match = matchTracker('https://googleads.g.doubleclick.net/pagead/id');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Google Ads');
      expect(match!.category).toBe('advertising');
    });

    it('matches TikTok Pixel URLs', () => {
      const match = matchTracker('https://analytics.tiktok.com/i18n/pixel/events.js');
      expect(match).toBeDefined();
      expect(match!.name).toBe('TikTok Pixel');
    });

    it('matches LinkedIn Tracking URLs', () => {
      const match = matchTracker('https://snap.licdn.com/li.lms-analytics/insight.min.js');
      expect(match).toBeDefined();
      expect(match!.name).toBe('LinkedIn Tracking');
    });

    it('matches Pinterest Tag URLs', () => {
      const match = matchTracker('https://ct.pinterest.com/v3/?event=init&tid=123');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Pinterest Tag');
    });

    it('matches Criteo URLs', () => {
      const match = matchTracker('https://static.criteo.net/js/ld/ld.js');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Criteo');
    });

    it('matches Adobe Analytics URLs', () => {
      const match = matchTracker('https://example.omtrdc.net/b/ss/rsid/0');
      expect(match).toBeDefined();
      expect(match!.name).toBe('Adobe Analytics');
    });

    it('returns undefined for non-tracking URLs', () => {
      expect(matchTracker('https://example.com/page')).toBeUndefined();
      expect(matchTracker('https://cdn.example.com/script.js')).toBeUndefined();
      expect(matchTracker('https://fonts.googleapis.com/css')).toBeUndefined();
    });
  });
});
