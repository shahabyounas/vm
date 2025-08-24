import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import Confetti from "react-confetti";
import Header from "@/components/Header";
import { Reward } from "@/hooks/auth.types";

interface QRData {
  userId: string;
  userEmail: string;
  userName: string;
  offerId: string;
  offerName: string;
  stampsPerScan: number;
  timestamp: string;
}
import RewardsHistory from "./RewardsHistory";
import UserList from "@/components/UserList";
import DashboardTabs from "@/components/DashboardTabs";
import ProgressCard from "@/components/ProgressCard";
import LoyaltyCard from "@/components/LoyaltyCard";
import Loader from "@/components/Loader";
import MenuBarActions from "@/components/MenuBarActions";
import WelcomeCard from "@/components/WelcomeCard";
import HeaderSkeleton from "@/components/HeaderSkeleton";
import WelcomeCardSkeleton from "@/components/WelcomeCardSkeleton";
import DashboardTabsSkeleton from "@/components/DashboardTabsSkeleton";
import ProgressCardSkeleton from "@/components/ProgressCardSkeleton";
import SessionStatus from "@/components/SessionStatus";
import RewardCelebration from "@/components/RewardCelebration";
import AdminDashboard from "@/components/AdminDashboard";
import QRCodeModal from "@/components/QRCodeModal";
import { Gift, Target, User } from "lucide-react";

