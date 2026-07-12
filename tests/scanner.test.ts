import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StorageSnapshot } from '../src/types.js';

/**
 * Fake Puppeteer cookie record (only the fields the scanner maps).
 */
interface FakeCookie {
  name: string;
  domain: string;
  value: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

/** Config for building a fake page that drives the scanner's decision logic. */
interface FakePageConfig {
  cookiesBefore: FakeCookie[];
  cookiesAfter: FakeCookie[];
  storageBefore: StorageSnapshot;
  storageAfter: StorageSnapshot;
}

// Hoisted holder so the vi.mock factory (hoisted to top of file) can read the
// per-test config that each test assigns before calling validateConsent.
const state = vi.hoisted(() => ({
  config: null as FakePageConfig | null,
}));

vi.mock('puppeteer', () => {
  function makeCookie(c: FakeCookie): FakeCookie {
    return c;
  }

  const launch = vi.fn(async () => {
    const cfg = state.config!;
    let cookiePhase = 0;
    let storagePhase = 0;

    const page = {
      setViewport: vi.fn(async () => {}),
      on: vi.fn(),
      goto: vi.fn(async () => {}),
      // No CMP: every selector query returns null so detectCMP falls through
      // to the generic (text-based) path and finds nothing.
      $: vi.fn(async () => null),
      cookies: vi.fn(async () => {
        // First call = before, second = after.
        const list = cookiePhase === 0 ? cfg.cookiesBefore : cfg.cookiesAfter;
        cookiePhase += 1;
        return list.map(makeCookie);
      }),
      evaluate: vi.fn(async (fn: unknown) => {
        const src = typeof fn === 'function' ? fn.toString() : '';
        // getStorageSnapshot's evaluate reads window.localStorage keys.
        if (src.includes('localStorage')) {
          const snap = storagePhase === 0 ? cfg.storageBefore : cfg.storageAfter;
          storagePhase += 1;
          return snap;
        }
        // Generic banner text-detection returns "not found".
        return { found: false, rejectSelector: null };
      }),
      waitForFunction: vi.fn(async () => {}),
      screenshot: vi.fn(async () => {}),
    };

    return {
      newPage: vi.fn(async () => page),
      close: vi.fn(async () => {}),
    };
  });

  return { default: { launch } };
});

// Import AFTER the mock is registered.
import { validateConsent } from '../src/scanner.js';

function baseCookie(name: string): FakeCookie {
  return {
    name,
    domain: '.example.com',
    value: 'x',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
  };
}

const emptyStorage: StorageSnapshot = { localStorage: [], sessionStorage: [] };

describe('validateConsent (mocked puppeteer)', () => {
  beforeEach(() => {
    state.config = null;
  });

  it('passes when only essential cookies and no tracking storage persist', async () => {
    state.config = {
      cookiesBefore: [baseCookie('PHPSESSID')],
      cookiesAfter: [baseCookie('PHPSESSID')],
      storageBefore: { ...emptyStorage },
      storageAfter: { ...emptyStorage },
    };

    const result = await validateConsent('https://example.com', { cmpLoadDelay: 0 });

    expect(result.error).toBeUndefined();
    expect(result.violations).toHaveLength(0);
    expect(result.passed).toBe(true);
  });

  it('flags a tracking cookie that persists after rejection', async () => {
    state.config = {
      cookiesBefore: [baseCookie('_ga')],
      cookiesAfter: [baseCookie('_ga')],
      storageBefore: { ...emptyStorage },
      storageAfter: { ...emptyStorage },
    };

    const result = await validateConsent('https://example.com', { cmpLoadDelay: 0 });

    expect(result.passed).toBe(false);
    const cookieViolations = result.violations.filter((v) => v.type === 'cookie');
    expect(cookieViolations).toHaveLength(1);
    expect(cookieViolations[0].source).toBe('cookie');
    expect(cookieViolations[0].name).toBe('_ga');
    expect(cookieViolations[0].description).toContain('persists');
  });

  it('records a localStorage tracking key present after rejection', async () => {
    state.config = {
      cookiesBefore: [],
      cookiesAfter: [],
      storageBefore: { localStorage: [], sessionStorage: [] },
      storageAfter: { localStorage: ['_ga', 'app_theme'], sessionStorage: [] },
    };

    const result = await validateConsent('https://example.com', { cmpLoadDelay: 0 });

    const storageViolations = result.violations.filter((v) => v.type === 'storage');
    expect(storageViolations).toHaveLength(1);
    expect(storageViolations[0].source).toBe('localStorage');
    expect(storageViolations[0].name).toBe('_ga');
    expect(storageViolations[0].category).toBe('Google Analytics');
    expect(storageViolations[0].description).toContain('set after rejection');
    // Non-tracking key must not be flagged.
    expect(storageViolations.some((v) => v.name === 'app_theme')).toBe(false);
  });

  it('distinguishes persisted vs newly-set storage keys', async () => {
    state.config = {
      cookiesBefore: [],
      cookiesAfter: [],
      storageBefore: { localStorage: [], sessionStorage: ['amplitude_id'] },
      storageAfter: { localStorage: [], sessionStorage: ['amplitude_id'] },
    };

    const result = await validateConsent('https://example.com', { cmpLoadDelay: 0 });

    const storageViolations = result.violations.filter((v) => v.type === 'storage');
    expect(storageViolations).toHaveLength(1);
    expect(storageViolations[0].source).toBe('sessionStorage');
    expect(storageViolations[0].description).toContain('persists after rejection');
  });

  it('does not flag non-tracking storage keys', async () => {
    state.config = {
      cookiesBefore: [],
      cookiesAfter: [],
      storageBefore: { ...emptyStorage },
      storageAfter: { localStorage: ['cart', 'locale'], sessionStorage: ['ui_state'] },
    };

    const result = await validateConsent('https://example.com', { cmpLoadDelay: 0 });

    expect(result.violations.filter((v) => v.type === 'storage')).toHaveLength(0);
    expect(result.passed).toBe(true);
  });

  it('captures storage snapshots on the result', async () => {
    state.config = {
      cookiesBefore: [],
      cookiesAfter: [],
      storageBefore: { localStorage: ['a'], sessionStorage: [] },
      storageAfter: { localStorage: ['a', '_ga'], sessionStorage: [] },
    };

    const result = await validateConsent('https://example.com', { cmpLoadDelay: 0 });

    expect(result.storageBefore.localStorage).toEqual(['a']);
    expect(result.storageAfter.localStorage).toEqual(['a', '_ga']);
  });
});
