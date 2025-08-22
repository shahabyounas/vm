import QRCode from "@/components/QRCode";
import { User } from "@/hooks/auth.types";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";
import CircularCountdown from "@/components/CircularCountdown";

const LoyaltyCard = ({ user }: { user: User }) => {
  const { canScan, nextScanTime, remainingTime, hoursRemaining, isComplete } =
    useCooldownTimer(user.lastScanAt);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-10 min-h-[460px] flex flex-col justify-center -mt-0 shadow-2xl">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-6">
          Your Loyalty Card
        </h3>

        {/* Scan Status Indicator */}
        {!canScan && remainingTime && (
          <div className="mb-4 p-8 bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-700/50 rounded-xl shadow-2xl">
            {/* Timer Header */}
            <div className="text-center mb-6">
              <div className="text-red-400 text-xl font-bold mb-2">
                ⏰ DAILY RESET TIMER
              </div>
              <div className="text-red-300 text-sm">
                Scan available again the next day
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CircularCountdown
                  remainingTime={remainingTime}
                  hoursRemaining={hoursRemaining}
                  totalHours={24}
                  size={160}
                  strokeWidth={12}
                  isComplete={isComplete}
                />
              </div>
            </div>

            {/* Timer Status */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-red-900/50 border border-red-600/50 rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-red-300 text-sm font-medium">
                  TIMER ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {canScan && (
          <>
            <div className="mb-4 p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg">
              <div className="text-green-400 text-sm font-medium">
                {isComplete ? "🎉 Ready to Scan!" : "✅ Ready to Scan"}
              </div>
            </div>

            <div
              className={`flex justify-center mb-6 ${isComplete ? "animate-bounce" : ""}`}
            >
              <QRCode value={`LOYALTY:${user.email}:${user.id}`} size={200} />
            </div>
          </>
        )}
        <p className="text-gray-400 text-sm">
          Show this QR code to staff to earn loyalty points
        </p>

        {/* Additional Info */}
        <div className="mt-4 text-xs text-gray-500">
          <p>• One stamp per 24 hours</p>
          <p>• {user.purchases || 0} stamps collected</p>
          <p>• {user.purchaseLimit || 5} stamps needed for reward</p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;
