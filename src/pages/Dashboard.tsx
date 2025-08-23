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
      <div className="flex-1 px-6 pb-6">
        <div className="max-w-md mx-auto">
          {/* Welcome Section (always visible) */}
          <WelcomeCard user={user} lastUpdateTime={lastUpdateTime} />

          {/* Tabs (moved below Welcome) */}
          <DashboardTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={user.role}
          />

          {/* Tabs Content */}
          {isOffersTab && isCustomer && (
            <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Available Offers
                </h3>
                <p className="text-gray-400 text-sm">
                  Choose an offer and start collecting stamps
                </p>
              </div>

              {offers && offers.length > 0 ? (
                <div className="grid gap-4">
                  {offers
                    .filter(offer => offer.isActive)
                    .map(offer => {
                      const isCurrentOffer =
                        user.currentOfferId === offer.offerId;
                      const progress = isCurrentOffer
                        ? user.currentOfferProgress || 0
                        : 0;
                      const progressPercentage = Math.min(
                        (progress / offer.stampRequirement) * 100,
                        100
                      );

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
                      const activeRewardForOffer = user.completedRewards?.find(
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
                            isCurrentOffer
                              ? "from-green-900/40 to-green-800/40 border-green-700/50"
                              : "from-gray-800/40 to-gray-700/40 border-gray-600/50"
                          } border rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]`}
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
                                isCurrentOffer
                                  ? "bg-green-900/50 text-green-300 border border-green-700/50"
                                  : "bg-gray-900/50 text-gray-300 border border-gray-600/50"
                              }`}
                            >
                              {isCurrentOffer ? "ACTIVE" : "AVAILABLE"}
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

                          {/* Progress Bar for Current Offer */}
                          {isCurrentOffer && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-400">Progress:</span>
                                <span className="text-white font-medium">
                                  {progress} / {offer.stampRequirement} stamps
                                </span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}

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
                                    timestamp: new Date().toISOString(),
                                  };

                                  // Open QR modal
                                  setSelectedQRData(qrData);
                                  setShowQRModal(true);
                                }}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
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
                                    timestamp: new Date().toISOString(),
                                  };

                                  // Open QR modal
                                  setSelectedQRData(qrData);
                                  setShowQRModal(true);
                                }}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
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
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    No active offers available
                  </div>
                  <div className="text-gray-500 text-sm">
                    Check back later for new offers
                  </div>
                </div>
              )}
            </div>
          )}

          {isProgressTab && (
            <>
              {isCustomer ? (
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
              ) : (
                <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-6 min-h-[460px] -mt-0 shadow-2xl">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      User Progress Tracking
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Real-time updates of all user loyalty progress
                    </p>
                  </div>
                  <UserList
                    users={allUsers.filter(u => u.role === "customer")}
                    loading={allUsersLoading}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "card" &&
            (user.role === "super_admin" ? (
              <RewardsHistory allUsers={allUsers} />
            ) : (
              <LoyaltyCard user={user} offers={offers} />
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
