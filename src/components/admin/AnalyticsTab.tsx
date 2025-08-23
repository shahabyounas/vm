import React from "react";
import { User, Offer } from "@/hooks/auth.types";
import { TrendingUp } from "lucide-react";

interface AnalyticsTabProps {
  allUsers: User[];
  offers: Offer[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ allUsers, offers }) => {
  const customers = allUsers.filter(u => u.role === "customer");
  const totalRewards = customers.reduce(
    (sum, user) => sum + (user.completedRewards?.length || 0),
    0
  );
  const activeUsers = customers.filter(
    u =>
      u.lastScanAt &&
      new Date().getTime() - u.lastScanAt.toDate().getTime() <
        7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {customers.length}
          </div>
          <div className="text-blue-300 text-lg">Total Customers</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {totalRewards}
          </div>
          <div className="text-green-300 text-lg">Total Rewards</div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {activeUsers}
          </div>
          <div className="text-purple-300 text-lg">Active Users</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {offers.length}
          </div>
          <div className="text-yellow-300 text-lg">Total Offers</div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Performance Overview
        </h3>
        <div className="h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Performance charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
