import CircularProgress from "./CircularProgress";
import { Button } from "@/components/ui/button";
import { User, GlobalSettings, Offer } from "@/hooks/auth.types";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";
import CircularCountdown from "@/components/CircularCountdown";

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

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-10 min-h-[460px] flex flex-col justify-center -mt-0 shadow-2xl">
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
      {/* Card Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow-[0_0_16px_#ef4444cc] animate-fadeIn">
          Your Progress
        </h3>
        <div className="flex flex-col items-center justify-center mb-6 animate-fadeIn">
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-red-500/40 via-pink-400/20 to-purple-700/10 blur-2xl animate-pulse"
              style={{ animationDuration: "3s" }}
            />
            <CircularProgress value={user.purchases} max={userPurchaseLimit} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl mb-5 mr-3 font-extrabold text-white drop-shadow-[0_2px_8px_#000a] animate-pulse">
                {user.purchases}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-col items-center">
            <span className="text-base text-gray-300 font-semibold tracking-wide">
              of {userPurchaseLimit} Purchases
            </span>
          </div>
        </div>
        <div className="text-center space-y-4">
          {/* Cooldown Status */}

          {canScan && (
            <div className="p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg">
              <div className="text-green-400 text-sm font-medium">
                {isComplete
                  ? "🎉 Ready for next scan!"
                  : "✅ Ready for next scan"}
              </div>
            </div>
          )}

          {/* Current Offer Progress */}
          {currentOffer && (
            <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-lg mb-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Current Offer: {currentOffer.name}
                </h4>
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
                <p className="text-gray-300 text-sm">
                  {currentOffer.rewardDescription}
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-400 text-sm max-w-xs">
            {user.purchases >= userPurchaseLimit
              ? "🎉 You've earned a reward! Check your rewards page."
              : settings?.descriptionMessage ||
                `Complete ${purchasesRemaining} more purchase${
                  purchasesRemaining === 1 ? "" : "s"
                } to unlock your reward.`}
          </p>
          {user.isRewardReady && onViewReward && (
            <Button
              onClick={onViewReward}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View Reward 🎉
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
