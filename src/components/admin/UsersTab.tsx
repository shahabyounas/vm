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
  Filter,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Star,
  Clock,
  Award,
  Gift,
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
    mobileNumber: "",
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
        mobileNumber: user.mobileNumber || "",
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

  // Calculate user statistics
  const totalUsers = users.length;
  const customers = users.filter(user => user.role === "customer");
  const admins = users.filter(
    user => user.role === "admin" || user.role === "super_admin"
  );
  const activeUsers = users.filter(
    user =>
      user.lastScanAt &&
      new Date().getTime() - user.lastScanAt.toDate().getTime() <
        7 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-400" />
              Search & Filters
            </h4>

            {/* Mini Statistics Cards */}
            <div className="flex flex-wrap gap-2 sm:space-x-2">
              <div className="bg-blue-900/20 border border-blue-700/30 rounded px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold text-blue-400">
                  {totalUsers}
                </div>
                <div className="text-blue-300 text-xs">Users</div>
              </div>
              <div className="bg-green-900/20 border border-green-700/30 rounded px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold text-green-400">
                  {customers.length}
                </div>
                <div className="text-green-300 text-xs">Customers</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-700/30 rounded px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold text-purple-400">
                  {admins.length}
                </div>
                <div className="text-purple-300 text-xs">Admins</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold text-yellow-400">
                  {activeUsers.length}
                </div>
                <div className="text-yellow-300 text-xs">Active</div>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 w-full sm:w-auto"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setRoleFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="pl-10 bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Users ({users.length})
          </h3>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          <div className="p-4 space-y-4">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-gray-400 text-sm flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "super_admin"
                        ? "bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-300 border border-purple-700/50"
                        : user.role === "admin"
                          ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 border border-blue-700/50"
                          : "bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-700/50"
                    }`}
                  >
                    {user.role.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">
                      {user.purchases}
                    </span>
                    <span className="text-gray-400">Stamps</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium">
                      {user.completedRewards?.length || 0}
                    </span>
                    <span className="text-gray-400">Rewards</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {user.lastScanAt
                        ? user.lastScanAt.toDate().toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.lastScanAt &&
                      new Date().getTime() -
                        user.lastScanAt.toDate().getTime() <
                        7 * 24 * 60 * 60 * 1000
                        ? "bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-700/50"
                        : "bg-gradient-to-r from-gray-900/50 to-gray-800/50 text-gray-300 border border-gray-700/50"
                    }`}
                  >
                    {user.lastScanAt &&
                    new Date().getTime() - user.lastScanAt.toDate().getTime() <
                      7 * 24 * 60 * 60 * 1000
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200 flex-1"
                    onClick={() => handleViewUser(user)}
                    title="View user profile"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white transition-all duration-200 flex-1"
                    onClick={() => handleEditUser(user)}
                    disabled={user.role !== "customer"}
                    title={
                      user.role !== "customer"
                        ? "Only customers can be edited"
                        : "Edit customer"
                    }
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
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
                  Stamps
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
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "super_admin"
                          ? "bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-300 border border-purple-700/50"
                          : user.role === "admin"
                            ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 border border-blue-700/50"
                            : "bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-700/50"
                      }`}
                    >
                      {user.role.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.lastScanAt &&
                        new Date().getTime() -
                          user.lastScanAt.toDate().getTime() <
                          7 * 24 * 60 * 60 * 1000
                          ? "bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-700/50"
                          : "bg-gradient-to-r from-gray-900/50 to-gray-800/50 text-gray-300 border border-gray-700/50"
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
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">
                        {user.purchases}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">
                        {user.completedRewards?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {user.lastScanAt
                          ? user.lastScanAt.toDate().toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                        onClick={() => handleViewUser(user)}
                        title="View user profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white transition-all duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400" />
                  User Profile
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* User Basic Info */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    {selectedUser.name.charAt(0)}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedUser.name}
                  </h4>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-400 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.role === "super_admin"
                        ? "bg-gradient-to-r from-purple-900/50 to-purple-800/50 text-purple-300 border border-purple-700/50"
                        : selectedUser.role === "admin"
                          ? "bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 border border-blue-700/50"
                          : "bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border border-green-700/50"
                    }`}
                  >
                    {selectedUser.role.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* User Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-400 mb-1 sm:mb-2 flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {(() => {
                      // Calculate total lifetime stamps from all rewards
                      const totalStampsFromRewards =
                        selectedUser.completedRewards?.reduce(
                          (total, reward) => {
                            return total + (reward.scanHistory?.length || 0);
                          },
                          0
                        ) || 0;

                      // Use the higher value between purchases and calculated stamps for total
                      return Math.max(
                        selectedUser.purchases || 0,
                        totalStampsFromRewards
                      );
                    })()}
                  </div>
                  <div className="text-blue-300 text-xs sm:text-sm">
                    Lifetime Stamps
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-400 mb-1 sm:mb-2 flex items-center justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {selectedUser.completedRewards?.filter(
                      reward =>
                        reward.scanHistory?.length >=
                        (reward.offerSnapshot?.stampRequirement || 0)
                    ).length || 0}
                  </div>
                  <div className="text-green-300 text-xs sm:text-sm">
                    Completed Rewards
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-400 mb-1 sm:mb-2 flex items-center justify-center">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {selectedUser.completedRewards?.filter(
                      reward =>
                        reward.scanHistory?.length <
                        (reward.offerSnapshot?.stampRequirement || 0)
                    ).length || 0}
                  </div>
                  <div className="text-purple-300 text-xs sm:text-sm">
                    In-Progress Rewards
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-700/30 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-400 mb-1 sm:mb-2 flex items-center justify-center">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {selectedUser.completedRewards?.filter(
                      reward => reward.claimedAt
                    ).length || 0}
                  </div>
                  <div className="text-yellow-300 text-xs sm:text-sm">
                    Redeemed Rewards
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="space-y-3 sm:space-y-4">
                <h5 className="text-base sm:text-lg font-semibold text-white flex items-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
                  Activity Details
                </h5>

                <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm mb-1 flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Member Since
                      </div>
                      <div className="text-white font-medium text-sm sm:text-base">
                        {selectedUser.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm mb-1 flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Last Activity
                      </div>
                      <div className="text-white font-medium text-sm sm:text-base">
                        {selectedUser.lastScanAt
                          ? selectedUser.lastScanAt
                              .toDate()
                              .toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser.mobileNumber && (
                  <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30 rounded-lg p-3 sm:p-4">
                    <div className="text-gray-400 text-xs sm:text-sm mb-2 flex items-center">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Contact Number
                    </div>
                    <div className="text-white text-sm sm:text-base">
                      {selectedUser.mobileNumber}
                    </div>
                  </div>
                )}

                {selectedUser.role === "customer" && (
                  <>
                    {/* Current In-Progress Rewards */}
                    <div className="bg-gradient-to-br from-blue-700/30 to-blue-800/30 border border-blue-600/30 rounded-lg p-3 sm:p-4">
                      <div className="text-gray-400 text-xs sm:text-sm mb-3 flex items-center">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Current In-Progress Rewards
                      </div>
                      {selectedUser.completedRewards &&
                      selectedUser.completedRewards.filter(
                        reward =>
                          reward.scanHistory?.length <
                          (reward.offerSnapshot?.stampRequirement || 0)
                      ).length > 0 ? (
                        <div className="space-y-3">
                          {selectedUser.completedRewards
                            .filter(
                              reward =>
                                reward.scanHistory?.length <
                                (reward.offerSnapshot?.stampRequirement || 0)
                            )
                            .map((reward, index) => {
                              const currentProgress =
                                reward.scanHistory?.length || 0;
                              const required =
                                reward.offerSnapshot?.stampRequirement || 0;
                              const progressPercentage =
                                required > 0
                                  ? Math.min(
                                      (currentProgress / required) * 100,
                                      100
                                    )
                                  : 0;

                              return (
                                <div
                                  key={index}
                                  className="bg-blue-800/20 rounded p-3 border border-blue-700/30"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="text-white font-medium text-xs sm:text-sm">
                                      {reward.offerSnapshot?.offerName ||
                                        "Loyalty Reward"}
                                    </div>
                                    <span className="text-blue-300 text-xs">
                                      {currentProgress}/{required} stamps
                                    </span>
                                  </div>
                                  <div className="w-full bg-blue-600/30 rounded-full h-2 mb-2">
                                    <div
                                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${progressPercentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-blue-300 text-xs">
                                    Started:{" "}
                                    {reward.createdAt
                                      .toDate()
                                      .toLocaleDateString()}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs sm:text-sm italic">
                          No rewards in progress
                        </div>
                      )}
                    </div>

                    {/* Available Rewards to Redeem */}
                    <div className="bg-gradient-to-br from-green-700/30 to-green-800/30 border border-green-600/30 rounded-lg p-3 sm:p-4">
                      <div className="text-gray-400 text-xs sm:text-sm mb-3 flex items-center">
                        <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Available Rewards to Redeem
                      </div>
                      {(() => {
                        // First, get all completed rewards (fully earned)
                        const completedRewards =
                          selectedUser.completedRewards?.filter(
                            reward =>
                              reward.scanHistory?.length >=
                              reward.offerSnapshot?.stampRequirement
                          ) || [];

                        // Then, get rewards ready to redeem (completed but not claimed)
                        const rewardsReadyToRedeem = completedRewards.filter(
                          reward => !reward.claimedAt
                        );

                        console.log(rewardsReadyToRedeem);

                        return rewardsReadyToRedeem.length > 0 ? (
                          <div className="space-y-3">
                            {rewardsReadyToRedeem.map((reward, index) => (
                              <div
                                key={index}
                                className="bg-green-800/20 rounded p-3 border border-green-700/30"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-white font-medium text-xs sm:text-sm">
                                    {reward.offerSnapshot?.offerName ||
                                      "Loyalty Reward"}
                                  </div>
                                  <span className="text-green-300 text-xs">
                                    Ready to Redeem
                                  </span>
                                </div>
                                <div className="text-green-300 text-xs mb-2">
                                  {reward.rewardDescription || "No description"}
                                </div>
                                <div className="text-green-300 text-xs">
                                  Completed:{" "}
                                  {reward.createdAt
                                    .toDate()
                                    .toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs sm:text-sm italic">
                            No rewards ready to redeem
                          </div>
                        );
                      })()}
                    </div>

                    {/* Already Redeemed Rewards */}
                    <div className="bg-gradient-to-br from-purple-700/30 to-purple-800/30 border border-purple-600/30 rounded-lg p-3 sm:p-4">
                      <div className="text-gray-400 text-xs sm:text-sm mb-3 flex items-center">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Already Redeemed Rewards
                      </div>
                      {selectedUser.completedRewards &&
                      selectedUser.completedRewards.filter(r => r.claimedAt)
                        .length > 0 ? (
                        <div className="space-y-3">
                          {selectedUser.completedRewards
                            .filter(reward => reward.claimedAt)
                            .map((reward, index) => (
                              <div
                                key={index}
                                className="bg-purple-800/20 rounded p-3 border border-purple-700/30"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-white font-medium text-xs sm:text-sm">
                                    {reward.offerSnapshot?.offerName ||
                                      "Loyalty Reward"}
                                  </div>
                                  <span className="text-purple-300 text-xs">
                                    Redeemed
                                  </span>
                                </div>
                                <div className="text-purple-300 text-xs mb-2">
                                  {reward.offerSnapshot?.rewardDescription ||
                                    "No description"}
                                </div>
                                <div className="text-purple-300 text-xs">
                                  Redeemed:{" "}
                                  {reward.claimedAt
                                    ? reward.claimedAt
                                        .toDate()
                                        .toLocaleDateString()
                                    : "Unknown"}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs sm:text-sm italic">
                          No rewards redeemed yet
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedUser.role !== "customer" && (
                  <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30 rounded-lg p-3 sm:p-4">
                    <div className="text-gray-400 text-xs sm:text-sm mb-2 flex items-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Admin Information
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">
                          Role Level:
                        </span>
                        <span className="text-white font-medium text-sm">
                          {selectedUser.role === "super_admin"
                            ? "Super Administrator"
                            : "Administrator"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">
                          Permissions:
                        </span>
                        <span className="text-white font-medium text-sm">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" />
                  Edit Customer
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                  className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number
                </label>
                <Input
                  value={editForm.mobileNumber}
                  onChange={e =>
                    setEditForm({ ...editForm, mobileNumber: e.target.value })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
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
