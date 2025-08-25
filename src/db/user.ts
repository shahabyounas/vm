import { db } from "@/lib/utils";
import { doc, updateDoc, onSnapshot, collection, query, orderBy, getDocs, Timestamp, where } from "firebase/firestore";
import { User, UserRole } from "@/hooks/auth.types";

export const fetchAllUsers = (onUpdate: (users: User[]) => void, onError: (err: unknown) => void) => {
  const usersRef = collection(db, "users");
  const usersQuery = query(usersRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data() as User;
        users.push({ ...userData, id: doc.id });
      });
      onUpdate(users);
    },
    onError
  );
};

export const fetchAllUsersWithRewards = (onUpdate: (users: User[]) => void, onError: (err: unknown) => void) => {
  const usersRef = collection(db, "users");
  const usersQuery = query(usersRef, orderBy("createdAt", "desc"));
  
  return onSnapshot(
    usersQuery,
    async (snapshot) => {
      try {
        const users: User[] = [];
        
        // Process each user to get complete data
        for (const docSnap of snapshot.docs) {
          const userData = docSnap.data() as User;
          const userId = docSnap.id;
          
          // Get user's rewards subcollection
          const rewardsRef = collection(db, "users", userId, "rewards");
          const rewardsSnapshot = await getDocs(rewardsRef);
          
          const rewards: User["completedRewards"] = [];
          rewardsSnapshot.forEach((rewardDoc) => {
            const rewardData = rewardDoc.data();
            // Ensure all required fields are present, using defaults if missing
            const reward: User["completedRewards"][0] = {
              rewardId: rewardDoc.id,
              claimedAt: rewardData.claimedAt || null,
              scanHistory: rewardData.scanHistory || [],
              rewardType: rewardData.rewardType || "",
              rewardValue: rewardData.rewardValue || "",
              rewardDescription: rewardData.rewardDescription || "",
              offerSnapshot: rewardData.offerSnapshot || {
                offerId: "",
                offerName: "",
                description: "",
                stampRequirement: 0,
                rewardType: "",
                rewardValue: "",
                rewardDescription: "",
              },
              createdAt: rewardData.createdAt || (new Date() as unknown as Timestamp),
              expiresAt: rewardData.expiresAt,
            };
            rewards.push(reward);
          });
          
          // Create complete user object with rewards
          const completeUser: User = {
            ...userData,
            id: userId,
            completedRewards: rewards,
          };
          
          users.push(completeUser);
        }
        
        onUpdate(users);
      } catch (error) {
        onError(error);
      }
    },
    onError
  );
};

export const fetchUserRealtime = (uid: string, onUpdate: (user: User | null) => void, onError: (err: unknown) => void) => {
  const userRef = doc(db, "users", uid);
  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as User);
      } else {
        onUpdate(null);
      }
    },
    onError
  );
};

export const updateUserRole = async (
  currentUser: User | null,
  userId: string,
  newRole: UserRole
) => {
  if (!currentUser || currentUser.role !== "super_admin") {
    throw new Error("Only super admins can update user roles");
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    role: newRole,
  });
}; 

export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking user exists:", error);
    throw error;
  }
}; 