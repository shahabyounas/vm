import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_PURCHASE_LIMIT } from "@/constants";

export function useDashboard() {
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
  const prevPurchasesRef = useRef<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "card">("progress");

  // Get user's purchase limit (individual or from settings)
  const userPurchaseLimit =
    user?.purchaseLimit || settings?.purchaseLimit || DEFAULT_PURCHASE_LIMIT;

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

  const purchasesRemaining = Math.max(0, userPurchaseLimit - (user?.purchases || 0));

  const handleAddPurchase = () => {
    if (!user || user.purchases >= userPurchaseLimit) return;
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
        description: `${userPurchaseLimit - 1 - user.purchases} more purchases until your next reward!`,
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

  return {
    user,
    loading,
    addPurchase,
    logout,
    settings,
    allUsers,
    allUsersLoading,
    navigate,
    showFirstConfetti,
    showConfetti,
    confettiKey,
    lastUpdateTime,
    activeTab,
    setActiveTab,
    userPurchaseLimit,
    purchasesRemaining,
    handleAddPurchase,
    handleLogout,
  };
} 