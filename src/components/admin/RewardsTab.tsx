import React from "react";
import { User } from "@/hooks/auth.types";

interface RewardsTabProps {
  allUsers: User[];
}

const RewardsTab: React.FC<RewardsTabProps> = ({ allUsers }) => {
  const allRewards = allUsers.flatMap(user =>
    (user.completedRewards || []).map(reward => ({
      ...reward,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
    }))
  );

  const activeRewards = allRewards.filter(r => !r.claimedAt);
  const claimedRewards = allRewards.filter(r => r.claimedAt);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {allRewards.length}
          </div>
          <div className="text-blue-300 text-lg">Total Rewards</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {activeRewards.length}
          </div>
          <div className="text-green-300 text-lg">Active Rewards</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {claimedRewards.length}
          </div>
          <div className="text-yellow-300 text-lg">Claimed Rewards</div>
        </div>
      </div>

      {/* Active Rewards */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Active Rewards ({activeRewards.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeRewards.map(reward => (
            <div
              key={reward.rewardId}
              className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-700/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold text-white">
                  {reward.rewardDescription}
                </div>
                <span className="text-xs text-green-300 bg-green-900/50 px-2 py-1 rounded-full">
                  ACTIVE
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">User:</span>
                  <span className="text-white">{reward.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">
                    {reward.rewardType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Value:</span>
                  <span className="text-white">{reward.rewardValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Earned:</span>
                  <span className="text-white">
                    {reward.createdAt.toDate().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsTab;
