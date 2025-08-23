import { db } from "@/lib/utils";
import { doc, getDoc, updateDoc, increment, Timestamp } from "firebase/firestore";
import { User, Offer, Reward } from "@/hooks/auth.types";

export const addPurchase = async (
  user: User | null,
  targetEmail?: string,
  targetUid?: string,
  offerId?: string
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
  
  // Determine which offer to use
  const targetOfferId = offerId || targetUserData.currentOfferId;
  if (!targetOfferId) {
    throw new Error("No offer specified and user has no active offer assigned");
  }

  const offerRef = doc(db, "offers", targetOfferId);
  const offerSnap = await getDoc(offerRef);
  
  if (!offerSnap.exists()) {
    throw new Error("Specified offer not found");
  }
  
  const targetOffer = offerSnap.data() as Offer;
  if (!targetOffer.isActive) {
    throw new Error("Specified offer is no longer active");
  }

  const stampRequirement = targetOffer.stampRequirement;
  
  // Check if user already has a reward for this offer
  const existingReward = targetUserData.completedRewards?.find(
    reward => reward.offerSnapshot?.offerId === targetOfferId
  );
  
  let currentProgress = 0;
  let rewardToUpdate = existingReward;
  
  if (existingReward) {
    // User already has a reward for this offer, update progress
    currentProgress = existingReward.scanHistory?.length || 0;
    
    // Check if already completed
    if (currentProgress >= stampRequirement) {
      throw new Error("User has already completed this offer");
    }
  } else {
    // First time collecting stamps for this offer - create new reward
    rewardToUpdate = {
      rewardId: `reward_${Date.now()}`,
      claimedAt: null,
      scanHistory: [],
      rewardType: targetOffer.rewardType,
      rewardValue: targetOffer.rewardValue,
      rewardDescription: targetOffer.rewardDescription,
      offerSnapshot: {
        offerId: targetOffer.offerId,
        offerName: targetOffer.name,
        description: targetOffer.description,
        stampRequirement: targetOffer.stampRequirement,
        rewardType: targetOffer.rewardType,
        rewardValue: targetOffer.rewardValue,
        rewardDescription: targetOffer.rewardDescription,
      },
      createdAt: Timestamp.now(),
    };
  }
  
  const newProgress = currentProgress + 1;
  const isCompleted = newProgress >= stampRequirement;
  
  const scanEvent = {
    scannedBy: user?.email || "unknown",
    timestamp: Timestamp.now(),
  };

  // Update the reward with new scan
  const updatedReward = {
    ...rewardToUpdate,
    scanHistory: [...(rewardToUpdate.scanHistory || []), scanEvent],
  };

  // Update or add the reward to completedRewards array
  let updatedCompletedRewards = targetUserData.completedRewards || [];
  
  if (existingReward) {
    // Update existing reward
    updatedCompletedRewards = updatedCompletedRewards.map(reward =>
      reward.rewardId === existingReward.rewardId ? updatedReward : reward
    );
  } else {
    // Add new reward
    updatedCompletedRewards = [...updatedCompletedRewards, updatedReward];
  }

  await updateDoc(userRef, {
    lastScanAt: Timestamp.now(),
    completedRewards: updatedCompletedRewards,
  });
}; 