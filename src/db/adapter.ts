import * as auth from './auth';
import * as user from './user';
import * as scan from './scan';
import * as rewards from './rewards';
import * as settings from './settings';
import * as admin from './admin';
import * as offers from './offers';

// Helper to wrap async functions with error handling and preserve types
function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, name: string): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T> extends Promise<infer R> ? R : never> => {
    try {
      return (await fn(...args)) as unknown as ReturnType<T> extends Promise<infer R> ? R : never;
    } catch (error) {
      console.error(`${name} error:`, error);
      throw error;
    }
  }) as T;
}

// Auth
export const loginUser = withErrorHandling(auth.loginUser, 'loginUser');
export const registerUser = withErrorHandling(auth.registerUser, 'registerUser');
export const logoutUser = withErrorHandling(auth.logoutUser, 'logoutUser');
export const subscribeToAuthState = auth.subscribeToAuthState;


// User
export const fetchAllUsers = user.fetchAllUsers;
export const fetchUserRealtime = user.fetchUserRealtime;
export const updateUserRole = withErrorHandling(user.updateUserRole, 'updateUserRole');

// Scan
export const addPurchase = withErrorHandling(scan.addPurchase, 'addPurchase');

// Rewards
export const redeemReward = withErrorHandling(rewards.redeemReward, 'redeemReward');

// Settings
export const fetchGlobalSettings = settings.fetchGlobalSettings;
export const updateSettings = withErrorHandling(settings.updateSettings, 'updateSettings');

// Offers
export const fetchAllOffers = offers.fetchAllOffers;
export const fetchActiveOffers = offers.fetchActiveOffers;
export const createOffer = withErrorHandling(offers.createOffer, 'createOffer');
export const updateOffer = withErrorHandling(offers.updateOffer, 'updateOffer');
export const deleteOffer = withErrorHandling(offers.deleteOffer, 'deleteOffer');
export const createDefaultOffer = withErrorHandling(offers.createDefaultOffer, 'createDefaultOffer');
export const assignOfferToUser = withErrorHandling(offers.assignOfferToUser, 'assignOfferToUser');
export const getUserCurrentOffer = offers.getUserCurrentOffer;

export const resetAllData = admin.resetAllData; 