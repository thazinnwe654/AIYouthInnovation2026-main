'use strict';

const jsdom = require('jsdom');

// Verifies safeExternalUrl rejects anything that is not a plain web address.

async function main() {
  const dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:3000/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.URL = dom.window.URL;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });

  const { safeExternalUrl } = await Promise.resolve().then(() => require('./assets/utils-BtfHHw3Y.cjs'));

  const cases = [
    ['https://youtu.be/abc', 'https://youtu.be/abc', true],
    ['http://youtu.be/abc', 'http://youtu.be/abc', true],
    ['  https://youtu.be/abc  ', 'https://youtu.be/abc', true],
    ['javascript:alert(1)', null, false],
    ['JavaScript:alert(1)', null, false],
    ['data:text/html,<script>alert(1)</script>', null, false],
    ['vbscript:msgbox(1)', null, false],
    ['//evil.example/x', null, false],
    ['/relative/path', null, false],
    ['https://', null, false],
    ['not a url at all', null, false],
    [null, null, false],
    [undefined, null, false],
    [123, null, false],
    [{}, null, false],
  ];

  let failed = 0;
  for (const [input, expected] of cases) {
    const got = safeExternalUrl(input);
    const ok = got === expected;
    if (!ok) failed++;
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${JSON.stringify(input)} -> ${JSON.stringify(got)}`);
  }
  console.log(`\n  ${cases.length - failed}/${cases.length} passed`);
  process.exit(failed ? 1 : 0);
}

main();
