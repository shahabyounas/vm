// Google Analytics 4 event tracking utility

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Track a custom event in Google Analytics 4
 * @param {string} event - The event name (e.g., 'scan_qr', 'claim_reward')
 * @param {object} [params] - Additional event parameters
 */
export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params || {});
  }
}

/**
 * Track page views in Google Analytics 4
 * @param {string} page - The page name or path
 * @param {object} [params] - Additional page view parameters
 */
export function trackPageView(page: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: page,
      page_location: window.location.href,
      ...params
    });
  }
}

/**
 * Track user login events
 * @param {string} method - Login method (email, google, etc.)
 * @param {object} [params] - Additional login parameters
 */
export function trackLogin(method: string, params?: Record<string, unknown>) {
  trackEvent('login', {
    method,
    ...params
  });
}

/**
 * Track user registration events
 * @param {string} method - Registration method
 * @param {object} [params] - Additional registration parameters
 */
export function trackSignUp(method: string, params?: Record<string, unknown>) {
  trackEvent('sign_up', {
    method,
    ...params
  });
}

/**
 * Track QR code scan events
 * @param {object} [params] - Scan parameters (offer_id, stamps_earned, etc.)
 */
export function trackQRScan(params?: Record<string, unknown>) {
  trackEvent('qr_scan', {
    ...params
  });
}

/**
 * Track reward redemption events
 * @param {string} rewardType - Type of reward redeemed
 * @param {object} [params] - Additional redemption parameters
 */
export function trackRewardRedemption(rewardType: string, params?: Record<string, unknown>) {
  trackEvent('reward_redemption', {
    reward_type: rewardType,
    ...params
  });
}

/**
 * Track admin actions
 * @param {string} action - Admin action performed
 * @param {object} [params] - Additional action parameters
 */
export function trackAdminAction(action: string, params?: Record<string, unknown>) {
  trackEvent('admin_action', {
    action,
    ...params
  });
}

/**
 * Track user engagement events
 * @param {string} engagementType - Type of engagement
 * @param {object} [params] - Additional engagement parameters
 */
export function trackEngagement(engagementType: string, params?: Record<string, unknown>) {
  trackEvent('user_engagement', {
    engagement_type: engagementType,
    ...params
  });
}

/**
 * Set user properties in Google Analytics 4
 * @param {object} properties - User properties to set
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', 'G-FH5MHDJ62K', {
      custom_map: properties
    });
  }
}

/**
 * Track user ID for cross-device tracking
 * @param {string} userId - User ID from your authentication system
 */
export function setUserId(userId: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', 'G-FH5MHDJ62K', {
      user_id: userId
    });
  }
} 