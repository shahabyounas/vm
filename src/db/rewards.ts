import { db } from "@/lib/utils";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { User } from "@/hooks/auth.types";

export const useReward = async (user: User | null) => {
  if (!user || !user.currentReward) return;
  const userRef = doc(db, "users", user.id);
  const claimedReward = {
    ...user.currentReward,
    claimedAt: Timestamp.now(),
  };
  await updateDoc(userRef, {
    purchases: 0,
    isRewardReady: false,
    rewards: [...(user.rewards || []), claimedReward],
    currentReward: null,
  });
}; 