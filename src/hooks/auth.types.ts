// Types, interfaces, and constants for auth
import { Timestamp } from "firebase/firestore";
import { DEFAULT_PURCHASE_LIMIT } from "@/constants";

export const PURCHASE_LIMIT = DEFAULT_PURCHASE_LIMIT;

export type UserRole = "customer" | "admin" | "super_admin";

export interface Reward {
  rewardId: string;
  claimedAt: Timestamp | null;
  scanHistory: ScanEvent[];
  // Reward details based on offer at time of creation
  rewardType: string;
  rewardValue: string;
  rewardDescription: string;
  // Offer snapshot when reward was created
  offerSnapshot: {
    offerId: string;
    offerName: string;
    description: string;
    stampRequirement: number;
    rewardType: string;
    rewardValue: string;
    rewardDescription: string;
  };
  createdAt: Timestamp;
  expiresAt?: Timestamp; // Optional expiration date
}

export interface ScanEvent {
  scannedBy: string; // Full display string: "Admin Name (admin@email.com)"
  scannedByEmail: string; // Admin's email address
  scannedByName: string; // Admin's name
  timestamp: Timestamp;
  stampsEarned: number; // Number of stamps earned in this scan
  scanId?: string; // Unique identifier for this scan
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  purchases: number;
  isRewardReady: boolean;
  createdAt: Timestamp;
  lastScanAt?: Timestamp;
  rewards?: Reward[];
  purchaseLimit?: number;
  role: UserRole;
  currentReward?: Reward;
  // Track completed rewards separately
  completedRewards?: Reward[];
  // Current active offer the user is working on
  currentOfferId?: string;
  currentOfferProgress?: number;
  // Session management
  sessionToken?: string;
  lastLoginAt?: Timestamp;
  isSessionValid?: boolean;
}

export interface Offer {
  offerId: string;
  name: string;
  description: string;
  stampRequirement: number;
  stampsPerScan: number; // New field: stamps earned per scan
  rewardType: string; // e.g., "percentage", "fixed_amount", "free_item"
  rewardValue: string; // e.g., "20", "5.00", "Free Coffee"
  rewardDescription: string; // e.g., "20% OFF", "$5.00 OFF", "Free Coffee"
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  expiresAt?: Timestamp; // New field: optional expiry date
}

export interface GlobalSettings {
  purchaseLimit: number;
  descriptionMessage: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: GlobalSettings | null;
  settingsLoading: boolean;
  allUsers: User[];
  allUsersLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    mobileNumber?: string
  ) => Promise<User>;
  addPurchase: (targetEmail?: string, targetUid?: string, offerId?: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
} 