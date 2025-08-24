// Security utilities for registration and authentication

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number; lastRequest: number }>();

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_REGISTRATIONS_PER_IP: 3, // Max registrations per IP per hour
  MAX_REGISTRATIONS_PER_EMAIL: 1, // Max registrations per email address
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour in milliseconds
  
  // Request throttling
  MIN_REQUEST_INTERVAL: 3000, // Minimum 3 seconds between requests
  MAX_REQUESTS_PER_MINUTE: 5, // Max requests per minute per IP
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  
  // Email validation
  BLOCKED_EMAIL_DOMAINS: [
    'tempmail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwaway.email',
    'fakeinbox.com', 'sharklasers.com', 'grr.la', 'temp-mail.org',
    'dispostable.com', 'mailnesia.com', 'maildrop.cc'
  ],
  
  // Phone validation
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  
  // Name validation
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  
  // Suspicious patterns (excluding sequential patterns for user convenience)
  SUSPICIOUS_PATTERNS: [
    /test\d+/i,
    /user\d+/i,
    /admin\d+/i,
    /demo\d+/i,
    /fake\d+/i,
    /spam\d+/i,
    /bot\d+/i,
    /scam\d+/i,
    /temp\d+/i,
    /dummy\d+/i
  ]
};

// Get client identifier (in production, this would come from your backend)
export const getClientIdentifier = (): string => {
  // This is a placeholder - in production, implement proper IP detection
  // For now, we'll use a combination of user agent and timestamp as a proxy
  return `${navigator.userAgent.slice(0, 20)}_${Date.now()}`;
};

// Rate limiting for registration
export const checkRateLimit = (identifier: string, type: 'ip' | 'email'): boolean => {
  const now = Date.now();
  const key = `${type}:${identifier}`;
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      lastRequest: now
    });
    return true;
  }
  
  if (record.count >= (type === 'ip' ? SECURITY_CONFIG.MAX_REGISTRATIONS_PER_IP : SECURITY_CONFIG.MAX_REGISTRATIONS_PER_EMAIL)) {
    return false;
  }
  
  record.count++;
  record.lastRequest = now;
  return true;
};

// Request throttling
export const checkRequestThrottle = (identifier: string): boolean => {
  const now = Date.now();
  const key = `throttle:${identifier}`;
  const record = rateLimitStore.get(key);
  
  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000, lastRequest: now }); // 1 minute window
    return true;
  }
  
  // Check minimum interval between requests
  if (now - record.lastRequest < SECURITY_CONFIG.MIN_REQUEST_INTERVAL) {
    return false;
  }
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + 60000;
    record.lastRequest = now;
    return true;
  }
  
  if (record.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  record.count++;
  record.lastRequest = now;
  return true;
};

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'password123', '123456789'];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }
  
  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Convert to lowercase for case-insensitive validation
  const normalizedEmail = email.toLowerCase();
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    errors.push('Please enter a valid email address');
    return { isValid: false, errors };
  }
  
  // Check for blocked domains
  const domain = normalizedEmail.split('@')[1]?.toLowerCase();
  if (domain && SECURITY_CONFIG.BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    errors.push('Temporary or disposable email addresses are not allowed');
  }
  
  // Check for suspicious patterns
  const localPart = normalizedEmail.split('@')[0];
  if (SECURITY_CONFIG.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(localPart))) {
    errors.push('Email address contains suspicious patterns');
  }
  
  // Check length limits
  if (normalizedEmail.length > 254) {
    errors.push('Email address is too long');
  }
  
  if (localPart.length > 64) {
    errors.push('Email username part is too long');
  }
  
  // Check for excessive dots or special characters
  if ((localPart.match(/\./g) || []).length > 3) {
    errors.push('Email username contains too many dots');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < SECURITY_CONFIG.MIN_PHONE_LENGTH) {
    errors.push(`Phone number must be at least ${SECURITY_CONFIG.MIN_PHONE_LENGTH} digits`);
  }
  
  if (digitsOnly.length > SECURITY_CONFIG.MAX_PHONE_LENGTH) {
    errors.push(`Phone number must be no more than ${SECURITY_CONFIG.MAX_PHONE_LENGTH} digits`);
  }
  
  // Check for suspicious patterns
  if (/(\d)\1{5,}/.test(digitsOnly)) {
    errors.push('Phone number contains suspicious repeating patterns');
  }
  
  // Check for all same digits
  if (/^(\d)\1+$/.test(digitsOnly)) {
    errors.push('Phone number cannot be all the same digit');
  }
  
  // Check for common test numbers
  const testNumbers = ['1234567890', '0000000000', '1111111111', '9999999999'];
  if (testNumbers.includes(digitsOnly)) {
    errors.push('Phone number appears to be a test number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (name.length < SECURITY_CONFIG.MIN_NAME_LENGTH) {
    errors.push(`Name must be at least ${SECURITY_CONFIG.MIN_NAME_LENGTH} characters long`);
  }
  
  if (name.length > SECURITY_CONFIG.MAX_NAME_LENGTH) {
    errors.push(`Name must be no more than ${SECURITY_CONFIG.MAX_NAME_LENGTH} characters long`);
  }
  
  // Check for suspicious patterns
  if (SECURITY_CONFIG.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(name))) {
    errors.push('Name contains suspicious patterns');
  }
  
  // Check for excessive special characters
  const specialCharCount = (name.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length;
  if (specialCharCount > name.length * 0.3) {
    errors.push('Name contains too many special characters');
  }
  
  // Check for excessive numbers
  const numberCount = (name.match(/\d/g) || []).length;
  if (numberCount > name.length * 0.5) {
    errors.push('Name contains too many numbers');
  }
  
  // Check for common test names
  const testNames = ['test', 'user', 'admin', 'demo', 'fake', 'spam', 'bot', 'scam'];
  if (testNames.some(testName => name.toLowerCase().includes(testName))) {
    errors.push('Name contains suspicious words');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Browser fingerprinting (basic implementation)
export const generateBrowserFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
      return canvas.toDataURL();
    }
  } catch (error) {
    console.warn('Canvas fingerprinting not available');
  }
  
  // Fallback fingerprint
  return `${navigator.userAgent}_${navigator.language}_${screen.width}x${screen.height}_${new Date().getTimezoneOffset()}`;
};

// Security audit logging
export const logSecurityEvent = (event: string, details: Record<string, unknown>): void => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    fingerprint: generateBrowserFingerprint(),
    identifier: getClientIdentifier(),
    url: window.location.href,
    referrer: document.referrer
  };
  
  console.log('🔒 Security Event:', securityLog);
  
  // In production, send this to your security monitoring system
  // fetch('/api/security-log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(securityLog)
  // });
};

// Clean up expired rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
