import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reward } from "@/hooks/auth.types";
import Confetti from "react-confetti";
import { Gift, Star, CheckCircle } from "lucide-react";

interface RewardCelebrationProps {
  reward: Reward;
  onClose: () => void;
}

const RewardCelebration: React.FC<RewardCelebrationProps> = ({
  reward,
  onClose,
}) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showRings, setShowRings] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
    // Hide rings after 3 seconds
    const ringsTimer = setTimeout(() => setShowRings(false), 3000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(ringsTimer);
    };
  }, []);

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case "percentage":
        return "💯";
      case "fixed_amount":
        return "💰";
      case "free_item":
        return "🎁";
      default:
        return "🎉";
    }
  };

  const getRewardColor = (rewardType: string) => {
    switch (rewardType) {
      case "percentage":
        return "from-purple-600 to-purple-700";
      case "fixed_amount":
        return "from-green-600 to-green-700";
      case "free_item":
        return "from-blue-600 to-blue-700";
      default:
        return "from-red-600 to-red-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={300}
          recycle={false}
          colors={[
            "#ef4444",
            "#fff",
            "#facc15",
            "#ff9800",
            "#a3e635",
            "#8b5cf6",
          ]}
        />
      )}

      {/* Animated background rings */}
      {showRings && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 border-4 border-red-500/30 rounded-full animate-ping"></div>
            <div
              className="absolute w-80 h-80 border-4 border-yellow-500/30 rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute w-64 h-64 border-4 border-green-500/30 rounded-full animate-ping"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      )}

      <div className="relative z-10 bg-gradient-to-br from-gray-900/95 to-red-900/95 border border-red-800/50 rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
        {/* Celebration Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            {getRewardIcon(reward.rewardType)}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-gray-300 text-lg">You've earned your reward!</p>
        </div>

        {/* Reward Details */}
        <div className="bg-gradient-to-r from-gray-800/50 to-red-800/50 border border-red-700/50 rounded-2xl p-6 mb-6">
          <div className="text-4xl font-bold text-white mb-2">
            {reward.rewardDescription}
          </div>
          <div className="text-gray-300 mb-4">
            {reward.settingsSnapshot.descriptionMessage}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white capitalize">{reward.rewardType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Value:</span>
              <span className="text-white">{reward.rewardValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Goal:</span>
              <span className="text-white">
                {reward.settingsSnapshot.purchaseLimit} purchases
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Earned:</span>
              <span className="text-white">
                {reward.createdAt.toDate().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/rewards")}
            className={`w-full bg-gradient-to-r ${getRewardColor(reward.rewardType)} hover:opacity-90 text-white font-semibold py-3 text-lg`}
          >
            <Gift className="w-5 h-5 mr-2" />
            View All Rewards
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Achievement Badge */}
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 border border-yellow-500 rounded-full">
            <Star className="w-4 h-4 mr-2 text-yellow-200" />
            <span className="text-yellow-100 text-sm font-medium">
              ACHIEVEMENT UNLOCKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardCelebration;
