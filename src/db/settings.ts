import { db } from "@/lib/utils";
import { doc, setDoc, updateDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { GlobalSettings, User } from "@/hooks/auth.types";

export const fetchGlobalSettings = (
  onUpdate: (settings: GlobalSettings) => void,
  onError: (err: unknown) => void
) => {
  const settingsRef = doc(db, "settings", "global");
  return onSnapshot(
    settingsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as GlobalSettings);
      } else {
        // Create default settings if they don't exist
        const defaultSettings: GlobalSettings = {
          purchaseLimit: 5,
          descriptionMessage: "Complete purchases to unlock your reward!",
          updatedAt: Timestamp.now(),
          updatedBy: "system",
        };
        setDoc(settingsRef, defaultSettings);
        onUpdate(defaultSettings);
      }
    },
    onError
  );
};

export const updateSettings = async (
  user: User | null,
  purchaseLimit: number,
  descriptionMessage: string
) => {
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Only admins can update settings");
  }
  const settingsRef = doc(db, "settings", "global");
  await updateDoc(settingsRef, {
    purchaseLimit,
    descriptionMessage,
    updatedAt: Timestamp.now(),
    updatedBy: user.email,
  });
}; 