import type { CMPDefinition } from './types.js';

/**
 * Known CMP definitions with banner detection selectors and reject/accept button selectors.
 * Ordered by market share for faster detection.
 */
export const CMP_DEFINITIONS: CMPDefinition[] = [
  {
    name: 'Cookiebot',
    bannerSelector: '#CybotCookiebotDialog',
    rejectSelectors: [
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
      '#CybotCookiebotDialogBodyButtonDecline',
    ],
    acceptSelectors: [
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '#CybotCookiebotDialogBodyButtonAccept',
    ],
  },
  {
    name: 'OneTrust',
    bannerSelector: '#onetrust-banner-sdk',
    rejectSelectors: [
      '#onetrust-reject-all-handler',
      '.ot-pc-refuse-all-handler',
    ],
    acceptSelectors: [
      '#onetrust-accept-btn-handler',
    ],
  },
  {
    name: 'Quantcast',
    bannerSelector: '#qc-cmp2-container',
    rejectSelectors: [
      '#qc-cmp2-container button[mode="secondary"]',
    ],
    acceptSelectors: [
      '#qc-cmp2-container button[mode="primary"]',
    ],
  },
  {
    name: 'Didomi',
    bannerSelector: '#didomi-notice',
    rejectSelectors: [
      '#didomi-notice-disagree-button',
    ],
    acceptSelectors: [
      '#didomi-notice-agree-button',
    ],
  },
  {
    name: 'Osano',
    bannerSelector: '.osano-cm-window',
    rejectSelectors: [
      '.osano-cm-deny',
    ],
    acceptSelectors: [
      '.osano-cm-accept-all',
    ],
  },
  {
    name: 'Complianz',
    bannerSelector: '.cmplz-cookiebanner',
    rejectSelectors: [
      '.cmplz-deny',
      '.cmplz-btn.cmplz-deny',
    ],
    acceptSelectors: [
      '.cmplz-accept',
    ],
  },
  {
    name: 'CookieYes',
    bannerSelector: '.cky-consent-container',
    rejectSelectors: [
      '.cky-btn-reject',
      '[data-cky-tag="reject-button"]',
    ],
    acceptSelectors: [
      '.cky-btn-accept',
    ],
  },
  {
    name: 'Iubenda',
    bannerSelector: '.iubenda-cs-container',
    rejectSelectors: [
      '.iubenda-cs-reject-btn',
    ],
    acceptSelectors: [
      '.iubenda-cs-accept-btn',
    ],
  },
  {
    name: 'Borlabs Cookie',
    bannerSelector: '#BorlabsCookieBox',
    rejectSelectors: [
      '[data-cookie-refuse]',
    ],
    acceptSelectors: [
      '[data-cookie-accept]',
    ],
  },
  {
    name: 'TrustArc',
    bannerSelector: '#truste-consent-banner',
    rejectSelectors: [
      '.truste-consent-required',
    ],
    acceptSelectors: [
      '#truste-consent-button',
    ],
  },
  {
    name: 'CookieFirst',
    bannerSelector: '#cookiefirst-root',
    rejectSelectors: [
      '[data-cookiefirst-action="reject"]',
    ],
    acceptSelectors: [
      '[data-cookiefirst-action="accept"]',
    ],
  },
];

/**
 * Generic banner selectors for detecting unknown CMPs.
 */
export const GENERIC_BANNER_SELECTORS = [
  '#cookie-consent', '#cookieconsent', '#cookie-banner', '#cookie-notice',
  '.cc-banner', '.cc-window', '.cookie-banner', '.cookie-consent',
  '.cookie-notice', '.cookie-popup', '.consent-banner',
  '[class*="cookie-consent"]', '[class*="cookie-banner"]',
  '[id*="cookie"]', '[class*="gdpr"]', '[id*="gdpr"]',
  '[data-testid="cookie-banner"]', '.CookieConsent',
  '#cc-main', '.cl-consent', '#cl-consent',
  '#cs-banner', '.cs-banner',
  '#moove_gdpr_cookie_info_bar',
];

/**
 * Multilingual text patterns to identify reject buttons in unknown CMPs.
 */
export const REJECT_BUTTON_PATTERNS = [
  // EN
  'reject', 'decline', 'deny', 'refuse', 'no thanks', 'reject all',
  // NL
  'weigeren', 'afwijzen', 'alles weigeren', 'niet akkoord',
  // DE
  'ablehnen', 'alle ablehnen', 'nicht zustimmen',
  // FR
  'tout refuser', 'refuser', 'rejeter',
  // IT
  'rifiuta', 'rifiuta tutto',
  // ES
  'rechazar', 'rechazar todo', 'rechazar todas',
  // PT
  'rejeitar', 'rejeitar tudo',
  // PL
  'odrzuć', 'odrzuć wszystkie',
  // SV
  'avslå', 'avslå alla', 'neka',
  // DA
  'afvis', 'afvis alle',
  // NO
  'avslå', 'avslå alle', 'avvis',
  // FI
  'hylkää', 'hylkää kaikki',
  // CS
  'odmítnout', 'odmítnout vše',
];

/**
 * Multilingual text patterns to identify cookie-related banners.
 */
export const COOKIE_TEXT_PATTERNS = [
  'cookie', 'cookies', 'we use cookies', 'this website uses',
  'koekje', 'koekjes', 'wij gebruiken cookies', 'deze website gebruikt',
  'diese website verwendet cookies', 'wir verwenden cookies',
  'ce site utilise des cookies', 'nous utilisons des cookies',
  'questo sito utilizza cookie', 'utilizziamo cookie',
  'este sitio utiliza cookies', 'utilizamos cookies',
  'este site utiliza cookies',
  'ta strona używa plików cookie',
  'den här webbplatsen använder cookies',
  'denne hjemmeside bruger cookies',
  'dette nettstedet bruker informasjonskapsler',
  'tämä sivusto käyttää evästeitä',
  'tento web používá soubory cookie',
];
