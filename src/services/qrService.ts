export const qrService = {
  getBatchUrl(batchId: string): string {
    let base = window.location.origin;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      base = `http://10.12.180.45:${window.location.port || '5173'}`;
    }
    return `${base}/batch/${batchId}`;
  },

  parseBatchId(url: string): string | null {
    try {
      // Handle full URLs
      if (url.startsWith('http')) {
        const u = new URL(url);
        const match = u.pathname.match(/\/batch\/([^/]+)/);
        return match ? match[1] : null;
      }
      // Handle path only
      const match = url.match(/\/batch\/([^/]+)/);
      if (match) return match[1];
      // Handle raw batch ID
      if (/^[A-Z0-9-]+$/.test(url.trim())) return url.trim();
      return null;
    } catch {
      return null;
    }
  },
};
