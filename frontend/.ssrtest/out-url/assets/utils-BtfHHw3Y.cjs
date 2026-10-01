'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

// Only ever render a link the browser will follow as a normal web address.
// Anything else (javascript:, data:) is dropped, so a stored URL can never
// become a way to run script in the judge's browser.
function safeExternalUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!parsed.hostname) return null
    return trimmed
  } catch {
    return null
  }
}

exports.safeExternalUrl = safeExternalUrl;
