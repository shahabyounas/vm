import React, { useState } from "react";
import { User } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Edit,
  Eye,
  X,
  Calendar,
  Target,
  Users,
  Activity,
} from "lucide-react";

interface UsersTabProps {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (filter: "all" | "active" | "inactive") => void;
  roleFilter: "all" | "customer" | "admin" | "super_admin";
  setRoleFilter: (filter: "all" | "customer" | "admin" | "super_admin") => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    feedback: "",
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    if (user.role === "customer") {
      setEditForm({
        name: user.name,
        email: user.email,
        feedback: user.feedback || "",
      });
      setSelectedUser(user);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = () => {
    // TODO: Implement save functionality
    console.log("Saving user:", selectedUser?.id, editForm);
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active (Last 7 days)</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={e =>
                setRoleFilter(
                  e.target.value as "all" | "customer" | "admin" | "super_admin"
                )
              }
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            Users ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">
                  User
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Role
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Status
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Purchases
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Rewards
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Last Activity
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "super_admin"
                          ? "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                          : user.role === "admin"
                            ? "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                            : "bg-green-900/50 text-green-300 border border-green-700/50"
                      }`}
                    >
                      {user.role.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.lastScanAt &&
                        new Date().getTime() -
                          user.lastScanAt.toDate().getTime() <
                          7 * 24 * 60 * 60 * 1000
                          ? "bg-green-900/50 text-green-300 border border-green-700/50"
                          : "bg-gray-900/50 text-gray-300 border border-gray-700/50"
                      }`}
                    >
                      {user.lastScanAt &&
                      new Date().getTime() -
                        user.lastScanAt.toDate().getTime() <
                        7 * 24 * 60 * 60 * 1000
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-white">{user.purchases}</td>
                  <td className="p-4 text-white">
                    {user.completedRewards?.length || 0}
                  </td>
                  <td className="p-4 text-gray-300">
                    {user.lastScanAt
                      ? user.lastScanAt.toDate().toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => handleEditUser(user)}
                        disabled={user.role !== "customer"}
                        title={
                          user.role !== "customer"
                            ? "Only customers can be edited"
                            : "Edit customer"
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">User Profile</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">
                    {selectedUser.name}
                  </h4>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedUser.role === "super_admin"
                        ? "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                        : selectedUser.role === "admin"
                          ? "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                          : "bg-green-900/50 text-green-300 border border-green-700/50"
                    }`}
                  >
                    {selectedUser.role.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {selectedUser.purchases}
                  </div>
                  <div className="text-gray-300 text-sm">Total Scans</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {selectedUser.completedRewards?.length || 0}
                  </div>
                  <div className="text-gray-300 text-sm">Rewards Earned</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {selectedUser.role === "customer"
                      ? selectedUser.currentOfferProgress || 0
                      : "N/A"}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {selectedUser.role === "customer"
                      ? "Current Progress"
                      : "Admin Scans"}
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                  Activity Details
                </h5>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">
                        Member Since
                      </div>
                      <div className="text-white font-medium">
                        {selectedUser.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">
                        Last Activity
                      </div>
                      <div className="text-white font-medium">
                        {selectedUser.lastScanAt
                          ? selectedUser.lastScanAt
                              .toDate()
                              .toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser.feedback && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Feedback</div>
                    <div className="text-white">{selectedUser.feedback}</div>
                  </div>
                )}

                {selectedUser.role === "customer" && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">
                      Current Offer Progress
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Current Offer:</span>
                        <span className="text-white">
                          {selectedUser.currentOfferId || "Default Offer"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Progress:</span>
                        <span className="text-white">
                          {selectedUser.currentOfferProgress || 0} scans
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((selectedUser.currentOfferProgress || 0) * 10, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.role === "customer" &&
                  selectedUser.completedRewards &&
                  selectedUser.completedRewards.length > 0 && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-2">
                        Recent Rewards
                      </div>
                      <div className="space-y-2">
                        {selectedUser.completedRewards
                          .slice(0, 3)
                          .map((reward, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-white">
                                {reward.rewardDescription}
                              </span>
                              <span className="text-gray-400">
                                {reward.createdAt.toDate().toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {selectedUser.role !== "customer" && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">
                      Admin Information
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Role Level:</span>
                        <span className="text-white">
                          {selectedUser.role === "super_admin"
                            ? "Super Administrator"
                            : "Administrator"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Permissions:</span>
                        <span className="text-white">
                          {selectedUser.role === "super_admin"
                            ? "Full system access"
                            : "User and offer management"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Edit Customer</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  value={editForm.email}
                  onChange={e =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback
                </label>
                <textarea
                  value={editForm.feedback}
                  onChange={e =>
                    setEditForm({ ...editForm, feedback: e.target.value })
                  }
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 h-20 resize-none"
                  placeholder="Customer feedback..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
