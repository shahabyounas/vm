import { db } from "@/lib/utils";
import { doc, getDoc, updateDoc, increment, Timestamp } from "firebase/firestore";
import { User, GlobalSettings, Reward } from "@/hooks/auth.types";

export const addPurchase = async (
  user: User | null,
  settings: GlobalSettings | null,
  targetEmail?: string,
  targetUid?: string
) => {
  const isScanningOtherUser = targetEmail && targetUid;
  if (!user && !isScanningOtherUser) return;
  const userRef = isScanningOtherUser
    ? doc(db, "users", targetUid)
    : doc(db, "users", user!.id);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found");
  const targetUserData = userSnap.data();
  
  // Check 24-hour cooldown for customers
  if (targetUserData.role === "customer" && targetUserData.lastScanAt) {
    const lastScanTime = targetUserData.lastScanAt.toDate();
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - lastScanTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert to hours
    
    if (hoursDifference < 24) {
      const remainingHours = Math.ceil(24 - hoursDifference);
      throw new Error(`You can collect your next stamp in ${remainingHours} hours. Last scan was ${lastScanTime.toLocaleString()}`);
    }
  }
  
  const userPurchaseLimit =
    targetUserData.purchaseLimit || settings?.purchaseLimit || 5;
  if (targetUserData.purchases >= userPurchaseLimit) return;
  const newPurchases = targetUserData.purchases + 1;
  const isRewardReady = newPurchases >= userPurchaseLimit;
  const scanEvent = {
    scannedBy: user?.email || "unknown",
    timestamp: Timestamp.now(),
  };
  if (!targetUserData.currentReward) {
    const newReward: Reward = {
      rewardId: `reward_${Date.now()}`,
      claimedAt: null,
      scanHistory: [scanEvent],
    };
    await updateDoc(userRef, {
      purchases: increment(1),
      isRewardReady,
      lastScanAt: Timestamp.now(),
      currentReward: newReward,
    });
  } else {
    const updatedScanHistory = [
      ...(targetUserData.currentReward.scanHistory || []),
      scanEvent,
    ];
    const updatedCurrentReward = {
      ...targetUserData.currentReward,
      scanHistory: updatedScanHistory,
    };
    await updateDoc(userRef, {
      purchases: increment(1),
      isRewardReady,
      lastScanAt: Timestamp.now(),
      currentReward: updatedCurrentReward,
    });
  }
}; 