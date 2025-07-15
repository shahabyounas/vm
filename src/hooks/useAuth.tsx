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
    const unsubscribeAuth = subscribeToAuthState(
      async (firebaseUser: unknown) => {
        if (
          firebaseUser &&
          typeof firebaseUser === "object" &&
          firebaseUser !== null &&
          "uid" in firebaseUser
        ) {
          unsubscribeSnapshot = fetchUserRealtime(
            // @ts-expect-error: firebaseUser is from Firebase Auth
            firebaseUser.uid,
            (userData) => {
              setUser(userData);
              setLoading(false);
            },
            (error) => {
              console.error("Error listening to user data:", error);
              setUser(null);
              setLoading(false);
            }
          );
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
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Auth actions
  const login = (email: string, password: string) => loginUser(email, password);
  const register = (
    name: string,
    email: string,
    password: string,
    feedback?: string
  ) => registerUser(name, email, password, feedback, settings);
  const logout = async () => {
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
        addPurchase,
        useReward,
        logout,
        updateSettings,
        updateUserRole,
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
