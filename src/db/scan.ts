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
  
  // Check daily cooldown for customers (resets at midnight)
  if (targetUserData.role === "customer" && targetUserData.lastScanAt) {
    const lastScanTime = targetUserData.lastScanAt.toDate();
    const currentTime = new Date();
    
    // Get today's midnight (12:00 AM)
    const todayMidnight = new Date(currentTime);
    todayMidnight.setHours(0, 0, 0, 0);
    
    // Get the date of the last scan (midnight)
    const lastScanDate = new Date(lastScanTime);
    lastScanDate.setHours(0, 0, 0, 0);
    
    // Check if we're still in the same day as the last scan
    const isSameDay = lastScanDate.getTime() === todayMidnight.getTime();
    
    if (isSameDay) {
      // Still in cooldown - calculate time until midnight
      const tomorrowMidnight = new Date(todayMidnight);
      tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
      
      const timeUntilMidnight = tomorrowMidnight.getTime() - currentTime.getTime();
      const hoursUntilMidnight = Math.ceil(timeUntilMidnight / (1000 * 60 * 60));
      
      throw new Error(`You can collect your next stamp at midnight (12:00 AM). Last scan was ${lastScanTime.toLocaleString()}. Time remaining: ${hoursUntilMidnight} hours`);
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