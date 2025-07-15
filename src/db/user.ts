import { db } from "@/lib/utils";
import { doc, updateDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
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