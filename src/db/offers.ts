import { db } from "@/lib/utils";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, Timestamp, deleteDoc } from "firebase/firestore";
import { Offer, User } from "@/hooks/auth.types";
import { 
  DEFAULT_OFFER_NAME, 
  DEFAULT_OFFER_DESCRIPTION, 
  DEFAULT_STAMP_REQUIREMENT,
  DEFAULT_REWARD_TYPE,
  DEFAULT_REWARD_VALUE,
  DEFAULT_REWARD_DESCRIPTION
} from "@/constants";

// Create default offer if none exists
export const createDefaultOffer = async (adminUser: User): Promise<void> => {
  const offersRef = collection(db, "offers");
  const defaultOffer: Offer = {
    offerId: "default_offer",
    name: DEFAULT_OFFER_NAME,
    description: DEFAULT_OFFER_DESCRIPTION,
    stampRequirement: DEFAULT_STAMP_REQUIREMENT,
    rewardType: DEFAULT_REWARD_TYPE,
    rewardValue: DEFAULT_REWARD_VALUE,
    rewardDescription: DEFAULT_REWARD_DESCRIPTION,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: adminUser.email || "system",
  };

  await setDoc(doc(db, "offers", "default_offer"), defaultOffer);
};

// Fetch all offers
export const fetchAllOffers = async (): Promise<Offer[]> => {
  const offersRef = collection(db, "offers");
  const querySnapshot = await getDocs(offersRef);
  
  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map(doc => doc.data() as Offer);
};

// Fetch active offers
export const fetchActiveOffers = async (): Promise<Offer[]> => {
  const offersRef = collection(db, "offers");
  const q = query(offersRef, where("isActive", "==", true));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return [];
  }

  return querySnapshot.docs.map(doc => doc.data() as Offer);
};

// Create new offer
export const createOffer = async (adminUser: User, offerData: Omit<Offer, 'offerId' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<void> => {
  if (adminUser.role !== "admin" && adminUser.role !== "super_admin") {
    throw new Error("Only admins can create offers");
  }

  const offerId = `offer_${Date.now()}`;
  const newOffer: Offer = {
    ...offerData,
    offerId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: adminUser.email || "system",
  };

  await setDoc(doc(db, "offers", offerId), newOffer);
};

// Update existing offer
export const updateOffer = async (adminUser: User, offerId: string, offerData: Partial<Offer>): Promise<void> => {
  if (adminUser.role !== "admin" && adminUser.role !== "super_admin") {
    throw new Error("Only admins can update offers");
  }

  const offerRef = doc(db, "offers", offerId);
  const offerSnap = await getDoc(offerRef);
  
  if (!offerSnap.exists()) {
    throw new Error("Offer not found");
  }

  await updateDoc(offerRef, {
    ...offerData,
    updatedAt: Timestamp.now(),
  });
};

// Delete offer
export const deleteOffer = async (adminUser: User, offerId: string): Promise<void> => {
  if (adminUser.role !== "admin" && adminUser.role !== "super_admin") {
    throw new Error("Only admins can delete offers");
  }

  // Check if any users are currently working on this offer
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("currentOfferId", "==", offerId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    throw new Error("Cannot delete offer - users are currently working on it");
  }

  await deleteDoc(doc(db, "offers", offerId));
};

// Assign offer to user
export const assignOfferToUser = async (userId: string, offerId: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const offerRef = doc(db, "offers", offerId);
  
  // Check if offer exists and is active
  const offerSnap = await getDoc(offerRef);
  if (!offerSnap.exists()) {
    throw new Error("Offer not found");
  }
  
  const offer = offerSnap.data() as Offer;
  if (!offer.isActive) {
    throw new Error("Offer is not active");
  }

  // Update user with new offer
  await updateDoc(userRef, {
    currentOfferId: offerId,
    currentOfferProgress: 0,
    purchases: 0, // Reset purchases for new offer
    isRewardReady: false,
    currentReward: null,
  });
};

// Get user's current offer
export const getUserCurrentOffer = async (userId: string): Promise<Offer | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  const userData = userSnap.data() as User;
  if (!userData.currentOfferId) {
    return null;
  }

  const offerRef = doc(db, "offers", userData.currentOfferId);
  const offerSnap = await getDoc(offerRef);
  
  if (!offerSnap.exists()) {
    return null;
  }

  return offerSnap.data() as Offer;
};
