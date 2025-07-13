import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Crown, Shield, User } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/utils";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  purchases: number;
  createdAt: Timestamp;
}

const UserManagement = () => {
  const { user, loading, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Redirect if not super admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      if (!user || user.role !== "super_admin") return;

      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const usersData: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role || "customer",
            purchases: data.purchases || 0,
            createdAt: data.createdAt,
          });
        });

        setUsers(usersData);
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user?.role === "super_admin") {
      loadUsers();
    }
  }, [user]);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not super admin
  if (!user || user.role !== "super_admin") return null;

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    if (userId === user.id) {
      toast({
        title: "Cannot Update Own Role",
        description: "You cannot change your own role",
        variant: "destructive",
      });
      return;
    }

    setUpdatingRole(userId);
    try {
      await updateUserRole(userId, newRole);
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully!",
      });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "customer":
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "admin":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "customer":
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-red-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-red-900/30 sticky top-0 z-10">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="ml-4 text-2xl font-bold text-white">
                User Management
              </h1>
            </div>
            <div className="flex items-center text-gray-400">
              <Crown className="w-6 h-6 mr-2 text-yellow-500" />
              <span className="text-sm">Super Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Manage Users
                </h2>
                <p className="text-gray-400">
                  Update user roles and permissions
                </p>
              </div>

              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                  <p className="text-white">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((userData) => (
                    <div
                      key={userData.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(userData.role)}
                          <div>
                            <h3 className="text-white font-semibold">
                              {userData.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {userData.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full border ${getRoleColor(
                                  userData.role
                                )}`}
                              >
                                {userData.role.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {userData.purchases} purchases
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {userData.id !== user.id && (
                          <Select
                            value={userData.role}
                            onValueChange={(value: UserRole) =>
                              handleRoleUpdate(userData.id, value)
                            }
                            disabled={updatingRole === userData.id}
                          >
                            <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">
                                Super Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {userData.id === user.id && (
                          <span className="text-gray-500 text-sm">
                            Current User
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {users.length === 0 && !loadingUsers && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
