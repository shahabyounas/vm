import { auth, db } from "@/lib/utils";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { User, GlobalSettings } from "@/hooks/auth.types";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

// Generate a unique session token
const generateSessionToken = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log("loginUser: Starting login process for email:", email);
    
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log("loginUser: Firebase Auth successful for UID:", cred.user.uid);
    
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    console.log("loginUser: User document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      console.log("loginUser: User data retrieved, current session status:", userData.isSessionValid);
      
      // Generate new session token and update user document
      const sessionToken = generateSessionToken();
      const now = Timestamp.now();
      
      console.log("loginUser: Updating user document with new session");
      // Create the new session directly
      await updateDoc(doc(db, "users", cred.user.uid), {
        sessionToken,
        lastLoginAt: now,
        isSessionValid: true,
      });
      console.log("loginUser: User document updated with new session");
      
      // Return updated user data with session info
      const updatedUserData = {
        ...userData,
        sessionToken,
        lastLoginAt: now,
        isSessionValid: true,
      };
      console.log("loginUser: Returning updated user data with session:", updatedUserData.isSessionValid);
      return updatedUserData;
    }
  
    console.log("loginUser: User document not found, returning null");
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
    
    const sessionToken = generateSessionToken();
    const now = Timestamp.now();
    
    const newUser: User = {
      id: cred.user.uid,
      name,
      email,
      feedback,
      purchases: 0,
      isRewardReady: false,
      createdAt: now,
      rewards: [],
      role: "customer",
      // Current active offer (will be assigned after creation)
      currentOfferId: "default_offer", // Default offer ID
      currentOfferProgress: 0,
      // Session management
      sessionToken,
      lastLoginAt: now,
      isSessionValid: true,
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
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Invalidate all sessions for this user across all devices
      await updateDoc(doc(db, "users", currentUser.uid), {
        isSessionValid: false,
        sessionToken: null,
      });
    }
    
    // Sign out from current device
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    // Still sign out even if session invalidation fails
    await signOut(auth);
  }
};

// Validate if a user's session is still valid
export const validateUserSession = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      
      // Be very lenient - only return false if explicitly marked as invalid
      // This prevents issues during login when session might not be fully created yet
      if (userData.isSessionValid === false) {
        console.log("Session validation: explicitly marked as invalid");
        return false;
      }
      
      console.log("Session validation: treating as valid (status:", userData.isSessionValid, ")");
      return true;
    }
    console.log("Session validation: user document not found");
    return false;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
};

export const subscribeToAuthState = (cb: (user: unknown) => void) => {
  return onAuthStateChanged(auth, cb);
}; 