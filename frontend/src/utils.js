export const FILE_ICONS = {
  '.docx': '📄',
  '.pdf': '📄',
  '.pptx': '📊',
  '.zip': '📦',
  '.mp4': '🎥',
  '.png': '🖼️',
  '.jpg': '🖼️',
  '.jpeg': '🖼️',
}

export function getFileIcon(filename) {
  const ext = '.' + filename.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || '📎'
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Only ever render a link the browser will follow as a normal web address.
// Anything else (javascript:, data:) is dropped, so a stored URL can never
// become a way to run script in the judge's browser.
export function safeExternalUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!/^https?:\/\//i.test(trimmed)) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!parsed.hostname) return null
    return trimmed
  } catch {
    return null
  }
}
