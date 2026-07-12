export { validateConsent } from './scanner.js';
export type {
  ValidateConsentOptions,
  ConsentValidationResult,
  Cookie,
  TrackerRequest,
  Violation,
  StorageSnapshot,
  CMPDefinition,
  TrackingDomain,
} from './types.js';
export { CMP_DEFINITIONS, REJECT_BUTTON_PATTERNS } from './cmp-selectors.js';
export { TRACKING_DOMAINS, matchTracker } from './tracker-domains.js';
export { classifyCookie, isTrackingCookie, isEssentialCookie, isTrackingStorageKey } from './cookie-classifier.js';
export { detectCMP, clickRejectButton } from './cmp-detector.js';
