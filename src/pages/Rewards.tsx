import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Gift, CheckCircle, Clock, Star } from "lucide-react";
import { Reward } from "@/hooks/auth.types";
import { trackEvent } from "@/lib/analytics";

const Rewards = () => {
  const { user, loading, redeemReward } = useAuth();
  const navigate = useNavigate();
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("page_view", { page: "Rewards" });
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleRedeemReward = async (rewardId: string) => {
    setRedeemingReward(rewardId);

    try {
      await redeemReward(rewardId);

      toast({
        title: "Reward Redeemed!",
        description: "Your reward has been successfully redeemed.",
      });

      trackEvent("reward_redeemed", { reward_id: rewardId, user_id: user.id });

      // Refresh the page or update the reward status
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRedeemingReward(null);
    }
  };

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

  const availableRewards =
    user.completedRewards?.filter(r => !r.claimedAt) || [];
  const claimedRewards = user.completedRewards?.filter(r => r.claimedAt) || [];
  const currentProgress = user.currentReward;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/80 to-black/80 backdrop-blur-sm border-b border-red-800/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-red-300 hover:text-white hover:bg-red-900/30"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">My Rewards</h1>
                <p className="text-red-300 text-sm">
                  Manage and redeem your earned rewards
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">Total Rewards</div>
              <div className="text-2xl font-bold text-red-400">
                {user.completedRewards?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Current Progress - In-Progress Rewards */}
        {user.completedRewards &&
          user.completedRewards.filter(r => {
            const totalStampsEarned =
              r.scanHistory?.reduce(
                (total, scan) => total + (scan.stampsEarned || 1),
                0
              ) || 0;
            return totalStampsEarned < (r.offerSnapshot?.stampRequirement || 0);
          }).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                Rewards in Progress
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.completedRewards
                  .filter(reward => {
                    const totalStampsEarned =
                      reward.scanHistory?.reduce(
                        (total, scan) => total + (scan.stampsEarned || 1),
                        0
                      ) || 0;
                    return (
                      totalStampsEarned <
                      (reward.offerSnapshot?.stampRequirement || 0)
                    );
                  })
                  .map(reward => {
                    const totalStampsEarned =
                      reward.scanHistory?.reduce(
                        (total, scan) => total + (scan.stampsEarned || 1),
                        0
                      ) || 0;
                    const required =
                      reward.offerSnapshot?.stampRequirement || 0;
                    const progressPercentage =
                      required > 0
                        ? Math.min((totalStampsEarned / required) * 100, 100)
                        : 0;

                    return (
                      <div
                        key={reward.rewardId}
                        className="bg-gradient-to-br from-gray-900/90 to-blue-900/90 border border-blue-800/50 rounded-xl p-6 hover:border-blue-600/70 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">🎯</div>
                          <div className="text-xl font-bold text-white mb-1">
                            {reward.offerSnapshot?.offerName ||
                              "Loyalty Reward"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {reward.rewardDescription}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress:</span>
                            <span className="text-white font-medium">
                              {totalStampsEarned} / {required} stamps
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-center mt-2">
                            <div className="text-blue-300 text-xs">
                              {required - totalStampsEarned > 0
                                ? `${required - totalStampsEarned} more stamps needed`
                                : "🎉 Ready to complete!"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white capitalize">
                              {reward.rewardType}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Value:</span>
                            <span className="text-white">
                              {reward.rewardValue}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Started:</span>
                            <span className="text-white">
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

        {/* Available Rewards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-green-400" />
            Available Rewards ({availableRewards.length})
          </h2>

          {availableRewards.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-r from-gray-900/50 to-red-900/50 border border-gray-700/50 rounded-xl">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Available Rewards
              </h3>
              <p className="text-gray-400 mb-4">
                Complete your purchase goal to earn your first reward!
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableRewards.map(reward => (
                <div
                  key={reward.rewardId}
                  className="bg-gradient-to-br from-gray-900/90 to-red-900/90 border border-red-800/50 rounded-xl p-6 hover:border-red-600/70 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {getRewardIcon(reward.rewardType)}
                    </div>
                    <div className="text-xl font-bold text-white mb-1">
                      {reward.rewardDescription}
                    </div>
                    <div className="text-sm text-gray-400">
                      Earned on {reward.createdAt.toDate().toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">
                        {reward.rewardType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Value:</span>
                      <span className="text-white">{reward.rewardValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Goal:</span>
                      <span className="text-white">
                        {reward.offerSnapshot?.stampRequirement || 0} stamps
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRedeemReward(reward.rewardId)}
                    disabled={redeemingReward === reward.rewardId}
                    className={`w-full bg-gradient-to-r ${getRewardColor(reward.rewardType)} hover:opacity-90 transition-all duration-300`}
                  >
                    {redeemingReward === reward.rewardId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Redeem Reward
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claimed Rewards */}
        {claimedRewards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Claimed Rewards ({claimedRewards.length})
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {claimedRewards.map(reward => (
                <div
                  key={reward.rewardId}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-xl p-6 opacity-75"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {getRewardIcon(reward.rewardType)}
                    </div>
                    <div className="text-xl font-bold text-gray-300 mb-1">
                      {reward.rewardDescription}
                    </div>
                    <div className="text-sm text-gray-500">
                      Claimed on{" "}
                      {reward.claimedAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-300 capitalize">
                        {reward.rewardType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Value:</span>
                      <span className="text-gray-300">
                        {reward.rewardValue}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Goal:</span>
                      <span className="text-gray-300">
                        {reward.offerSnapshot?.stampRequirement || 0} stamps
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-green-900/50 border border-green-600/50 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-green-300 text-sm font-medium">
                        REDEEMED
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reward History Stats */}
        <div className="bg-gradient-to-r from-gray-900/90 to-red-900/90 border border-red-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Reward Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {user.completedRewards?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Total Earned</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {claimedRewards.length}
              </div>
              <div className="text-sm text-gray-400">Redeemed</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {availableRewards.length}
              </div>
              <div className="text-sm text-gray-400">Available</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {user.purchases}
              </div>
              <div className="text-sm text-gray-400">Current Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
