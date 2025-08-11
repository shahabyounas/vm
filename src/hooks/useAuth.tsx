import { useState, useEffect, createContext, useContext } from "react";
import { User, GlobalSettings, AuthContextType } from "./auth.types";
import {
  loginUser,
  registerUser,
  logoutUser,
  subscribeToAuthState,
  fetchAllUsers,
  fetchUserRealtime,
  updateUserRole,
  addPurchase,
  useReward,
  fetchGlobalSettings,
  updateSettings,
} from "@/db/adapter";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);

  // Fetch global settings
  useEffect(() => {
    const unsubscribeSettings = fetchGlobalSettings(
      (settingsData) => {
        setSettings(settingsData);
        setSettingsLoading(false);
      },
      (error) => {
        console.error("Error listening to settings:", error);
        setSettingsLoading(false);
      }
    );
    return () => unsubscribeSettings();
  }, []);

  // Fetch all users for admins and super admins
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      setAllUsers([]);
      return;
    }
    setAllUsersLoading(true);
    const unsubscribeUsers = fetchAllUsers(
      (users) => {
        setAllUsers(users);
        setAllUsersLoading(false);
      },
      (error) => {
        console.error("Error listening to all users:", error);
        setAllUsersLoading(false);
      }
    );
    return () => unsubscribeUsers();
  }, [user?.role]);

  // Auth state and user real-time listener
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let didResolveAuth = false;
    const unsubscribeAuth = subscribeToAuthState(
      async (firebaseUser: unknown) => {
        if (!didResolveAuth) didResolveAuth = true;
        if (
          firebaseUser &&
          typeof firebaseUser === "object" &&
          firebaseUser !== null &&
          "uid" in firebaseUser
        ) {
          // Don't validate session immediately - let the real-time listener handle it
          // This prevents race conditions during login
          console.log(
            "Firebase Auth user detected, setting up real-time listener for:",
            firebaseUser.uid
          );

          // Add a small delay to allow session creation to complete
          setTimeout(() => {
            unsubscribeSnapshot = fetchUserRealtime(
              // @ts-expect-error: firebaseUser is from Firebase Auth
              firebaseUser.uid,
              (userData) => {
                console.log("Real-time user data received:", {
                  uid: userData.id,
                  isSessionValid: userData.isSessionValid,
                  hasSessionToken: !!userData.sessionToken,
                });

                // During login, be very lenient with session validation
                // Only logout if explicitly marked as invalid
                if (userData.isSessionValid === false) {
                  console.log(
                    "Session explicitly invalidated, signing out user"
                  );
                  setUser(null);
                  setLoading(false);
                  logoutUser();
                } else {
                  // Accept the user data regardless of session status during login
                  // This prevents premature logout during session creation
                  console.log(
                    "Accepting user data during login, session status:",
                    userData.isSessionValid
                  );
                  setUser(userData);
                  setLoading(false);
                }
              },
              (error) => {
                console.error("Error listening to user data:", error);
                setUser(null);
                setLoading(false);
              }
            );
          }, 500); // 500ms delay to allow session creation
        } else {
          setUser(null);
          setLoading(false);
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
          }
        }
      }
    );
    // Fallback: If onAuthStateChanged never fires, set loading to false after a timeout (should not happen in practice)
    const timeout = setTimeout(() => {
      if (!didResolveAuth) setLoading(false);
    }, 10000);
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      clearTimeout(timeout);
    };
  }, []);

  // Auth actions
  const login = async (email: string, password: string) => {
    console.log("Login attempt started for:", email);
    try {
      const result = await loginUser(email, password);
      console.log("Login successful, user data received:", !!result);
      return result;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  const register = (
    name: string,
    email: string,
    password: string,
    feedback?: string
  ) => registerUser(name, email, password, feedback, settings);
  const addPurchaseWithUser = (targetEmail?: string, targetUid?: string) =>
    addPurchase(user, settings, targetEmail, targetUid);
  const useRewardWithUser = () => useReward(user);
  const updateUserRoleWithUser = (
    userId: string,
    newRole: import("./auth.types").UserRole
  ) => updateUserRole(user, userId, newRole);
  const logout = async () => {
    console.log("Logout called from useAuth hook");
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        settingsLoading,
        allUsers,
        allUsersLoading,
        login,
        register,
        addPurchase: addPurchaseWithUser,
        useReward: useRewardWithUser,
        logout,
        updateSettings,
        updateUserRole: updateUserRoleWithUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
