import { Timestamp } from "firebase/firestore";
import { useState } from "react";

interface ScanEvent {
  scannedBy: string;
  timestamp: Timestamp;
}

interface Reward {
  rewardId: string;
  claimedAt: Timestamp | null;
  scanHistory?: ScanEvent[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  currentReward?: Reward;
  rewards?: Reward[];
  purchaseLimit?: number;
}

const RewardDetailModal = ({
  reward,
  isOpen,
  onClose,
}: {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !reward) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-red-900/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Reward Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            <p>Reward ID: {reward.rewardId}</p>
            {reward.claimedAt && (
              <p className="text-green-600">
                Claimed:{" "}
                {reward.claimedAt.toDate
                  ? new Date(reward.claimedAt.toDate()).toLocaleString()
                  : ""}
              </p>
            )}
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {reward.scanHistory && reward.scanHistory.length > 0 ? (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Scan History ({reward.scanHistory.length} scans)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead>
                    <tr className="border-b justify-between border-gray-700 md:table-row flex flex-col md:flex-row">
                      <th className="px-4 py-3 font-semibold flex flex-col md:table-cell text-center md:text-left">
                        <span className="block md:hidden text-xs text-gray-400">
                          Scan #
                        </span>
                        <span className="hidden md:block">Scan #</span>
                      </th>
                      <th className="px-4 py-3 font-semibold flex flex-col md:table-cell text-center md:text-left">
                        <span className="block md:hidden text-xs text-gray-400">
                          Scanned By
                        </span>
                        <span className="hidden md:block">Scanned By</span>
                      </th>
                      <th className="px-4 py-3 font-semibold flex flex-col md:table-cell text-center md:text-left">
                        <span className="block md:hidden text-xs text-gray-400">
                          Date & Time
                        </span>
                        <span className="hidden md:block">Date & Time</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reward.scanHistory.map((scan, idx) => (
                      <tr
                        key={scan.timestamp?.seconds + scan.scannedBy}
                        className="border-b border-gray-800 hover:bg-gray-800/50 md:table-row flex flex-col md:flex-row justify-center text-center md:text-left"
                      >
                        <td className="px-4 py-3 font-medium flex flex-col md:table-cell items-center md:items-start">
                          <span className="block text-xs text-gray-400 md:hidden">
                            Scan #
                          </span>
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 flex flex-col md:table-cell items-center md:items-start">
                          <span className="block text-xs text-gray-400 md:hidden">
                            Scanned By
                          </span>
                          {scan.scannedBy}
                        </td>
                        <td className="px-4 py-3 flex flex-col md:table-cell items-center md:items-start">
                          <span className="block text-xs text-gray-400 md:hidden">
                            Date & Time
                          </span>
                          {scan.timestamp?.toDate
                            ? new Date(scan.timestamp.toDate()).toLocaleString()
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>No scan history available for this reward.</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-red-900/30">
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RewardHistoryTable = ({
  rewards,
  onRewardClick,
}: {
  rewards?: Reward[];
  onRewardClick: (reward: Reward) => void;
}) => {
  if (!rewards || rewards.length === 0) {
    return <div className="text-gray-400 text-sm">No rewards claimed.</div>;
  }
  return (
    <div className="space-y-4 mt-2 mb-4">
      <h4 className="text-sm font-semibold text-white">Claimed Rewards</h4>
      {rewards
        .slice()
        .reverse()
        .map((reward, idx) => (
          <div
            key={reward.rewardId}
            className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => onRewardClick(reward)}
          >
            <div className="flex flex-wrap items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-white">
                Reward #{rewards.length - idx} - {reward.rewardId}
              </h5>
              <span className="text-xs text-green-500 text-gray-400">
                Claimed:{" "}
                {reward.claimedAt && reward.claimedAt.toDate
                  ? new Date(reward.claimedAt.toDate()).toLocaleString()
                  : ""}
              </span>
            </div>
            {reward.scanHistory && reward.scanHistory.length > 0 && (
              <div className="mt-2">
                <h6 className="text-xs font-medium text-gray-300 mb-1">
                  Scans for this reward: {reward.scanHistory.length} scans
                </h6>
                <p className="text-xs text-gray-400">
                  Click to view detailed scan history
                </p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

const RewardsHistory = ({ allUsers }: { allUsers: User[] }) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-6 min-h-[460px] flex flex-col justify-start -mt-0 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-4">Rewards History</h3>
      <div className="space-y-2">
        {allUsers
          .filter((u) => u.role === "customer")
          .map((u) => (
            <div key={u.id} className="bg-gray-800/60 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between mb-2">
                <span className="font-semibold text-white">
                  {u.name} ({u.email})
                </span>
                <span className="text-xs text-gray-400">
                  Total Scans: {u.currentReward?.scanHistory?.length || 0}
                </span>
              </div>
              <RewardHistoryTable
                rewards={u.rewards}
                onRewardClick={(reward) => {
                  setSelectedReward(reward);
                  setShowRewardModal(true);
                }}
              />
            </div>
          ))}
      </div>
      <RewardDetailModal
        reward={selectedReward}
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setSelectedReward(null);
        }}
      />
    </div>
  );
};

export default RewardsHistory;
