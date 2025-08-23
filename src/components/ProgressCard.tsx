import { Button } from "@/components/ui/button";
import { User, GlobalSettings, Offer } from "@/hooks/auth.types";
import {
  User as UserIcon,
  Calendar,
  Target,
  Award,
  Trophy,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { useState } from "react";

interface ProgressCardProps {
  user: User;
  userPurchaseLimit: number;
  settings: GlobalSettings | null;
  purchasesRemaining: number;
  onViewReward?: () => void;
  currentOffer?: Offer | null;
}

const ProgressCard = ({
  user,
  userPurchaseLimit,
  settings,
  purchasesRemaining,
  onViewReward,
  currentOffer,
}: ProgressCardProps) => {
  const [expandedSections, setExpandedSections] = useState({
    inProgress: true,
    completed: false,
  });
  const [showAllRewards, setShowAllRewards] = useState(false);

  // Calculate actual user data
  const totalLifetimeStamps = user.purchases || 0;

  // Calculate total completed rewards (rewards that have been fully earned)
  const completedRewards =
    user.completedRewards?.filter(
      reward =>
        reward.scanHistory?.length >= reward.offerSnapshot?.stampRequirement
    ) || [];

  // Calculate total in-progress rewards (rewards being worked on)
  const inProgressRewards =
    user.completedRewards?.filter(
      reward =>
        reward.scanHistory?.length < reward.offerSnapshot?.stampRequirement
    ) || [];

  // Calculate rewards ready to redeem (completed but not claimed)
  const rewardsReadyToRedeem = completedRewards.filter(
    reward => !reward.claimedAt
  );

  // Calculate total stamps from all rewards (both completed and in-progress)
  const totalStampsFromRewards =
    user.completedRewards?.reduce((total, reward) => {
      return total + (reward.scanHistory?.length || 0);
    }, 0) || 0;

  // Use the higher value between purchases and calculated stamps for total
  const actualTotalStamps = Math.max(
    totalLifetimeStamps,
    totalStampsFromRewards
  );

  // Limit displayed rewards for better UX
  const maxVisibleRewards = 3;
  const displayedInProgress = showAllRewards
    ? inProgressRewards
    : inProgressRewards.slice(0, maxVisibleRewards);
  const displayedCompleted = showAllRewards
    ? completedRewards
    : completedRewards.slice(0, maxVisibleRewards);

  const toggleSection = (section: "inProgress" | "completed") => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-xl p-6 shadow-2xl">
      {/* Life Stamps Display - Center Focus */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
          <h3 className="text-2xl font-bold text-white">Life Stamps</h3>
        </div>

        {/* Large Stamp Counter - Shows Actual Total */}
        <div className="mb-4">
          <div className="text-5xl font-black text-white drop-shadow-[0_2px_8px_#000a] mb-2">
            {actualTotalStamps}
          </div>
          <div className="text-lg text-gray-300 font-medium">
            Total Stamps Collected Since Joining
          </div>
        </div>
      </div>

      {/* User Stats Grid - Three Meaningful Blocks */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">
            {completedRewards.length}
          </div>
          <div className="text-gray-300 text-xs">Rewards Completed</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">
            {inProgressRewards.length}
          </div>
          <div className="text-gray-300 text-xs">Rewards in Progress</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">
            {rewardsReadyToRedeem.length}
          </div>
          <div className="text-gray-300 text-xs">Ready to Redeem</div>
        </div>
      </div>

      {/* Current Active Rewards - Collapsible Section */}
      {inProgressRewards.length > 0 && (
        <div className="mb-4">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            {/* Section Header with Toggle */}
            <div
              className="flex items-center justify-between mb-3 cursor-pointer hover:bg-blue-900/30 rounded-lg p-2 transition-colors duration-200"
              onClick={() => toggleSection("inProgress")}
            >
              <div className="flex items-center">
                <Target className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-blue-300 text-sm font-medium">
                  Current Active Rewards ({inProgressRewards.length})
                </span>
              </div>
              {expandedSections.inProgress ? (
                <ChevronUp className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-400" />
              )}
            </div>

            {/* Collapsible Content */}
            {expandedSections.inProgress && (
              <div className="space-y-3">
                {displayedInProgress.map((reward, index) => {
                  const currentProgress = reward.scanHistory?.length || 0;
                  const currentRequired =
                    reward.offerSnapshot?.stampRequirement || 0;
                  const progressPercentage =
                    currentRequired > 0
                      ? Math.min((currentProgress / currentRequired) * 100, 100)
                      : 0;
                  const remainingStamps = Math.max(
                    0,
                    currentRequired - currentProgress
                  );

                  return (
                    <div
                      key={reward.rewardId}
                      className="bg-blue-900/10 border border-blue-600/20 rounded-lg p-3"
                    >
                      <div className="text-center">
                        <h4 className="text-white font-medium text-sm mb-2">
                          {reward.offerSnapshot?.offerName || "Loyalty Reward"}
                        </h4>
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-white font-medium">
                            {currentProgress} / {currentRequired} stamps
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-300 text-xs mb-2">
                            {reward.rewardDescription}
                          </p>
                          <div className="text-blue-300 text-xs">
                            {remainingStamps > 0
                              ? `${remainingStamps} more stamps needed`
                              : "🎉 Reward ready to redeem!"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show More/Less Button */}
                {inProgressRewards.length > maxVisibleRewards && (
                  <div className="text-center pt-2">
                    <Button
                      onClick={() => setShowAllRewards(!showAllRewards)}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                    >
                      {showAllRewards
                        ? "Show Less"
                        : `Show All ${inProgressRewards.length} Rewards`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Active Rewards Message */}
      {inProgressRewards.length === 0 && (
        <div className="mb-4">
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-sm mb-2">
              {completedRewards.length > 0
                ? "All rewards completed! 🎉"
                : "No active rewards yet"}
            </div>
            <div className="text-gray-500 text-xs">
              {completedRewards.length > 0
                ? "Check the Offers tab to start a new reward"
                : "Visit the Offers tab to start collecting stamps"}
            </div>
          </div>
        </div>
      )}

      {/* Member Since Info */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center text-gray-400 text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          Member since{" "}
          {user.createdAt.toDate().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Action Button - Only Show When Actually Ready */}
      {user.isRewardReady && onViewReward && (
        <div className="text-center">
          <Button
            onClick={onViewReward}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Award className="w-4 h-4 mr-2" />
            View Reward
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
