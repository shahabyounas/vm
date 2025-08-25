// Google Analytics 4 Configuration and Event Definitions

export const GA_TRACKING_ID = 'G-FH5MHDJ62K';

// Predefined event names for consistency
export const ANALYTICS_EVENTS = {
  // Authentication Events
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET_SUCCESS: 'password_reset_success',
  PASSWORD_RESET_FAILED: 'password_reset_failed',
  
  // QR Code Events
  QR_SCAN: 'qr_scan',
  QR_SCAN_SUCCESS: 'qr_scan_success',
  QR_SCAN_FAILED: 'qr_scan_failed',
  
  // Reward Events
  REWARD_EARNED: 'reward_earned',
  REWARD_REDEEMED: 'reward_redeemed',
  REWARD_EXPIRED: 'reward_expired',
  
  // Admin Events
  ADMIN_ACTION: 'admin_action',
  OFFER_CREATED: 'offer_created',
  OFFER_UPDATED: 'offer_updated',
  OFFER_DELETED: 'offer_deleted',
  USER_ROLE_UPDATED: 'user_role_updated',
  
  // User Engagement Events
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  ERROR_OCCURRED: 'error_occurred',
  
  // Business Events
  STAMP_COLLECTED: 'stamp_collected',
  OFFER_ACTIVATED: 'offer_activated',
  OFFER_DEACTIVATED: 'offer_deactivated',
  CUSTOMER_VISIT: 'customer_visit',
} as const;

// Predefined parameter names for consistency
export const ANALYTICS_PARAMS = {
  // User Parameters
  USER_ID: 'user_id',
  USER_ROLE: 'user_role',
  USER_EMAIL: 'user_email',
  
  // Offer Parameters
  OFFER_ID: 'offer_id',
  OFFER_NAME: 'offer_name',
  STAMPS_REQUIRED: 'stamps_required',
  STAMPS_EARNED: 'stamps_earned',
  
  // Reward Parameters
  REWARD_ID: 'reward_id',
  REWARD_TYPE: 'reward_type',
  REWARD_VALUE: 'reward_value',
  
  // Error Parameters
  ERROR_TYPE: 'error_type',
  ERROR_MESSAGE: 'error_message',
  
  // Page Parameters
  PAGE_NAME: 'page_name',
  PAGE_PATH: 'page_path',
  
  // Action Parameters
  ACTION_TYPE: 'action_type',
  ACTION_RESULT: 'action_result',
} as const;

// Custom dimensions for GA4 (if configured)
export const CUSTOM_DIMENSIONS = {
  USER_ROLE: 'custom_user_role',
  OFFER_CATEGORY: 'custom_offer_category',
  REWARD_STATUS: 'custom_reward_status',
} as const;

// Event parameter templates for common events
export const EVENT_TEMPLATES = {
  QR_SCAN: {
    [ANALYTICS_PARAMS.OFFER_ID]: '',
    [ANALYTICS_PARAMS.OFFER_NAME]: '',
    [ANALYTICS_PARAMS.STAMPS_EARNED]: 0,
    [ANALYTICS_PARAMS.USER_ID]: '',
  },
  
  REWARD_REDEEMED: {
    [ANALYTICS_PARAMS.REWARD_ID]: '',
    [ANALYTICS_PARAMS.REWARD_TYPE]: '',
    [ANALYTICS_PARAMS.REWARD_VALUE]: '',
    [ANALYTICS_PARAMS.USER_ID]: '',
  },
  
  ADMIN_ACTION: {
    [ANALYTICS_PARAMS.ACTION_TYPE]: '',
    [ANALYTICS_PARAMS.ACTION_RESULT]: '',
    [ANALYTICS_PARAMS.USER_ID]: '',
  },
} as const;

// Helper function to validate event parameters
export function validateEventParams(
  eventName: string,
  params: Record<string, unknown>
): boolean {
  // Add validation logic here if needed
  return true;
}

// Helper function to sanitize event parameters
export function sanitizeEventParams(
  params: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    // Remove sensitive data
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
      return;
    }
    
    // Sanitize email addresses (only track domain)
    if (key.toLowerCase().includes('email') && typeof value === 'string') {
      const domain = value.split('@')[1];
      sanitized[key] = domain ? `***@${domain}` : '***@***';
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}
