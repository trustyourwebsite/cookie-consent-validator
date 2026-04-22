#!/usr/bin/env node

import { validateConsent } from './scanner.js';
import type { ConsentValidationResult } from './types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

interface CliOptions {
  url: string;
  format: 'json' | 'text' | 'table';
  timeout: number;
  waitAfterReject: number;
  screenshot: boolean;
  output?: string;
  verbose: boolean;
}

function parseArgs(args: string[]): CliOptions | null {
  const positional: string[] = [];
  let format: 'json' | 'text' | 'table' = 'table';
  let timeout = 30000;
  let waitAfterReject = 3000;
  let screenshot = false;
  let output: string | undefined;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--format':
        format = args[++i] as 'json' | 'text' | 'table';
        if (!['json', 'text', 'table'].includes(format)) {
          console.error(`Invalid format: ${format}. Use json, text, or table.`);
          return null;
        }
        break;
      case '--timeout':
        timeout = parseInt(args[++i], 10);
        break;
      case '--wait-after-reject':
        waitAfterReject = parseInt(args[++i], 10);
        break;
      case '--screenshot':
        screenshot = true;
        break;
      case '--output':
      case '-o':
        output = args[++i];
        break;
      case '--verbose':
      case '-v':
        verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      case '--version':
        console.log(getVersion());
        process.exit(0);
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          return null;
        }
        positional.push(arg);
    }
  }

  if (positional.length === 0) {
    printHelp();
    return null;
  }

  let url = positional[0];
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return { url, format, timeout, waitAfterReject, screenshot, output, verbose };
}

function getVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json') as { version: string };
    return pkg.version;
  } catch {
    return '1.0.0';
  }
}

function printHelp(): void {
  console.log(`
Cookie Consent Validator
Verify that cookie consent banners actually work.

Usage:
  cookie-consent-validator <url> [options]

Options:
  --format <format>         Output format: json, text, table (default: table)
  --timeout <ms>            Page load timeout in ms (default: 30000)
  --wait-after-reject <ms>  Wait time after clicking reject (default: 3000)
  --screenshot              Save before/after screenshots
  --output, -o <file>       Save report to file
  --verbose, -v             Show debug output
  --help, -h                Show this help
  --version                 Show version

Examples:
  cookie-consent-validator https://example.com
  cookie-consent-validator example.com --format json --output report.json
  cookie-consent-validator https://example.com --screenshot --verbose

Full compliance scan → https://trustyourwebsite.com
`);
}

function formatTable(result: ConsentValidationResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('Cookie Consent Validation Report');
  lines.push('================================');
  lines.push(`URL:             ${result.url}`);
  lines.push(`Timestamp:       ${result.timestamp}`);
  lines.push(`CMP Detected:    ${result.cmpDetected || 'None'}`);
  lines.push(`Reject Button:   ${result.rejectButtonFound ? (result.rejectButtonClicked ? 'Found and clicked' : 'Found but could not click') : 'Not found'}`);
  lines.push('');
  lines.push(`Cookies Before Reject: ${result.cookiesBefore.length}`);
  lines.push(`Cookies After Reject:  ${result.cookiesAfter.length}`);

  const cookieViolations = result.violations.filter((v) => v.type === 'cookie');
  const requestViolations = result.violations.filter((v) => v.type === 'request');

  if (cookieViolations.length > 0) {
    lines.push(`Tracking Cookies After: ${cookieViolations.length}  ← VIOLATIONS`);
  }

  if (result.violations.length > 0) {
    lines.push('');
    lines.push('VIOLATIONS:');
    for (const v of cookieViolations) {
      lines.push(`  ✗ ${v.name} (${v.domain}) — ${v.description}`);
    }
    if (requestViolations.length > 0) {
      lines.push('');
      lines.push(`Tracker Requests After Reject: ${requestViolations.length}`);
      for (const v of requestViolations) {
        lines.push(`  ✗ ${v.domain} — ${v.description}`);
      }
    }
  }

  lines.push('');
  if (result.error) {
    lines.push(`Result: ERROR — ${result.error}`);
  } else if (result.passed) {
    lines.push('Result: PASS — No violations found');
  } else {
    lines.push(`Result: FAIL — ${result.violations.length} violation${result.violations.length === 1 ? '' : 's'} found`);
  }

  if (result.screenshotBefore) {
    lines.push('');
    lines.push(`Screenshots: ${result.screenshotBefore}, ${result.screenshotAfter}`);
  }

  lines.push('');
  lines.push('Full scan with remediation advice → https://trustyourwebsite.com');
  lines.push('');

  return lines.join('\n');
}

function formatText(result: ConsentValidationResult): string {
  const lines: string[] = [];

  lines.push(`URL: ${result.url}`);
  lines.push(`CMP: ${result.cmpDetected || 'None'}`);
  lines.push(`Reject: ${result.rejectButtonClicked ? 'Clicked' : result.rejectButtonFound ? 'Found, not clicked' : 'Not found'}`);
  lines.push(`Cookies: ${result.cookiesBefore.length} before, ${result.cookiesAfter.length} after`);
  lines.push(`Violations: ${result.violations.length}`);

  for (const v of result.violations) {
    lines.push(`  - [${v.type}] ${v.name} (${v.domain}): ${v.description}`);
  }

  lines.push(result.passed ? 'PASS' : result.error ? `ERROR: ${result.error}` : 'FAIL');

  return lines.join('\n');
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts) {
    process.exit(1);
  }

  console.log(`\nScanning ${opts.url}...\n`);

  const result = await validateConsent(opts.url, {
    timeout: opts.timeout,
    waitAfterReject: opts.waitAfterReject,
    screenshot: opts.screenshot,
    verbose: opts.verbose,
  });

  let output: string;
  switch (opts.format) {
    case 'json':
      output = JSON.stringify(result, null, 2);
      break;
    case 'text':
      output = formatText(result);
      break;
    case 'table':
    default:
      output = formatTable(result);
      break;
  }

  console.log(output);

  if (opts.output) {
    fs.writeFileSync(opts.output, opts.format === 'json' ? output : JSON.stringify(result, null, 2));
    console.log(`Report saved to ${opts.output}`);
  }

  process.exit(result.passed ? 0 : result.error ? 2 : 1);
}

main();
