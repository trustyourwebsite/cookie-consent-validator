import type { TrackingDomain } from './types.js';

/**
 * Known tracking domains with name and category metadata.
 * Used to identify tracker network requests before and after consent rejection.
 */
export const TRACKING_DOMAINS: TrackingDomain[] = [
  // Analytics
  { pattern: /google-analytics\.com/i, name: 'Google Analytics', category: 'analytics' },
  { pattern: /googletagmanager\.com/i, name: 'Google Tag Manager', category: 'analytics' },
  { pattern: /analytics\.google\.com/i, name: 'Google Analytics', category: 'analytics' },
  { pattern: /hotjar\.com/i, name: 'Hotjar', category: 'analytics' },
  { pattern: /clarity\.ms/i, name: 'Microsoft Clarity', category: 'analytics' },
  { pattern: /plausible\.io/i, name: 'Plausible', category: 'analytics' },
  { pattern: /matomo\./i, name: 'Matomo', category: 'analytics' },
  { pattern: /mixpanel\.com/i, name: 'Mixpanel', category: 'analytics' },
  { pattern: /amplitude\.com/i, name: 'Amplitude', category: 'analytics' },
  { pattern: /segment\.com/i, name: 'Segment', category: 'analytics' },
  { pattern: /heapanalytics\.com/i, name: 'Heap', category: 'analytics' },
  { pattern: /posthog\.com/i, name: 'PostHog', category: 'analytics' },
  { pattern: /fullstory\.com/i, name: 'FullStory', category: 'analytics' },
  { pattern: /mouseflow\.com/i, name: 'Mouseflow', category: 'analytics' },
  { pattern: /luckyorange\.com/i, name: 'Lucky Orange', category: 'analytics' },
  // Advertising
  { pattern: /connect\.facebook\.net/i, name: 'Facebook Pixel', category: 'advertising' },
  { pattern: /facebook\.com\/tr[/?]/i, name: 'Facebook Tracking', category: 'advertising' },
  { pattern: /doubleclick\.net/i, name: 'Google Ads', category: 'advertising' },
  { pattern: /googlesyndication\.com/i, name: 'Google AdSense', category: 'advertising' },
  { pattern: /googleadservices\.com/i, name: 'Google Ads', category: 'advertising' },
  { pattern: /linkedin\.com\/px/i, name: 'LinkedIn Insight', category: 'advertising' },
  { pattern: /snap\.licdn\.com/i, name: 'LinkedIn Tracking', category: 'advertising' },
  { pattern: /ads\.twitter\.com/i, name: 'Twitter Ads', category: 'advertising' },
  { pattern: /analytics\.tiktok\.com/i, name: 'TikTok Pixel', category: 'advertising' },
  { pattern: /bat\.bing\.com/i, name: 'Bing Ads', category: 'advertising' },
  { pattern: /ct\.pinterest\.com/i, name: 'Pinterest Tag', category: 'advertising' },
  { pattern: /tr\.snapchat\.com/i, name: 'Snapchat Pixel', category: 'advertising' },
  { pattern: /static\.criteo\.net/i, name: 'Criteo', category: 'advertising' },
  { pattern: /omtrdc\.net/i, name: 'Adobe Analytics', category: 'advertising' },
  // Social
  { pattern: /platform\.twitter\.com\/widgets/i, name: 'Twitter Widget', category: 'social' },
  { pattern: /platform\.linkedin\.com/i, name: 'LinkedIn Widget', category: 'social' },
];

/**
 * Match a URL against known tracking domains.
 * @returns The matching tracking domain entry, or undefined.
 */
export function matchTracker(url: string): TrackingDomain | undefined {
  return TRACKING_DOMAINS.find((d) => d.pattern.test(url));
}
