import type { Cookie } from './types.js';

/** Cookie name patterns that indicate tracking (not essential). */
export const TRACKING_COOKIE_PATTERNS: RegExp[] = [
  /^_ga/i, /^_gid/i, /^_gat/i, /^_gcl/i,     // Google Analytics / Ads
  /^_fbp/i, /^_fbc/i, /^fr$/i,                  // Facebook
  /^_hj/i,                                       // Hotjar
  /^_clck/i, /^_clsk/i,                          // Clarity
  /^_pin_/i,                                      // Pinterest
  /^_tt_/i,                                       // TikTok
  /^ln_or/i, /^li_/i,                            // LinkedIn
  /^IDE$/i, /^test_cookie/i, /^DSID/i,           // DoubleClick
  /^NID$/i, /^ANID$/i, /^APISID$/i,             // Google
  /^mp_/i,                                        // Mixpanel
  /^amplitude/i,                                  // Amplitude
  /^YSC$/i, /^VISITOR_INFO1_LIVE$/i, /^PREF$/i,  // YouTube
  /^_rdt_uuid/i,                                  // Reddit
  /^ad-id$/i, /^ad-privacy$/i,                    // Amazon
];

/** Cookie patterns that are strictly necessary and do not require consent. */
export const ESSENTIAL_COOKIE_PATTERNS: RegExp[] = [
  // Session cookies
  /^PHPSESSID$/i, /^JSESSIONID$/i, /^connect\.sid$/i, /^session/i, /^sid$/i,
  // CSRF protection
  /^_csrf/i, /^csrf/i, /^XSRF-TOKEN$/i, /^__Host-/i,
  // CDN / security
  /^__cf_bm$/i, /^cf_clearance$/i, /^__cfduid$/i, /^__cf/i,
  // CMP consent storage
  /^CookieConsent$/i, /^cookieconsent_status$/i, /^OptanonConsent$/i,
  /^didomi/i, /^euconsent/i, /^cmplz/i, /^borlabs/i, /^cky-consent$/i,
  // Load balancers
  /^AWSALB/i, /^SERVERID/i, /^BIGipServer/i,
  // Language / locale
  /^locale$/i, /^lang$/i, /^language$/i, /^i18n/i,
  // Cart / essential e-commerce
  /^cart$/i, /^wc_cart/i,
  // WordPress / WooCommerce essential
  /^wp-/i, /^wc_/i, /^wordpress_/i,
];

/**
 * Classify a cookie as tracking or essential.
 * @returns 'tracking' if the cookie matches known tracking patterns,
 *          'essential' if it matches essential patterns,
 *          'unknown' otherwise.
 */
export function classifyCookie(cookie: Cookie): 'tracking' | 'essential' | 'unknown' {
  if (ESSENTIAL_COOKIE_PATTERNS.some((p) => p.test(cookie.name))) {
    return 'essential';
  }
  if (TRACKING_COOKIE_PATTERNS.some((p) => p.test(cookie.name))) {
    return 'tracking';
  }
  return 'unknown';
}

/**
 * Check if a cookie is a known tracking cookie.
 */
export function isTrackingCookie(cookie: Cookie): boolean {
  return TRACKING_COOKIE_PATTERNS.some((p) => p.test(cookie.name));
}

/**
 * Check if a cookie is essential (does not require consent).
 */
export function isEssentialCookie(cookie: Cookie): boolean {
  return ESSENTIAL_COOKIE_PATTERNS.some((p) => p.test(cookie.name));
}

/**
 * Get the tracker name for a tracking cookie based on its name pattern.
 */
export function getTrackingCookieCategory(cookieName: string): string {
  if (/^_ga|^_gid|^_gat/i.test(cookieName)) return 'Google Analytics';
  if (/^_gcl/i.test(cookieName)) return 'Google Ads';
  if (/^_fbp|^_fbc|^fr$/i.test(cookieName)) return 'Facebook';
  if (/^_hj/i.test(cookieName)) return 'Hotjar';
  if (/^_clck|^_clsk/i.test(cookieName)) return 'Microsoft Clarity';
  if (/^_pin_/i.test(cookieName)) return 'Pinterest';
  if (/^_tt_/i.test(cookieName)) return 'TikTok';
  if (/^ln_or|^li_/i.test(cookieName)) return 'LinkedIn';
  if (/^IDE$|^test_cookie|^DSID/i.test(cookieName)) return 'DoubleClick';
  if (/^NID$|^ANID$|^APISID$/i.test(cookieName)) return 'Google';
  if (/^mp_/i.test(cookieName)) return 'Mixpanel';
  if (/^amplitude/i.test(cookieName)) return 'Amplitude';
  if (/^YSC$|^VISITOR_INFO1_LIVE$|^PREF$/i.test(cookieName)) return 'YouTube';
  if (/^_rdt_uuid/i.test(cookieName)) return 'Reddit';
  if (/^ad-id$|^ad-privacy$/i.test(cookieName)) return 'Amazon';
  return 'Unknown tracker';
}
