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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    const newUser: User = {
      id: cred.user.uid,
      name,
      email,
      feedback,
      purchases: 0,
      isRewardReady: false,
      createdAt: Timestamp.now(),
      rewards: [],
    };
    await setDoc(doc(db, "users", cred.user.uid), newUser);
    // The real-time listener will automatically update the user state
    return newUser;
  };

  const addPurchase = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.id);
    const newPurchases = user.purchases + 1;
    const isRewardReady = newPurchases >= 5;
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

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, addPurchase, useReward, logout }}
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
