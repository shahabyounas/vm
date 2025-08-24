import { useState } from "react";
import QRCodeModal from "./QRCodeModal";
import {
  QrCode,
  Clock,
  Gift,
  Star,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User, Offer, Reward } from "@/hooks/auth.types";

interface LoyaltyCardProps {
  user: User;
  offers: Offer[];
}

const LoyaltyCard = ({ user, offers }: LoyaltyCardProps) => {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    inProgress: true,
    completed: true,
  });
  const [showAllInProgress, setShowAllInProgress] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const userRewards = user.completedRewards || [];

  // Filter rewards based on completion status
  const inProgressRewards = userRewards.filter(reward => {
    const totalStampsEarned =
      reward.scanHistory?.reduce(
        (total, scan) => total + (scan.stampsEarned || 1),
        0
      ) || 0;
    return totalStampsEarned < (reward.offerSnapshot?.stampRequirement || 0);
  });

  const completedRewards = userRewards.filter(reward => {
    const totalStampsEarned =
      reward.scanHistory?.reduce(
        (total, scan) => total + (scan.stampsEarned || 1),
        0
      ) || 0;
    return totalStampsEarned >= (reward.offerSnapshot?.stampRequirement || 0);
  });

  // Separate completed rewards into unredeemed and redeemed
  const unredeemedRewards = completedRewards.filter(
    reward => !reward.claimedAt
  );
  const redeemedRewards = completedRewards.filter(reward => !!reward.claimedAt);

  // Sort rewards by latest dates (most recent first)
  const sortByLatestDate = (a: Reward, b: Reward) => {
    const dateA = a.createdAt.toDate().getTime();
    const dateB = b.createdAt.toDate().getTime();
    return dateB - dateA; // Most recent first
  };

  const sortedInProgressRewards = [...inProgressRewards].sort(sortByLatestDate);
  const sortedUnredeemedRewards = [...unredeemedRewards].sort(sortByLatestDate);
  const sortedRedeemedRewards = [...redeemedRewards].sort(sortByLatestDate);

  // Limit displayed rewards for better UX
  const maxVisibleRewards = 3;
  const displayedInProgress = showAllInProgress
    ? sortedInProgressRewards
    : sortedInProgressRewards.slice(0, maxVisibleRewards);
  const displayedUnredeemed = showAllInProgress
    ? sortedUnredeemedRewards
    : sortedUnredeemedRewards.slice(0, maxVisibleRewards);
  const displayedRedeemed = showAllCompleted
    ? sortedRedeemedRewards
    : sortedRedeemedRewards.slice(0, maxVisibleRewards);

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setSelectedReward(null);
  };

  const toggleSection = (section: "inProgress" | "completed") => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Rewards in Progress Section - Collapsible */}
      {inProgressRewards.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 border border-blue-700/30 rounded-xl p-6 hover:bg-blue-900/30 transition-all duration-300">
          {/* Section Header with Toggle */}
          <div
            className="flex items-center justify-between mb-4 cursor-pointer hover:bg-blue-900/30 rounded-lg p-2 transition-colors duration-200"
            onClick={() => toggleSection("inProgress")}
          >
            <div className="flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2 animate-pulse" />
              <h3 className="text-lg font-semibold text-blue-300">
                Rewards in Progress ({inProgressRewards.length})
              </h3>
            </div>
            {expandedSections.inProgress ? (
              <ChevronUp className="w-5 h-5 text-blue-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-400" />
            )}
          </div>

          {/* Collapsible Content */}
          {expandedSections.inProgress && (
            <>
              <div className="space-y-4">
                {displayedInProgress.map(reward => {
                  const totalStampsEarned =
                    reward.scanHistory?.reduce(
                      (total, scan) => total + (scan.stampsEarned || 1),
                      0
                    ) || 0;
                  const required = reward.offerSnapshot?.stampRequirement || 0;
                  const progressPercentage = Math.min(
                    (totalStampsEarned / required) * 100,
                    100
                  );
                  const remaining = Math.max(0, required - totalStampsEarned);

                  return (
                    <div
                      key={reward.rewardId}
                      className="bg-blue-900/10 border border-blue-600/20 rounded-lg p-4 hover:bg-blue-900/20 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm mb-1 group-hover:text-blue-200 transition-colors duration-200">
                            {reward.offerSnapshot?.offerName ||
                              "Loyalty Reward"}
                          </h4>
                          <p className="text-gray-300 text-xs mb-2 group-hover:text-gray-200 transition-colors duration-200">
                            {reward.offerSnapshot?.description ||
                              "Collect stamps to earn this reward"}
                          </p>
                          <p className="text-blue-300 text-xs font-medium">
                            {reward.rewardDescription}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white font-medium">
                            {totalStampsEarned} / {required}
                          </div>
                          <div className="text-xs text-gray-400">
                            stamps collected
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-600 rounded-full h-2 mb-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {remaining > 0
                            ? `${remaining} more stamps needed`
                            : "🎉 Ready to redeem!"}
                        </span>
                        <span className="text-blue-300 font-medium">
                          Started{" "}
                          {reward.createdAt.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More/Less Button */}
              {inProgressRewards.length > maxVisibleRewards && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setShowAllInProgress(!showAllInProgress)}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  >
                    {showAllInProgress
                      ? "Show Less"
                      : `Show All ${inProgressRewards.length} In-Progress Rewards`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Completed Rewards Section - Collapsible */}
      {(unredeemedRewards.length > 0 || redeemedRewards.length > 0) && (
        <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-green-900/20 border border-green-700/30 rounded-xl p-6 hover:bg-green-900/30 transition-all duration-300">
          {/* Section Header with Toggle */}
          <div
            className="flex items-center justify-between mb-4 cursor-pointer hover:bg-green-900/30 rounded-lg p-2 transition-colors duration-200"
            onClick={() => toggleSection("completed")}
          >
            <div className="flex items-center">
              <Trophy className="w-5 h-5 text-green-400 mr-2 animate-pulse" />
              <h3 className="text-lg font-semibold text-green-300">
                Completed Rewards (
                {unredeemedRewards.length + redeemedRewards.length})
              </h3>
            </div>
            {expandedSections.completed ? (
              <ChevronUp className="w-5 h-5 text-green-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-green-400" />
            )}
          </div>

          {/* Collapsible Content */}
          {expandedSections.completed && (
            <>
              {/* Unredeemed Rewards - Show at Top */}
              {unredeemedRewards.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-green-200 mb-3 flex items-center">
                    <Gift className="w-4 h-4 mr-2 text-green-400" />
                    Ready to Redeem ({unredeemedRewards.length})
                  </h4>
                  <div className="space-y-4">
                    {displayedUnredeemed.map(reward => {
                      const isRedeemed = !!reward.claimedAt;

                      return (
                        <div
                          key={reward.rewardId}
                          className={`border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group ${
                            isRedeemed
                              ? "bg-gray-800/30 border-gray-600/30"
                              : "bg-green-900/10 border-green-600/20 hover:bg-green-900/20 hover:border-green-500/30"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm mb-1 group-hover:text-green-200 transition-colors duration-200">
                                {reward.offerSnapshot?.offerName ||
                                  "Loyalty Reward"}
                              </h4>
                              <p className="text-gray-300 text-xs mb-2 group-hover:text-gray-200 transition-colors duration-200">
                                {reward.offerSnapshot?.description ||
                                  "Reward description"}
                              </p>
                              <p className="text-green-300 text-xs font-medium">
                                {reward.rewardDescription}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  isRedeemed
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-green-700 text-green-300 animate-pulse"
                                }`}
                              >
                                {isRedeemed ? "REDEEMED" : "AVAILABLE"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              Earned{" "}
                              {reward.createdAt.toDate().toLocaleDateString()}
                            </span>
                            {isRedeemed && (
                              <span className="text-gray-400">
                                Redeemed{" "}
                                {reward.claimedAt
                                  ?.toDate()
                                  .toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Redeem Button for Available Rewards */}
                          {!isRedeemed && (
                            <div className="mt-3">
                              <Button
                                onClick={() => handleRedeem(reward)}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                              >
                                <Gift className="w-4 h-4 mr-2" />
                                Redeem Reward
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Redeemed Rewards */}
              {redeemedRewards.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-300 mb-3 flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-gray-400" />
                    Previously Redeemed ({redeemedRewards.length})
                  </h4>
                  <div className="space-y-4">
                    {displayedRedeemed.map(reward => {
                      return (
                        <div
                          key={reward.rewardId}
                          className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm mb-1 group-hover:text-gray-200 transition-colors duration-200">
                                {reward.offerSnapshot?.offerName ||
                                  "Loyalty Reward"}
                              </h4>
                              <p className="text-gray-300 text-xs mb-2 group-hover:text-gray-200 transition-colors duration-200">
                                {reward.offerSnapshot?.description ||
                                  "Reward description"}
                              </p>
                              <p className="text-gray-400 text-xs font-medium">
                                {reward.rewardDescription}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs px-2 py-1 rounded-full font-medium bg-gray-700 text-gray-300">
                                REDEEMED
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              Earned{" "}
                              {reward.createdAt.toDate().toLocaleDateString()}
                            </span>
                            <span className="text-gray-400">
                              Redeemed{" "}
                              {reward.claimedAt?.toDate().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Show More/Less Button */}
              {(unredeemedRewards.length > maxVisibleRewards ||
                redeemedRewards.length > maxVisibleRewards) && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white transition-colors duration-200"
                  >
                    {showAllCompleted
                      ? "Show Less"
                      : `Show All ${unredeemedRewards.length + redeemedRewards.length} Completed Rewards`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {userRewards.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-8 hover:bg-gray-800/40 transition-all duration-300">
            <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Rewards Yet
            </h3>
            <p className="text-gray-500 text-sm">
              Start collecting stamps from the Offers tab to earn your first
              reward!
            </p>
          </div>
        </div>
      )}

      {/* QR Code Modal for Redemption */}
      {showRedeemModal && selectedReward && (
        <QRCodeModal
          qrData={{
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            offerId: selectedReward.offerSnapshot?.offerId || "",
            offerName:
              selectedReward.offerSnapshot?.offerName || "Reward Redemption",
            stampsPerScan: 1, // Default value for reward redemption
            timestamp: new Date().toISOString(),
            rewardId: selectedReward.rewardId,
            action: "redeem_reward",
          }}
          isOpen={showRedeemModal}
          onClose={closeRedeemModal}
        />
      )}
    </div>
  );
};

export default LoyaltyCard;
