import { useState, useEffect, createContext, useContext } from "react";
import { auth, db } from "@/lib/utils";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  Timestamp,
  FieldValue,
  onSnapshot,
} from "firebase/firestore";

// Constants
export const PURCHASE_LIMIT = 5;

// User roles
export type UserRole = "customer" | "admin" | "super_admin";

interface Reward {
  rewardId: string;
  claimedAt: Timestamp;
}

interface User {
  id: string;
  name: string;
  email: string;
  feedback?: string;
  purchases: number;
  isRewardReady: boolean;
  createdAt: Timestamp;
  lastScanAt?: Timestamp;
  rewards?: Reward[];
  purchaseLimit?: number; // Store the limit when user was created
  role: UserRole; // User role: customer, admin, or super_admin
}

interface GlobalSettings {
  purchaseLimit: number;
  descriptionMessage: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: GlobalSettings | null;
  settingsLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    name: string,
    email: string,
    password: string,
    feedback?: string
  ) => Promise<User | null>;
  addPurchase: () => Promise<void>;
  useReward: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (
    purchaseLimit: number,
    descriptionMessage: string
  ) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Fetch global settings
  useEffect(() => {
    const settingsRef = doc(db, "settings", "global");
    const unsubscribeSettings = onSnapshot(
      settingsRef,
      (doc) => {
        if (doc.exists()) {
          const settingsData = doc.data() as GlobalSettings;
          console.log("Global settings updated:", settingsData);
          setSettings(settingsData);
        } else {
          // Create default settings if they don't exist
          const defaultSettings: GlobalSettings = {
            purchaseLimit: PURCHASE_LIMIT,
            descriptionMessage: "Complete purchases to unlock your reward!",
            updatedAt: Timestamp.now(),
            updatedBy: "system",
          };
          setDoc(settingsRef, defaultSettings);
          setSettings(defaultSettings);
        }
        setSettingsLoading(false);
      },
      (error) => {
        console.error("Error listening to settings:", error);
        setSettingsLoading(false);
      }
    );

    return () => unsubscribeSettings();
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "Auth state changed:",
        firebaseUser ? "User logged in" : "User logged out"
      );

      if (firebaseUser) {
        console.log("Firebase user UID:", firebaseUser.uid);

        // Set up real-time listener for user data
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(
          userRef,
          (doc) => {
            if (doc.exists()) {
              const userData = doc.data() as User;
              console.log("User data updated in real-time:", {
                name: userData.name,
                purchases: userData.purchases,
                isRewardReady: userData.isRewardReady,
                role: userData.role,
              });
              setUser(userData);
            } else {
              console.log(
                "User document does not exist for UID:",
                firebaseUser.uid
              );
              setUser(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to user data:", error);
            setUser(null);
            setLoading(false);
          }
        );
      } else {
        console.log("No Firebase user, setting user to null");
        setUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // The real-time listener will automatically update the user state
    // when the user document is fetched, so we don't need to manually set it here
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    feedback?: string
  ): Promise<User | null> => {
    console.log("registering user", name, email, password, feedback);
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Use current settings for new users
    const currentPurchaseLimit = settings?.purchaseLimit || PURCHASE_LIMIT;

    const newUser: User = {
      id: cred.user.uid,
      name,
      email,
      feedback,
      purchases: 0,
      isRewardReady: false,
      createdAt: Timestamp.now(),
      rewards: [],
      purchaseLimit: currentPurchaseLimit, // Store the limit when user was created
      role: "customer", // Default role for new users
    };
    await setDoc(doc(db, "users", cred.user.uid), newUser);
    // The real-time listener will automatically update the user state
    return newUser;
  };

  const addPurchase = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.id);
    const newPurchases = user.purchases + 1;
    // Use user's original purchase limit (from when they registered) or current settings
    const userPurchaseLimit =
      user.purchaseLimit || settings?.purchaseLimit || PURCHASE_LIMIT;
    const isRewardReady = newPurchases >= userPurchaseLimit;
    await updateDoc(userRef, {
      purchases: increment(1),
      isRewardReady,
      lastScanAt: Timestamp.now(),
    });
    // The real-time listener will automatically update the user state
  };

  const useReward = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.id);
    const reward = {
      rewardId: `reward_${Date.now()}`,
      claimedAt: Timestamp.now(),
    };
    await updateDoc(userRef, {
      purchases: 0,
      isRewardReady: false,
      rewards: [...(user.rewards || []), reward],
    });
    // The real-time listener will automatically update the user state
  };

  const updateSettings = async (
    purchaseLimit: number,
    descriptionMessage: string
  ) => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      throw new Error("Only admins can update settings");
    }

    const settingsRef = doc(db, "settings", "global");
    await updateDoc(settingsRef, {
      purchaseLimit,
      descriptionMessage,
      updatedAt: Timestamp.now(),
      updatedBy: user.email,
    });
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!user || user.role !== "super_admin") {
      throw new Error("Only super admins can update user roles");
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: newRole,
    });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        settingsLoading,
        login,
        register,
        addPurchase,
        useReward,
        logout,
        updateSettings,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
