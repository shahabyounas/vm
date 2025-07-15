import { auth, db } from "@/lib/utils";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { User, GlobalSettings } from "@/hooks/auth.types";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  feedback: string | undefined,
  settings: GlobalSettings | null
): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const currentPurchaseLimit = settings?.purchaseLimit || 5;
  const newUser: User = {
    id: cred.user.uid,
    name,
    email,
    feedback,
    purchases: 0,
    isRewardReady: false,
    createdAt: Timestamp.now(),
    rewards: [],
    purchaseLimit: currentPurchaseLimit,
    role: "customer",
  };
  await setDoc(doc(db, "users", cred.user.uid), newUser);
  return newUser;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuthState = (cb: (user: unknown) => void) => {
  return onAuthStateChanged(auth, cb);
}; 