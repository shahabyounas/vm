import { Users, Crown, Shield } from "lucide-react";
import { User } from "@/hooks/useAuth";

const UserList = ({ users, loading }: { users: User[]; loading: boolean }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "text-yellow-400";
      case "admin":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {users.map((user) => {
        const userPurchaseLimit = user.purchaseLimit || 5;
        const progress = Math.min(
          100,
          (user.purchases / userPurchaseLimit) * 100
        );

        return (
          <div
            key={user.id}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/80 transition-all duration-200"
          >
            <div className="flex items-center flex-wrap justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span
                    className={`text-sm font-medium ${getRoleColor(user.role)}`}
                  >
                    {(user.role || "").replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {user.lastScanAt
                    ? new Date(user.lastScanAt.toDate()).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center flex-wrap justify-between mb-1">
                <span className="font-semibold text-white">{user.name}</span>
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress:</span>
                <span className="text-white font-medium">
                  {user.purchases}/{userPurchaseLimit}
                </span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress >= 100 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center flex-wrap justify-between text-xs text-gray-500">
                <span>{user.rewards?.length || 0} rewards claimed</span>
                <span>
                  {user.isRewardReady
                    ? "🎉 Ready!"
                    : `${userPurchaseLimit - user.purchases} to go`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
