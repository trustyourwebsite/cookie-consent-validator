import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseArgs, formatTable, formatText } from '../src/cli.js';
import type { ConsentValidationResult, Violation } from '../src/types.js';

describe('cli parseArgs', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('applies defaults for a bare URL', () => {
    const opts = parseArgs(['https://example.com']);
    expect(opts).not.toBeNull();
    expect(opts!.url).toBe('https://example.com');
    expect(opts!.format).toBe('table');
    expect(opts!.timeout).toBe(30000);
    expect(opts!.waitAfterReject).toBe(3000);
    expect(opts!.cmpLoadDelay).toBe(2000);
    expect(opts!.screenshot).toBe(false);
    expect(opts!.verbose).toBe(false);
  });

  it('prefixes https:// when scheme is missing', () => {
    const opts = parseArgs(['example.com']);
    expect(opts!.url).toBe('https://example.com');
  });

  it('preserves http:// scheme', () => {
    const opts = parseArgs(['http://example.com']);
    expect(opts!.url).toBe('http://example.com');
  });

  it('parses the --cmp-delay flag', () => {
    const opts = parseArgs(['example.com', '--cmp-delay', '5000']);
    expect(opts!.cmpLoadDelay).toBe(5000);
  });

  it('accepts --cmp-delay of 0', () => {
    const opts = parseArgs(['example.com', '--cmp-delay', '0']);
    expect(opts!.cmpLoadDelay).toBe(0);
  });

  it('parses all numeric flags together', () => {
    const opts = parseArgs([
      'example.com',
      '--timeout',
      '10000',
      '--wait-after-reject',
      '1500',
      '--cmp-delay',
      '2500',
    ]);
    expect(opts!.timeout).toBe(10000);
    expect(opts!.waitAfterReject).toBe(1500);
    expect(opts!.cmpLoadDelay).toBe(2500);
  });

  it('parses --screenshot, --verbose and --output', () => {
    const opts = parseArgs(['example.com', '--screenshot', '--verbose', '-o', 'report.json']);
    expect(opts!.screenshot).toBe(true);
    expect(opts!.verbose).toBe(true);
    expect(opts!.output).toBe('report.json');
  });

  describe('format validation', () => {
    it('accepts json, text and table', () => {
      expect(parseArgs(['example.com', '--format', 'json'])!.format).toBe('json');
      expect(parseArgs(['example.com', '--format', 'text'])!.format).toBe('text');
      expect(parseArgs(['example.com', '--format', 'table'])!.format).toBe('table');
    });

    it('rejects an unknown format', () => {
      expect(parseArgs(['example.com', '--format', 'yaml'])).toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('rejects a missing format value', () => {
      expect(parseArgs(['example.com', '--format'])).toBeNull();
    });
  });

  describe('timeout validation', () => {
    it('rejects a non-numeric timeout', () => {
      expect(parseArgs(['example.com', '--timeout', 'abc'])).toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('rejects a negative timeout', () => {
      expect(parseArgs(['example.com', '--timeout', '-100'])).toBeNull();
    });

    it('rejects a fractional timeout', () => {
      expect(parseArgs(['example.com', '--timeout', '12.5'])).toBeNull();
    });

    it('rejects a missing timeout value', () => {
      expect(parseArgs(['example.com', '--timeout'])).toBeNull();
    });
  });

  describe('cmp-delay validation', () => {
    it('rejects a non-numeric cmp-delay', () => {
      expect(parseArgs(['example.com', '--cmp-delay', 'soon'])).toBeNull();
    });
  });

  it('returns null for unknown options', () => {
    expect(parseArgs(['example.com', '--nope'])).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns null when no positional URL is given', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(parseArgs([])).toBeNull();
    logSpy.mockRestore();
  });
});

function makeResult(overrides: Partial<ConsentValidationResult> = {}): ConsentValidationResult {
  return {
    url: 'https://example.com',
    timestamp: '2026-07-12T00:00:00.000Z',
    cmpDetected: 'Cookiebot',
    rejectButtonFound: true,
    rejectButtonClicked: true,
    cookiesBefore: [],
    cookiesAfter: [],
    storageBefore: { localStorage: [], sessionStorage: [] },
    storageAfter: { localStorage: [], sessionStorage: [] },
    trackersBefore: [],
    trackersAfter: [],
    violations: [],
    passed: true,
    ...overrides,
  };
}

const cookieViolation: Violation = {
  type: 'cookie',
  source: 'cookie',
  name: '_ga',
  domain: '.example.com',
  category: 'Google Analytics',
  description: 'Google Analytics cookie persists after rejection',
};

const storageViolation: Violation = {
  type: 'storage',
  source: 'localStorage',
  name: 'amplitude_id',
  domain: '',
  category: 'Amplitude',
  description: 'Amplitude localStorage key persists after rejection',
};

const requestViolation: Violation = {
  type: 'request',
  source: 'request',
  name: 'Facebook Pixel',
  domain: 'connect.facebook.net',
  category: 'advertising',
  description: 'Facebook Pixel request fired after rejection',
};

describe('cli formatters', () => {
  describe('formatTable', () => {
    it('reports a clean pass', () => {
      const out = formatTable(makeResult());
      expect(out).toContain('Result: PASS');
      expect(out).not.toContain('VIOLATIONS:');
    });

    it('surfaces cookie, storage and request violations', () => {
      const out = formatTable(
        makeResult({
          passed: false,
          violations: [cookieViolation, storageViolation, requestViolation],
        }),
      );
      expect(out).toContain('Result: FAIL — 3 violations found');
      expect(out).toContain('_ga (.example.com)');
      expect(out).toContain('Tracking Storage Keys After Reject: 1');
      expect(out).toContain('amplitude_id [localStorage]');
      expect(out).toContain('Tracker Requests After Reject: 1');
      expect(out).toContain('connect.facebook.net');
    });

    it('renders an error result', () => {
      const out = formatTable(makeResult({ passed: false, error: 'boom' }));
      expect(out).toContain('Result: ERROR — boom');
    });
  });

  describe('formatText', () => {
    it('omits parentheses when a violation has no domain', () => {
      const out = formatText(makeResult({ passed: false, violations: [storageViolation] }));
      expect(out).toContain('[localStorage] amplitude_id:');
      expect(out).not.toContain('amplitude_id ():');
      expect(out).toContain('FAIL');
    });

    it('includes the domain when present', () => {
      const out = formatText(makeResult({ passed: false, violations: [cookieViolation] }));
      expect(out).toContain('[cookie] _ga (.example.com):');
    });

    it('reports PASS when there are no violations', () => {
      expect(formatText(makeResult())).toContain('PASS');
    });
  });
});
