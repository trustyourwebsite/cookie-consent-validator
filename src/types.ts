export interface ValidateConsentOptions {
  /** Page load timeout in ms (default: 30000) */
  timeout?: number;
  /** Wait time after clicking reject in ms (default: 3000) */
  waitAfterReject?: number;
  /** Wait time for the CMP to load before interacting, in ms (default: 2000) */
  cmpLoadDelay?: number;
  /** Save before/after screenshots (default: false) */
  screenshot?: boolean;
  /** Output directory for screenshots (default: current directory) */
  outputDir?: string;
  /** Show debug output (default: false) */
  verbose?: boolean;
}

export interface Cookie {
  name: string;
  domain: string;
  value: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

export interface TrackerRequest {
  url: string;
  name: string;
  category: 'analytics' | 'advertising' | 'social';
}

export interface Violation {
  type: 'cookie' | 'request' | 'storage';
  /** Where the violation was observed. Defaults conceptually to 'cookie' for HTTP-cookie violations. */
  source: 'cookie' | 'localStorage' | 'sessionStorage' | 'request';
  name: string;
  domain: string;
  category: string;
  description: string;
}

export interface StorageSnapshot {
  /** localStorage keys present at snapshot time. */
  localStorage: string[];
  /** sessionStorage keys present at snapshot time. */
  sessionStorage: string[];
}

export interface ConsentValidationResult {
  url: string;
  timestamp: string;
  cmpDetected: string | null;
  rejectButtonFound: boolean;
  rejectButtonClicked: boolean;
  cookiesBefore: Cookie[];
  cookiesAfter: Cookie[];
  storageBefore: StorageSnapshot;
  storageAfter: StorageSnapshot;
  trackersBefore: TrackerRequest[];
  trackersAfter: TrackerRequest[];
  violations: Violation[];
  passed: boolean;
  screenshotBefore?: string;
  screenshotAfter?: string;
  error?: string;
}

export interface CMPSelectors {
  banner: string;
  acceptAll: string;
  rejectAll?: string;
  settings?: string;
}

export interface CMPDefinition {
  name: string;
  bannerSelector: string;
  rejectSelectors: string[];
  acceptSelectors: string[];
  shadowDom?: boolean;
}

export interface TrackingDomain {
  pattern: RegExp;
  name: string;
  category: 'analytics' | 'advertising' | 'social';
}
