import CircularProgress from "./CircularProgress";
import { Button } from "@/components/ui/button";
import { User, GlobalSettings, Offer } from "@/hooks/auth.types";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";
import CircularCountdown from "@/components/CircularCountdown";
import { useState, useEffect } from "react";
import {
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";

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
  const { canScan, nextScanTime, remainingTime, hoursRemaining, isComplete } =
    useCooldownTimer(user.lastScanAt);

  const [animatedStamps, setAnimatedStamps] = useState(user.purchases);
  const [showSparkles, setShowSparkles] = useState(false);
  const [achievementLevel, setAchievementLevel] = useState(0);

  // Calculate achievement level based on total stamps
  useEffect(() => {
    const totalStamps = user.purchases;
    if (totalStamps >= 50) setAchievementLevel(5);
    else if (totalStamps >= 30) setAchievementLevel(4);
    else if (totalStamps >= 20) setAchievementLevel(3);
    else if (totalStamps >= 10) setAchievementLevel(2);
    else if (totalStamps >= 5) setAchievementLevel(1);
    else setAchievementLevel(0);
  }, [user.purchases]);

  // Animate stamp count
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStamps(user.purchases);
    }, 500);
    return () => clearTimeout(timer);
  }, [user.purchases]);

  // Trigger sparkles animation
  useEffect(() => {
    if (user.purchases > animatedStamps) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
    }
  }, [user.purchases, animatedStamps]);

  const getAchievementTitle = (level: number) => {
    switch (level) {
      case 5:
        return "Master";
      case 4:
        return "Collector";
      case 3:
        return "Enthusiast";
      case 2:
        return "Beginner";
      case 1:
        return "Newbie";
      default:
        return "Rookie";
    }
  };

  const getNextMilestone = () => {
    const milestones = [5, 10, 20, 30, 50, 100];
    const current = user.purchases;
    const next = milestones.find(m => m > current) || 100;
    return { next, remaining: next - current };
  };

  const { next, remaining } = getNextMilestone();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-6 min-h-[460px] flex flex-col justify-center -mt-0 shadow-2xl">
      {/* Animated AI-inspired background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-red-500/30 via-pink-500/20 to-purple-700/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 via-cyan-400/10 to-purple-700/10 rounded-full blur-2xl animate-pulse delay-1000"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-radial from-red-400/10 via-transparent to-transparent rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: "7s" }}
        />
      </div>

      {/* Sparkles Animation */}
      {showSparkles && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1000}ms`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Achievement Badge */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-300 font-semibold text-sm">
              {getAchievementTitle(achievementLevel)}
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight drop-shadow-[0_0_16px_#ef4444cc] animate-fadeIn">
          Your Stamp Journey
        </h3>

        {/* Total Stamps Counter */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="text-6xl font-black text-white drop-shadow-[0_2px_8px_#000a] animate-bounce">
              {animatedStamps}
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold text-yellow-400 animate-pulse">
                🏆
              </div>
            </div>
          </div>
          <div className="text-xl text-gray-300 font-semibold">
            Total Life Stamps Collected
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative mb-6">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-red-500/40 via-pink-400/20 to-purple-700/10 blur-2xl animate-pulse"
              style={{ animationDuration: "3s" }}
            />
            <CircularProgress value={user.purchases} max={userPurchaseLimit} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-black text-white drop-shadow-[0_2px_8px_#000a]">
                  {user.purchases}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  of {userPurchaseLimit}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="mb-6 text-center">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-300 font-semibold">
                Next Milestone
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {next} Stamps
            </div>
            <div className="text-sm text-gray-300">{remaining} more to go!</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((user.purchases / next) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Current Offer Progress */}
        {currentOffer && (
          <div className="mb-6 w-full">
            <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                <h4 className="text-lg font-semibold text-white">
                  Current Mission: {currentOffer.name}
                </h4>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-300">Progress:</span>
                <span className="text-white font-medium">
                  {user.currentOfferProgress || 0} /{" "}
                  {currentOffer.stampRequirement} stamps
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((user.currentOfferProgress || 0) / currentOffer.stampRequirement) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-2">
                  {currentOffer.rewardDescription}
                </p>
                <div className="flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-300 text-xs font-medium">
                    Reward Ready at {currentOffer.stampRequirement} stamps!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        <div className="text-center space-y-3">
          {canScan ? (
            <div className="p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg animate-pulse">
              <div className="flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400 mr-2" />
                <div className="text-green-400 text-sm font-medium">
                  {isComplete
                    ? "🎉 Ready for next scan!"
                    : "✅ Ready for next scan!"}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border border-orange-700/50 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="text-orange-400 text-sm font-medium">
                  ⏰ Cooldown active - wait for next scan
                </div>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          <div className="p-3 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-700/30 rounded-lg">
            <p className="text-gray-300 text-sm">
              {user.purchases >= userPurchaseLimit
                ? "🎉 You've earned a reward! Check your rewards page."
                : `Keep collecting! ${purchasesRemaining} more stamp${purchasesRemaining === 1 ? "" : "s"} to unlock your next reward.`}
            </p>
          </div>

          {/* Action Button */}
          {user.isRewardReady && onViewReward && (
            <Button
              onClick={onViewReward}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-bounce"
            >
              View Reward 🎉
            </Button>
          )}
        </div>

        {/* Achievement Stars */}
        <div className="flex justify-center mt-4 space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < achievementLevel
                  ? "text-yellow-400 fill-current animate-pulse"
                  : "text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