const Dashboard = () => {
  // Only destructure from useDashboard what is actually used in Dashboard.tsx
  const {
    user,
    loading,
    settings,
    allUsers,
    allUsersLoading,
    offers,
    showConfetti,
    confettiKey,
    lastUpdateTime,
    activeTab,
    setActiveTab,
    userPurchaseLimit,
    purchasesRemaining,
    handleLogout,
    navigate,
    handleOfferSelection,
  } = useDashboard();

  // State for reward celebration
  const [showRewardCelebration, setShowRewardCelebration] = useState(false);
  const [completedReward, setCompletedReward] = useState<Reward | null>(null);

  // State for QR code modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRData, setSelectedQRData] = useState<QRData | null>(null);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
        <HeaderSkeleton />
        <div className="flex-1 px-6 pb-6">
          <div className="max-w-md mx-auto">
            <WelcomeCardSkeleton />
            <DashboardTabsSkeleton />
            <ProgressCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is null (will redirect to login)
  if (!user) return null;

  // Derived conditions for clarity
  const isProgressTab = activeTab === "progress";
  const isOffersTab = activeTab === "offers";
  const isCustomer = user.role === "customer";
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return (
      <AdminDashboard
        user={user}
        allUsers={allUsers}
        offers={offers}
        onLogout={handleLogout}
        onScan={() => navigate("/scan")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          key={confettiKey}
        />
      )}
      <Header
        title="Dashboard"
        onBack={() => navigate("/")}
        actions={
          <MenuBarActions
            user={user}
            handleLogout={handleLogout}
            navigate={navigate}
          />
        }
      />
      <div className="flex-1">
        <div className="max-w-md mx-auto">
          {/* Welcome Section (always visible) */}
          {/* <WelcomeCard user={user} lastUpdateTime={lastUpdateTime} /> */}

          {/* Tabs (moved below Welcome) */}
          <DashboardTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={user.role}
          />

          {/* Tabs Content */}
          {isOffersTab && isCustomer && (
            <div className="bg-gradient-to-br from-green-900/20 via-green-800/10 to-green-900/20 border border-green-700/30 rounded-xl p-6 shadow-2xl h-[720px] overflow-hidden">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-green-300 mb-2 flex items-center">
                  <Gift className="w-6 h-6 mr-2 text-green-400" />
                  Available Offers
                </h3>
                <p className="text-green-200/80 text-sm">
                  Choose an offer and start collecting stamps to earn rewards
                </p>
              </div>

              <div className="h-[580px] overflow-y-auto pr-2">
                {offers && offers.length > 0 ? (
                  <div className="grid gap-4">
                    {offers
                      .filter(offer => offer.isActive)
                      .map(offer => {
                        // Check if user has a completed but unredeemed reward for this offer
                        const completedUnredeemedReward =
                          user.completedRewards?.find(
                            reward =>
                              reward.offerSnapshot?.offerId === offer.offerId &&
                              reward.scanHistory?.length >=
                                reward.offerSnapshot?.stampRequirement &&
                              !reward.claimedAt
                          );

                        // Check if user has an active (in-progress) reward for this offer
                        const activeRewardForOffer =
                          user.completedRewards?.find(
                            reward =>
                              reward.offerSnapshot?.offerId === offer.offerId &&
                              reward.scanHistory?.length <
                                reward.offerSnapshot?.stampRequirement &&
                              !reward.claimedAt
                          );

                        return (
                          <div
                            key={offer.offerId}
                            className={`bg-gradient-to-br ${
                              activeRewardForOffer
                                ? "from-green-900/40 to-green-800/40 border-green-600/50 hover:from-green-900/50 hover:to-green-800/50"
                                : "from-gray-800/40 to-gray-700/40 border-gray-600/50 hover:from-gray-800/50 hover:to-gray-700/50"
                            } border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">
                                  {offer.name}
                                </h4>
                                <p className="text-gray-300 text-sm">
                                  {offer.description}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  activeRewardForOffer
                                    ? "bg-green-600/80 text-white border border-green-500/50 shadow-lg"
                                    : "bg-gray-600/80 text-gray-200 border border-gray-500/50"
                                }`}
                              >
                                {activeRewardForOffer ? "ACTIVE" : "AVAILABLE"}
                              </span>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">
                                  Required Stamps:
                                </span>
                                <span className="text-white font-medium">
                                  {offer.stampRequirement}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Reward:</span>
                                <span className="text-white font-medium">
                                  {offer.rewardDescription}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Type:</span>
                                <span className="text-white font-medium capitalize">
                                  {offer.rewardType}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center">
                              {activeRewardForOffer ? (
                                <button
                                  onClick={() => {
                                    // Generate QR code for this offer
                                    const qrData = {
                                      userId: user.id,
                                      userEmail: user.email,
                                      userName: user.name,
                                      offerId: offer.offerId,
                                      offerName: offer.name,
                                      stampsPerScan: offer.stampsPerScan || 1,
                                      timestamp: new Date().toISOString(),
                                    };

                                    // Open QR modal
                                    setSelectedQRData(qrData);
                                    setShowQRModal(true);
                                  }}
                                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                                >
                                  Continue Collecting
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Generate QR code for this offer
                                    const qrData = {
                                      userId: user.id,
                                      userEmail: user.email,
                                      userName: user.name,
                                      offerId: offer.offerId,
                                      offerName: offer.name,
                                      stampsPerScan: offer.stampsPerScan || 1,
                                      timestamp: new Date().toISOString(),
                                    };

                                    // Open QR modal
                                    setSelectedQRData(qrData);
                                    setShowQRModal(true);
                                  }}
                                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
                                >
                                  {completedUnredeemedReward
                                    ? "Start New Reward"
                                    : "Start Collecting"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <div className="text-gray-300 text-lg font-medium mb-2">
                      No active offers available
                    </div>
                    <div className="text-gray-500 text-sm">
                      Check back later for new offers
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isProgressTab && (
            <>
              {isCustomer ? (
                <div className="h-[720px] overflow-hidden">
                  <ProgressCard
                    user={user}
                    userPurchaseLimit={userPurchaseLimit}
                    settings={settings}
                    purchasesRemaining={purchasesRemaining}
                    onViewReward={() => navigate("/scan")}
                    currentOffer={offers?.find(
                      offer => offer.offerId === user.currentOfferId
                    )}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 border border-blue-700/30 rounded-xl p-6 shadow-2xl h-[720px] overflow-hidden">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-blue-300 mb-2 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-blue-400" />
                      User Progress Tracking
                    </h3>
                    <p className="text-blue-200/80 text-sm">
                      Real-time updates of all user loyalty progress
                    </p>
                  </div>
                  <div className="h-[580px] overflow-y-auto pr-2">
                    <UserList
                      users={allUsers.filter(u => u.role === "customer")}
                      loading={allUsersLoading}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "card" &&
            (user.role === "super_admin" ? (
              <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-900/20 border border-purple-700/30 rounded-xl p-6 shadow-2xl h-[720px] overflow-hidden">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2 flex items-center">
                    <User className="w-6 h-6 mr-2 text-purple-400" />
                    Rewards History
                  </h3>
                  <p className="text-purple-200/80 text-sm">
                    Complete overview of all user rewards and redemptions
                  </p>
                </div>
                <div className="h-[580px] overflow-y-auto pr-2">
                  <RewardsHistory allUsers={allUsers} />
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-900/20 border border-purple-700/30 rounded-xl p-6 shadow-2xl h-[720px] overflow-hidden">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2 flex items-center">
                    <User className="w-6 h-6 mr-2 text-purple-400" />
                    Your Rewards
                  </h3>
                  <p className="text-purple-200/80 text-sm">
                    Track your progress and manage your earned rewards
                  </p>
                </div>
                <div className="h-[580px] overflow-y-auto pr-2">
                  <LoyaltyCard user={user} offers={offers} />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Session Status Component */}
      {/* <SessionStatus /> */}

      {/* Reward Celebration Modal */}
      {showRewardCelebration && completedReward && (
        <RewardCelebration
          reward={completedReward}
          onClose={() => {
            setShowRewardCelebration(false);
            setCompletedReward(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedQRData && (
        <QRCodeModal
          qrData={selectedQRData}
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedQRData(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
