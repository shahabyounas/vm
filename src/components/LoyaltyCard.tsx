import { User, Offer, Reward } from "@/hooks/auth.types";
import { CheckCircle, Gift, Clock, Star, QrCode } from "lucide-react";
import { useState } from "react";
import QRCodeModal from "./QRCodeModal";

interface LoyaltyCardProps {
  user: User;
  offers: Offer[];
}

const LoyaltyCard = ({ user, offers }: LoyaltyCardProps) => {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Get all user rewards (both in progress and completed)
  const userRewards = user.completedRewards || [];

  // Separate rewards by status
  const inProgressRewards = userRewards.filter(reward => {
    const progress = reward.scanHistory?.length || 0;
    const required = reward.offerSnapshot?.stampRequirement || 0;
    return progress < required;
  });

  const completedRewards = userRewards.filter(reward => {
    const progress = reward.scanHistory?.length || 0;
    const required = reward.offerSnapshot?.stampRequirement || 0;
    return progress >= required;
  });

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-6 min-h-[460px] -mt-0 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        Your Rewards & Progress
      </h3>

      {/* In Progress Rewards Section */}
      {inProgressRewards.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Rewards in Progress
          </h4>
          <div className="space-y-4">
            {inProgressRewards.map(reward => {
              const progress = reward.scanHistory?.length || 0;
              const required = reward.offerSnapshot?.stampRequirement || 0;
              const progressPercentage = Math.min(
                (progress / required) * 100,
                100
              );

              return (
                <div
                  key={reward.rewardId}
                  className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-1">
                        {reward.offerSnapshot?.offerName || "Loyalty Reward"}
                      </h5>
                      <p className="text-gray-300 text-sm mb-2">
                        {reward.offerSnapshot?.description ||
                          "Collect stamps to earn this reward"}
                      </p>
                      <div className="text-blue-300 text-sm font-medium">
                        Reward: {reward.rewardDescription}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50">
                      IN PROGRESS
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Stamps Collected:</span>
                      <span className="text-white font-medium">
                        {progress} / {required} stamps
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Remaining:</span>
                      <span className="text-white font-medium">
                        {Math.max(0, required - progress)} more stamps needed
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Started:</span>
                      <span className="text-white font-medium">
                        {reward.createdAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Rewards Section */}
      {completedRewards.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-400" />
            Completed Rewards
          </h4>
          <div className="space-y-3">
            {completedRewards.map((reward, index) => {
              const isRedeemed = reward.claimedAt !== null;

              return (
                <div
                  key={reward.rewardId}
                  className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-white font-semibold mb-1">
                        {reward.offerSnapshot?.offerName ||
                          `Reward ${index + 1}`}
                      </h5>
                      <p className="text-gray-300 text-sm mb-2">
                        {reward.offerSnapshot?.description ||
                          "Loyalty program reward"}
                      </p>
                      <div className="text-purple-300 text-sm font-medium mb-1">
                        Reward: {reward.rewardDescription}
                      </div>
                      <p className="text-gray-400 text-xs">
                        Earned: {reward.createdAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isRedeemed
                            ? "bg-green-900/50 text-green-300 border border-green-700/50"
                            : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
                        }`}
                      >
                        {isRedeemed ? "REDEEMED" : "AVAILABLE"}
                      </span>
                    </div>
                  </div>

                  {!isRedeemed && (
                    <div className="text-center">
                      <button
                        onClick={() => handleRedeem(reward)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Redeem Reward
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Rewards Message */}
      {inProgressRewards.length === 0 && completedRewards.length === 0 && (
        <div className="text-center py-8">
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-300 mb-2">
            No Rewards Yet
          </h4>
          <p className="text-gray-500 text-sm">
            Start collecting stamps from the Offers tab to earn rewards!
          </p>
        </div>
      )}

      {/* Redeem QR Modal */}
      {showRedeemModal && selectedReward && (
        <QRCodeModal
          qrData={{
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            offerId: selectedReward.offerSnapshot?.offerId || "",
            offerName:
              selectedReward.offerSnapshot?.offerName || "Reward Redemption",
            timestamp: new Date().toISOString(),
            rewardId: selectedReward.rewardId,
            action: "redeem_reward",
          }}
          isOpen={showRedeemModal}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedReward(null);
          }}
        />
      )}
    </div>
  );
};

export default LoyaltyCard;
