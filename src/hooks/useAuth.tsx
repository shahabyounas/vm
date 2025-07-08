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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
   
    if (userDoc.exists()) {
      setUser(userDoc.data() as User);
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
    setUser(newUser);
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
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) setUser(userDoc.data() as User);
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
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) setUser(userDoc.data() as User);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, addPurchase, useReward, logout }}
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
