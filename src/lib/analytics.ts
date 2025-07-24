// Google Analytics 4 event tracking utility

/**
 * Track a custom event in Google Analytics 4
 * @param {string} event - The event name (e.g., 'scan_qr', 'claim_reward')
 * @param {object} [params] - Additional event parameters
 */
export function trackEvent(event: string, params?: Record<string, unknown>) {
  const win = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof window !== 'undefined' && typeof win.gtag === 'function') {
    win.gtag('event', event, params || {});
  }
} 