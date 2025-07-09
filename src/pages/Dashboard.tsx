import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import QRCode from "@/components/QRCode";
import { ArrowLeft } from "lucide-react";
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
      <div className="relative group w-28 h-28">
        <svg width={radius * 2} height={radius * 2} className="block">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#18181b"
            strokeWidth={stroke}
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-in-out"
            style={{ filter: "drop-shadow(0 0 8px #ef4444cc)" }}
          />
        </svg>
        <div className="absolute inset-0 rounded-full group-hover:scale-105 group-hover:shadow-[0_0_16px_4px_#ef4444cc] transition-transform transition-shadow duration-300" />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, addPurchase, logout } = useAuth();
  const navigate = useNavigate();
  const [showFirstConfetti, setShowFirstConfetti] = useState(false);
  const prevPurchasesRef = React.useRef<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "card">("progress");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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
            description: `Your purchase count was updated via QR scan. New total: ${user.purchases}/5`,
          });

          // Show confetti for QR scan updates
          setShowConfetti(true);
          setConfettiKey((k) => k + 1);
          setTimeout(() => setShowConfetti(false), 2500);

          // Navigate to rewards if reward is ready
          if (user.isRewardReady && prevPurchasesRef.current < 5) {
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
  }, [user?.purchases, user?.isRewardReady, navigate]);

  if (!user) return null;

  const progressPercentage = (user.purchases / 5) * 100;
  const purchasesRemaining = Math.max(0, 5 - user.purchases);

  const handleAddPurchase = () => {
    if (user.purchases >= 5) return;
    addPurchase();
    setShowConfetti(true);
    setConfettiKey((k) => k + 1);
    setTimeout(() => setShowConfetti(false), 2500);
    if (user.purchases + 1 >= 5) {
      toast({
        title: "Reward Unlocked! 🎉",
        description: "You've earned a reward! Check your rewards page.",
      });
      setTimeout(() => navigate("/rewards"), 1500);
    } else {
      toast({
        title: "Purchase Added!",
        description: `${
          4 - user.purchases
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
      {showFirstConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={250}
          recycle={false}
          colors={["#ef4444", "#fff"]}
          style={{ position: "fixed", left: 0, top: 0, zIndex: 50 }}
        />
      )}
      {showConfetti && (
        <Confetti
          key={confettiKey}
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={250}
          recycle={false}
          colors={["#ef4444", "#fff", "#facc15", "#22d3ee", "#a3e635"]}
          style={{ position: "fixed", left: 0, top: 0, zIndex: 50 }}
        />
      )}
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-red-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
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
            {user.email === "admin@vpmaster.com" && (
              <Button
                onClick={() => navigate("/scan")}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
              >
                Scan
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
                <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Last updated: {lastUpdateTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Tabs (moved below Welcome) */}
            <div className="w-full flex justify-center mt-6">
              <div className="flex w-full max-w-md">
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
              </div>
            </div>

            {/* Tabs Content */}
            {activeTab === "progress" && (
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
                      <CircularProgress value={user.purchases} max={5} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl mb-5 mr-3 font-extrabold text-white drop-shadow-[0_2px_8px_#000a] animate-pulse">
                          {user.purchases}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col items-center">
                      <span className="text-base text-gray-300 font-semibold tracking-wide">
                        of 5 Purchases
                      </span>
                    </div>
                  </div>
                  {purchasesRemaining > 0 ? (
                    <p className="text-pink-200 text-lg text-center animate-fadeIn">
                      <span className="font-semibold text-white">
                        {purchasesRemaining}
                      </span>{" "}
                      more purchase{purchasesRemaining !== 1 ? "s" : ""} until
                      your next reward!
                    </p>
                  ) : (
                    <p className="text-red-400 font-bold text-lg text-center animate-fadeIn">
                      <span className="text-2xl">🎉</span> Reward Ready! Visit
                      the rewards page.
                    </p>
                  )}
                  <div className="mt-8 flex justify-center gap-2 animate-fadeIn">
                    <span className="inline-block w-2 h-2 bg-gradient-to-br from-red-400 via-pink-400 to-purple-500 rounded-full animate-pulse" />
                    <span className="inline-block w-2 h-2 bg-gradient-to-br from-blue-400 via-cyan-400 to-purple-500 rounded-full animate-pulse delay-1000" />
                    <span className="inline-block w-2 h-2 bg-gradient-to-br from-yellow-400 via-pink-400 to-red-500 rounded-full animate-pulse delay-2000" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "card" && (
              <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-none p-10 min-h-[460px] flex flex-col justify-center -mt-0">
                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                  Your Loyalty Card
                </h3>
                <QRCode value={`LOYALTY:${user.email}:${user.id}`} size={200} />
                <p className="text-gray-400 text-sm text-center mt-4">
                  Show this QR code at checkout
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {user.isRewardReady && (
              <div className="space-y-4">
                <Link to="/rewards" className="block">
                  <Button
                    variant="outline"
                    className="w-full py-4 text-lg font-semibold border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    View Reward 🎁
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
