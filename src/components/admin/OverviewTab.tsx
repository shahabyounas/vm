import React from "react";
import { User } from "@/hooks/auth.types";
import { Gift, Activity, Clock } from "lucide-react";

interface OverviewTabProps {
  totalUsers: number;
  customers: User[];
  activeUsers: number;
  totalRewards: number;
  totalOffers: number;
  activeOffers: number;
  recentUsers: User[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  totalUsers,
  customers,
  activeUsers,
  totalRewards,
  totalOffers,
  activeOffers,
  recentUsers,
}) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {totalUsers}
          </div>
          <div className="text-blue-300 text-lg">Total Users</div>
          <div className="text-blue-400 text-sm mt-2">All registered users</div>
        </div>

        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">
            {customers.length}
          </div>
          <div className="text-green-300 text-lg">Customers</div>
          <div className="text-green-400 text-sm mt-2">
            Loyalty program members
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-purple-400 mb-2">
            {activeUsers}
          </div>
          <div className="text-purple-300 text-lg">Active Users</div>
          <div className="text-purple-400 text-sm mt-2">Last 7 days</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {totalRewards}
          </div>
          <div className="text-yellow-300 text-lg">Total Rewards</div>
          <div className="text-yellow-400 text-sm mt-2">
            Earned by customers
          </div>
        </div>
      </div>

      {/* Offers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-red-400" />
            Offers Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Offers:</span>
              <span className="text-white font-semibold">{totalOffers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Offers:</span>
              <span className="text-green-400 font-semibold">
                {activeOffers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inactive Offers:</span>
              <span className="text-red-400 font-semibold">
                {totalOffers - activeOffers}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-indigo-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-400" />
            User Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Rate:</span>
              <span className="text-white font-semibold">
                {customers.length > 0
                  ? Math.round((activeUsers / customers.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avg. Rewards:</span>
              <span className="text-white font-semibold">
                {customers.length > 0
                  ? (totalRewards / customers.length).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Engagement:</span>
              <span className="text-green-400 font-semibold">
                {activeUsers > 0 ? "High" : "Low"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-yellow-400" />
          Business Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {totalUsers > 0
                ? Math.round((customers.length / totalUsers) * 100)
                : 0}
              %
            </div>
            <div className="text-blue-300 text-sm">Customer Conversion</div>
            <div className="text-blue-400 text-xs">
              Users to Loyalty Members
            </div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {customers.length > 0
                ? Math.round((activeUsers / customers.length) * 100)
                : 0}
              %
            </div>
            <div className="text-green-300 text-sm">Customer Engagement</div>
            <div className="text-green-400 text-xs">Active in Last 7 Days</div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {totalOffers > 0
                ? Math.round((activeOffers / totalOffers) * 100)
                : 0}
              %
            </div>
            <div className="text-purple-300 text-sm">Offer Utilization</div>
            <div className="text-purple-400 text-xs">
              Active vs Total Offers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
