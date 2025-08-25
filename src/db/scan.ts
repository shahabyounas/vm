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
  // COOLDOWN DISABLED - Users can scan as much as they want
  /*
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
  */
  
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
  const stampRequirement = targetOffer.stampRequirement;
  
  // Check if user already has an ACTIVE (in-progress) reward for this offer
  const activeRewardForOffer = targetUserData.completedRewards?.find(
    reward => 
      reward.offerSnapshot?.offerId === targetOfferId && 
      reward.scanHistory?.length < reward.offerSnapshot?.stampRequirement &&
      !reward.claimedAt // Not redeemed yet
  );
  
  let currentProgress = 0;
  let rewardToUpdate = activeRewardForOffer;
  
  if (activeRewardForOffer) {
    // User has an active reward for this offer, update progress
    currentProgress = activeRewardForOffer.scanHistory?.length || 0;
    
    // Check if already completed
    if (currentProgress >= stampRequirement) {
      throw new Error("User has already completed this offer");
    }
    
    // Allow continuing even if offer is inactive (user has existing progress)
    console.log(`User continuing existing offer: ${targetOfferId}, current progress: ${currentProgress}/${stampRequirement}`);
  } else {
    // No active reward for this offer - check if offer is active for new users
    if (!targetOffer.isActive) {
      throw new Error("This offer is no longer active for new users. Only users who have already started collecting stamps can continue.");
    }
    
    // Create new reward for this offer
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
  
  const newProgress = currentProgress + (targetOffer.stampsPerScan || 1);
  const isCompleted = newProgress >= stampRequirement;
  
  // Create a single scan event with the total stamps earned
  const stampsPerScan = targetOffer.stampsPerScan || 1;
  const scanEvent = {
    scannedBy: user ? `${user.name} (${user.email})` : "Unknown Admin",
    scannedByEmail: user?.email || "unknown",
    scannedByName: user?.name || "Unknown",
    timestamp: Timestamp.now(),
    stampsEarned: stampsPerScan, // Total stamps earned in this single scan
    scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique scan identifier
  };

  // Update the reward with new scan event
  const updatedReward = {
    ...rewardToUpdate,
    scanHistory: [...(rewardToUpdate.scanHistory || []), scanEvent],
  };

  // Update or add the reward to completedRewards array
  let updatedCompletedRewards = targetUserData.completedRewards || [];
  
  if (activeRewardForOffer) {
    // Update existing active reward
    updatedCompletedRewards = updatedCompletedRewards.map(reward =>
      reward.rewardId === activeRewardForOffer.rewardId ? updatedReward : reward
    );
  } else {
    // Add new reward
    updatedCompletedRewards = [...updatedCompletedRewards, updatedReward];
  }

  // Calculate total stamps earned from this scan
  const stampsEarned = targetOffer.stampsPerScan || 1;
  
  console.log(`Adding ${stampsEarned} stamps for offer ${targetOfferId}. Progress: ${currentProgress} -> ${newProgress}/${stampRequirement}`);
  console.log(`Created scan event with ${stampsEarned} stamps for user ${targetUserData.email}`);

  await updateDoc(userRef, {
    lastScanAt: Timestamp.now(),
    completedRewards: updatedCompletedRewards,
    purchases: increment(stampsEarned), // Increment by actual stamps earned, not just 1
  });
}; 