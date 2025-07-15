import { useDashboard } from "@/hooks/useDashboard";
import Confetti from "react-confetti";
import Header from "@/components/Header";
import RewardsHistory from "./RewardsHistory";
import UserList from "@/components/UserList";
import DashboardTabs from "@/components/DashboardTabs";
import ProgressCard from "@/components/ProgressCard";
import LoyaltyCard from "@/components/LoyaltyCard";
import Loader from "@/components/Loader";
import MenuBarActions from "@/components/MenuBarActions";
import WelcomeCard from "@/components/WelcomeCard";

const Dashboard = () => {
  // Only destructure from useDashboard what is actually used in Dashboard.tsx
  const {
    user,
    loading,
    settings,
    allUsers,
    allUsersLoading,
    showConfetti,
    confettiKey,
    lastUpdateTime,
    activeTab,
    setActiveTab,
    userPurchaseLimit,
    purchasesRemaining,
    handleLogout,
    navigate,
  } = useDashboard();

  // Derived conditions for clarity
  const isProgressTab = activeTab === "progress";
  const isCustomer = user.role === "customer";

  // Show loading state while auth is initializing
  if (loading) {
    return <Loader />;
  }

  // Don't render anything if user is null (will redirect to login)
  if (!user) return null;

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
          {isProgressTab && (
            <>
              {isCustomer ? (
                <ProgressCard
                  user={user}
                  userPurchaseLimit={userPurchaseLimit}
                  settings={settings}
                  purchasesRemaining={purchasesRemaining}
                  onViewReward={() => navigate("/rewards")}
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
                    users={allUsers.filter((u) => u.role === "customer")}
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
              <LoyaltyCard user={user} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
