import { db } from "@/lib/utils";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { User } from "@/hooks/auth.types";

export const resetAllData = async (user: User | null) => {
  if (!user || user.role !== "super_admin") {
    throw new Error("Only super admins can reset all data");
  }
  // Delete all users
  const usersRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersRef);
  const deletePromises = usersSnapshot.docs.map((userDoc) =>
    deleteDoc(doc(db, "users", userDoc.id))
  );
  await Promise.all(deletePromises);
  // Optionally, delete other collections (rewards, etc.) here
  // ...
}; 