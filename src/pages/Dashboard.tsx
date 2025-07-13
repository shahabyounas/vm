import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth, PURCHASE_LIMIT, type User } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import QRCode from "@/components/QRCode";
import { ArrowLeft, Users, Crown, Shield } from "lucide-react";
import Confetti from "react-confetti";
import React from "react";

const CircularProgress = ({ value, max }: { value: number; max: number }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset: 0 }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#ef4444"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset: offset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </div>
  );
};

const UserList = ({ users, loading }: { users: User[]; loading: boolean }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "text-yellow-400";
      case "admin":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-400">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {users.map((user) => {
        const userPurchaseLimit = user.purchaseLimit || 5;
        const progress = Math.min(
          100,
          (user.purchases / userPurchaseLimit) * 100
        );

        return (
          <div
            key={user.id}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/80 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span
                    className={`text-sm font-medium ${getRoleColor(user.role)}`}
                  >
                    {(user.role || "").replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {user.lastScanAt
                    ? new Date(user.lastScanAt.toDate()).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">{user.name}</span>
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress:</span>
                <span className="text-white font-medium">
                  {user.purchases}/{userPurchaseLimit}
                </span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress >= 100 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{user.rewards?.length || 0} rewards claimed</span>
                <span>
                  {user.isRewardReady
                    ? "🎉 Ready!"
                    : `${userPurchaseLimit - user.purchases} to go`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const {
    user,
    loading,
    addPurchase,
    logout,
    settings,
    allUsers,
    allUsersLoading,
  } = useAuth();
  const navigate = useNavigate();
  const [showFirstConfetti, setShowFirstConfetti] = useState(false);
  const prevPurchasesRef = React.useRef<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "card">("progress");

  // Get user's purchase limit (individual or from settings)
  const userPurchaseLimit =
    user?.purchaseLimit || settings?.purchaseLimit || PURCHASE_LIMIT;

  useEffect(() => {
    // Only navigate if not loading and user is null
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Track when user data updates (real-time updates)
      setLastUpdateTime(new Date());

      // Show notification for real-time updates (but not for initial load)
      if (
        prevPurchasesRef.current !== null &&
        prevPurchasesRef.current !== user.purchases
      ) {
        const purchaseDiff = user.purchases - prevPurchasesRef.current;
        if (purchaseDiff > 0) {
          toast({
            title: "Purchase Updated! 📱",
            description: `Your purchase count was updated via QR scan. New total: ${user.purchases}/${userPurchaseLimit}`,
          });

          // Show confetti for QR scan updates
          setShowConfetti(true);
          setConfettiKey((k) => k + 1);
          setTimeout(() => setShowConfetti(false), 2500);

          // Navigate to rewards if reward is ready
          if (
            user.isRewardReady &&
            prevPurchasesRef.current < userPurchaseLimit
          ) {
            setTimeout(() => {
              toast({
                title: "Reward Unlocked! 🎉",
                description: "You've earned a reward! Check your rewards page.",
              });
              setTimeout(() => navigate("/rewards"), 1500);
            }, 1000);
          }
        }
      }

      if (prevPurchasesRef.current === 0 && user.purchases === 1) {
        setShowFirstConfetti(true);
        setTimeout(() => setShowFirstConfetti(false), 3000);
      }
      prevPurchasesRef.current = user.purchases;
    }
  }, [user?.purchases, user?.isRewardReady, navigate, userPurchaseLimit]);

  // Show loading state while auth is initializing
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

  // Don't render anything if user is null (will redirect to login)
  if (!user) return null;

  const purchasesRemaining = Math.max(0, userPurchaseLimit - user.purchases);

  const handleAddPurchase = () => {
    if (user.purchases >= userPurchaseLimit) return;
    addPurchase();
    setShowConfetti(true);
    setConfettiKey((k) => k + 1);
    setTimeout(() => setShowConfetti(false), 2500);
    if (user.purchases + 1 >= userPurchaseLimit) {
      toast({
        title: "Reward Unlocked! 🎉",
        description: "You've earned a reward! Check your rewards page.",
      });
      setTimeout(() => navigate("/rewards"), 1500);
    } else {
      toast({
        title: "Purchase Added!",
        description: `${
          userPurchaseLimit - 1 - user.purchases
        } more purchases until your next reward!`,
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "Thanks for visiting Vape Master!",
    });
    navigate("/");
  };

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

      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-red-900/30 sticky top-0 z-10">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="ml-4 text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            {(user.role === "admin" || user.role === "super_admin") && (
              <>
                <Button
                  onClick={() => navigate("/scan")}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                >
                  Scan
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  Settings
                </Button>
              </>
            )}
            {user.role === "super_admin" && (
              <Button
                onClick={() => navigate("/users")}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                Users
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 pb-6">
          <div className="max-w-md mx-auto">
            {/* Welcome Section (always visible) */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome, {user.name}!
              </h2>
              <p className="text-gray-400">Your loyalty card is ready to use</p>
              {lastUpdateTime && (
                <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Last updated: {lastUpdateTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Tabs (moved below Welcome) */}
            <div className="w-full flex justify-center mt-6">
              <div className="flex w-full max-w-md">
                {user.role === "customer" ? (
                  <>
                    <button
                      className={`w-1/2 px-6 py-5 font-semibold text-base transition-all duration-200 focus:outline-none border-b-2 border-r-0 border-l-0 border-t-0 rounded-none ${
                        activeTab === "progress"
                          ? "bg-gray-900/80 border-red-500 text-red-400"
                          : "bg-gray-800/60 border-transparent text-gray-400 hover:text-red-300"
                      }`}
                      onClick={() => setActiveTab("progress")}
                    >
                      Progress
                    </button>
                    <button
                      className={`w-1/2 px-6 py-5 font-semibold text-base transition-all duration-200 focus:outline-none border-b-2 border-r-0 border-l-0 border-t-0 rounded-none ${
                        activeTab === "card"
                          ? "bg-gray-900/80 border-red-500 text-red-400"
                          : "bg-gray-800/60 border-transparent text-gray-400 hover:text-red-300"
                      }`}
                      onClick={() => setActiveTab("card")}
                    >
                      Loyalty Card
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`w-1/2 px-6 py-5 font-semibold text-base transition-all duration-200 focus:outline-none border-b-2 border-r-0 border-l-0 border-t-0 rounded-none ${
                        activeTab === "progress"
                          ? "bg-gray-900/80 border-red-500 text-red-400"
                          : "bg-gray-800/60 border-transparent text-gray-400 hover:text-red-300"
                      }`}
                      onClick={() => setActiveTab("progress")}
                    >
                      Users
                    </button>
                    <button
                      className={`w-1/2 px-6 py-5 font-semibold text-base transition-all duration-200 focus:outline-none border-b-2 border-r-0 border-l-0 border-t-0 rounded-none ${
                        activeTab === "card"
                          ? "bg-gray-900/80 border-red-500 text-red-400"
                          : "bg-gray-800/60 border-transparent text-gray-400 hover:text-red-300"
                      }`}
                      onClick={() => setActiveTab("card")}
                    >
                      Loyalty Card
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs Content */}
            {activeTab === "progress" && (
              <>
                {user.role === "customer" ? (
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
                          <CircularProgress
                            value={user.purchases}
                            max={userPurchaseLimit}
                          />
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
                        <p className="text-gray-400 text-sm max-w-xs">
                          {user.purchases >= userPurchaseLimit
                            ? "🎉 You've earned a reward! Check your rewards page."
                            : settings?.descriptionMessage ||
                              `Complete ${purchasesRemaining} more purchase${
                                purchasesRemaining === 1 ? "" : "s"
                              } to unlock your reward.`}
                        </p>

                        {user.isRewardReady && (
                          <Button
                            onClick={() => navigate("/rewards")}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            View Reward 🎉
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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
                    <UserList users={allUsers} loading={allUsersLoading} />
                  </div>
                )}
              </>
            )}

            {activeTab === "card" && (
              <div className="bg-gradient-to-br from-gray-900/90 via-black/80 to-red-950/90 border border-red-900/40 rounded-none p-10 min-h-[460px] flex flex-col justify-center -mt-0 shadow-2xl">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Your Loyalty Card
                  </h3>
                  <div className="flex justify-center mb-6">
                    <QRCode
                      value={`LOYALTY:${user.email}:${user.id}`}
                      size={200}
                    />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Show this QR code to staff to earn loyalty points
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
