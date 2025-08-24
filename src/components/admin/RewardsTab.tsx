import React, { useState, useMemo } from "react";
import { User, Reward } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Eye,
  Gift,
  Target,
  Calendar,
  User as UserIcon,
  Clock,
  CheckCircle,
  X,
  Download,
  RefreshCw,
} from "lucide-react";

interface RewardsTabProps {
  allUsers: User[];
}

interface EnhancedReward extends Reward {
  userName: string;
  userEmail: string;
  userId: string;
}

const RewardsTab: React.FC<RewardsTabProps> = ({ allUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "claimed"
  >("all");
  const [selectedReward, setSelectedReward] = useState<EnhancedReward | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Flatten all rewards with user information
  const allRewards: EnhancedReward[] = useMemo(
    () =>
      allUsers.flatMap(user =>
        (user.completedRewards || []).map(reward => ({
          ...reward,
          userName: user.name,
          userEmail: user.email,
          userId: user.id,
        }))
      ),
    [allUsers]
  );

  // Filter rewards based on search and filters
  const filteredRewards = useMemo(() => {
    return allRewards.filter(reward => {
      const matchesSearch =
        reward.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.rewardDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        reward.offerSnapshot?.offerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !reward.claimedAt) ||
        (statusFilter === "claimed" && reward.claimedAt);

      return matchesSearch && matchesStatus;
    });
  }, [allRewards, searchTerm, statusFilter]);

  const openRewardDetail = (reward: EnhancedReward) => {
    setSelectedReward(reward);
    setIsDetailModalOpen(true);
  };

  const closeRewardDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedReward(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-400" />
              Search & Filters
            </h4>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 w-full sm:w-auto"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Rewards
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user, reward, or offer..."
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
                setStatusFilter(e.target.value as "all" | "active" | "claimed")
              }
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active Rewards</option>
              <option value="claimed">Claimed Rewards</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rewards List */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Gift className="w-5 h-5 mr-2 text-green-400" />
              Rewards ({filteredRewards.length})
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 w-full sm:w-auto"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          <div className="p-4 space-y-4">
            {filteredRewards.map(reward => (
              <div
                key={reward.rewardId}
                className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {reward.userName}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center">
                        <span className="truncate">{reward.userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reward.claimedAt
                        ? "bg-green-900/50 text-green-300 border border-green-700/50"
                        : "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                    }`}
                  >
                    {reward.claimedAt ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Claimed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Active
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-white font-medium text-sm">
                      {reward.rewardDescription}
                    </div>
                    <div className="text-gray-400 text-xs capitalize">
                      {reward.rewardType} • {reward.rewardValue}
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">
                    {reward.offerSnapshot?.offerName || "Unknown Offer"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reward.scanHistory?.length || 0} scans •{" "}
                    {reward.scanHistory?.reduce(
                      (total, scan) => total + (scan.stampsEarned || 1),
                      0
                    ) || 0}{" "}
                    stamps
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-300">
                    {reward.createdAt.toDate().toLocaleDateString()}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                    onClick={() => openRewardDetail(reward)}
                    title="View reward details and scan history"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Offer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Earned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredRewards.map(reward => (
                <tr
                  key={reward.rewardId}
                  className="hover:bg-gray-800/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {reward.userName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {reward.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {reward.rewardDescription}
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {reward.rewardType} • {reward.rewardValue}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {reward.offerSnapshot?.offerName || "Unknown Offer"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {reward.scanHistory?.length || 0} scans •{" "}
                      {reward.scanHistory?.reduce(
                        (total, scan) => total + (scan.stampsEarned || 1),
                        0
                      ) || 0}{" "}
                      stamps
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reward.claimedAt
                          ? "bg-green-900/50 text-green-300 border border-green-700/50"
                          : "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                      }`}
                    >
                      {reward.claimedAt ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Claimed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Active
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {reward.createdAt.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                      onClick={() => openRewardDetail(reward)}
                      title="View reward details and scan history"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No rewards found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No rewards have been earned yet"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reward Detail Modal */}
      {isDetailModalOpen && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" />
                  Reward Details
                </h3>
                <button
                  onClick={closeRewardDetail}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Reward Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-blue-400" />
                    User Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">
                        {selectedReward.userName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">
                        {selectedReward.userEmail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white font-mono text-xs">
                        {selectedReward.userId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                    <Gift className="w-4 h-4 mr-2 text-green-400" />
                    Reward Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Description:</span>
                      <span className="text-white">
                        {selectedReward.rewardDescription}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">
                        {selectedReward.rewardType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Value:</span>
                      <span className="text-white">
                        {selectedReward.rewardValue}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedReward.claimedAt
                            ? "bg-green-900/50 text-green-300 border border-green-700/50"
                            : "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50"
                        }`}
                      >
                        {selectedReward.claimedAt ? "Claimed" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Information */}
              <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-400" />
                  Offer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Offer Name:</span>
                      <span className="text-white">
                        {selectedReward.offerSnapshot?.offerName || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Description:</span>
                      <span className="text-white">
                        {selectedReward.offerSnapshot?.description ||
                          "No description"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stamps Required:</span>
                      <span className="text-white">
                        {selectedReward.offerSnapshot?.stampRequirement ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">
                        {selectedReward.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Claimed:</span>
                      <span className="text-white">
                        {selectedReward.claimedAt
                          ? selectedReward.claimedAt
                              .toDate()
                              .toLocaleDateString()
                          : "Not claimed yet"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Progress:</span>
                      <span className="text-white">
                        {selectedReward.scanHistory?.length || 0} /{" "}
                        {selectedReward.offerSnapshot?.stampRequirement || "?"}{" "}
                        stamps
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scan History */}
              <div className="bg-gray-800/30 rounded-lg p-3 sm:p-4">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                  Scan History ({selectedReward.scanHistory?.length || 0} scans)
                </h4>

                {/* Scan Summary */}
                <div className="mb-4 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {selectedReward.scanHistory?.length || 0}
                      </div>
                      <div className="text-gray-400 text-xs">Total Scans</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {selectedReward.scanHistory?.reduce(
                          (total, scan) => total + (scan.stampsEarned || 1),
                          0
                        ) || 0}
                      </div>
                      <div className="text-gray-400 text-xs">Total Stamps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {selectedReward.offerSnapshot?.stampRequirement || 0}
                      </div>
                      <div className="text-gray-400 text-xs">Required</div>
                    </div>
                  </div>
                </div>

                {selectedReward.scanHistory &&
                selectedReward.scanHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedReward.scanHistory.map((scan, index) => (
                      <div
                        key={scan.scanId || index}
                        className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">
                                Scanned by: {scan.scannedBy || "Unknown Admin"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {scan.timestamp.toDate().toLocaleString()}
                              </div>
                              <div className="text-xs text-green-400 font-medium">
                                +{scan.stampsEarned || 1} stamp
                                {scan.stampsEarned > 1 ? "s" : ""} earned
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              Scan #{index + 1}
                            </div>
                            <div className="text-xs text-blue-400 font-medium">
                              {scan.scanId ? scan.scanId.slice(-8) : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>No scan history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsTab;
