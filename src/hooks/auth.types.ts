// Types, interfaces, and constants for auth
import { Timestamp } from "firebase/firestore";
import { DEFAULT_PURCHASE_LIMIT } from "@/constants";

export const PURCHASE_LIMIT = DEFAULT_PURCHASE_LIMIT;

export type UserRole = "customer" | "admin" | "super_admin";

export interface Reward {
  rewardId: string;
  claimedAt: Timestamp | null;
  scanHistory: ScanEvent[];
}

export interface ScanEvent {
  scannedBy: string;
  timestamp: Timestamp;
}

export interface User {
  id: string;
  name: string;
  email: string;
  feedback?: string;
  purchases: number;
  isRewardReady: boolean;
  createdAt: Timestamp;
  lastScanAt?: Timestamp;
  rewards?: Reward[];
  purchaseLimit?: number;
  role: UserRole;
  currentReward?: Reward;
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
    feedback?: string
  ) => Promise<User>;
  addPurchase: (targetEmail?: string, targetUid?: string) => Promise<void>;
  useReward: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (
    user: User,
    purchaseLimit: number,
    descriptionMessage: string
  ) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
} 