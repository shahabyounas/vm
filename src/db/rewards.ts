import { db } from "@/lib/utils";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { User, Reward } from "@/hooks/auth.types";

export const redeemReward = async (
  user: User | null,
  targetEmail?: string,
  targetUid?: string,
  rewardId?: string
) => {
  const isRedeemingOtherUser = targetEmail && targetUid;
  if (!user && !isRedeemingOtherUser) return;
  
  const userRef = isRedeemingOtherUser
    ? doc(db, "users", targetUid)
    : doc(db, "users", user!.id);
    
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error("User not found");
  
  const targetUserData = userSnap.data();
  const completedRewards = targetUserData.completedRewards || [];
  
  // Find the specific reward to redeem
  const rewardToRedeem = completedRewards.find(
    (reward: Reward) => reward.rewardId === rewardId
  );
  
  if (!rewardToRedeem) {
    throw new Error("Reward not found");
  }
  
  if (rewardToRedeem.claimedAt) {
    throw new Error("Reward has already been redeemed");
  }
  
  // Update the reward to mark it as redeemed
  const updatedRewards = completedRewards.map((reward: Reward) =>
    reward.rewardId === rewardId
      ? { ...reward, claimedAt: Timestamp.now() }
      : reward
  );
  
  await updateDoc(userRef, {
    completedRewards: updatedRewards,
  });
}; 