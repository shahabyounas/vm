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
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData;
    }
  
    return null;
  } catch (error) {
    console.error("loginUser error:", error);
    throw error;
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  feedback: string | undefined,
  settings: GlobalSettings | null
): Promise<User> => {
  try {

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

    
    try {
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      
      // Verify the document was created
      const verifyDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (verifyDoc.exists()) {
        console.log("✅ User document verified in Firestore");
      } else {
        console.error("❌ User document not found after creation!");
      }
    } catch (firestoreError) {
      console.error("Firestore error during user creation:", firestoreError);
      throw firestoreError;
    }
    
    return newUser;
  } catch (error) {
    console.error("registerUser error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuthState = (cb: (user: unknown) => void) => {
  return onAuthStateChanged(auth, cb);
}; 