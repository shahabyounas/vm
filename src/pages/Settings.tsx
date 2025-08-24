import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { User, Offer, Reward } from "@/hooks/auth.types";
import {
  ArrowLeft,
  Save,
  Settings as SettingsIcon,
  Gift,
  Users,
  BarChart3,
  History,
  Eye,
  TrendingUp,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Timestamp } from "firebase/firestore";
import {
  fetchAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  createDefaultOffer,
} from "@/db/adapter";

const Settings = () => {
  const { user, loading, allUsers } = useAuth();
  const navigate = useNavigate();

  // Offer management state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Admin panel navigation
  const [activeTab, setActiveTab] = useState<
    "offers" | "rewards" | "analytics" | "users"
  >("offers");

  useEffect(() => {
    trackEvent("page_view", { page: "Settings" });
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Load offers
  useEffect(() => {
    const loadOffers = async () => {
      try {
        setOffersLoading(true);
        const fetchedOffers = await fetchAllOffers();

        if (fetchedOffers.length === 0) {
          // Create default offer if none exist
          await createDefaultOffer(user!);
          const defaultOffers = await fetchAllOffers();
          setOffers(defaultOffers);
        } else {
          setOffers(fetchedOffers);
        }
      } catch (error) {
        console.error("Error loading offers:", error);
        // Try to create default offer on error
        try {
          await createDefaultOffer(user!);
          const defaultOffers = await fetchAllOffers();
          setOffers(defaultOffers);
        } catch (defaultError) {
          console.error("Error creating default offer:", defaultError);
        }
      } finally {
        setOffersLoading(false);
      }
    };

    if (user) {
      loadOffers();
    }
  }, [user]);

  // Show loading state while auth is initializing
  if (loading || offersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!user || (user.role !== "admin" && user.role !== "super_admin"))
    return null;

  const handleResetAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL data? This cannot be undone!"
      )
    )
      return;
    setResetting(true);
    try {
      toast({
        title: "All Data Reset",
        description: "All user data has been deleted.",
        variant: "destructive",
      });
      trackEvent("reset_all_data", { user_id: user.id });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error?.message || "Failed to reset all data.",
        variant: "destructive",
      });
      trackEvent("reset_all_data_failed", {
        user_id: user.id,
        error: error?.message,
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-red-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-red-900/30 sticky top-0 z-10">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="ml-4 text-2xl font-bold text-white">Settings</h1>
            </div>
            <div className="flex items-center text-gray-400">
              <SettingsIcon className="w-6 h-6 mr-2" />
              <span className="text-sm">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="w-full max-w-6xl mx-auto">
            {/* Admin Navigation Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("offers")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "offers"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Gift className="w-4 h-4 mr-2" />
                Manage Offers
              </button>
              <button
                onClick={() => setActiveTab("rewards")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "rewards"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Gift className="w-4 h-4 mr-2" />
                Rewards History
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "analytics"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "users"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                User Management
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "offers" && (
              <OffersManagementTab
                offers={offers}
                onOffersChange={setOffers}
                user={user}
              />
            )}

            {/* Rewards History Tab */}
            {activeTab === "rewards" && (
              <RewardsHistoryTab allUsers={allUsers} />
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && <AnalyticsTab allUsers={allUsers} />}

            {/* User Management Tab */}
            {activeTab === "users" && <UserManagementTab allUsers={allUsers} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OffersManagementTab: React.FC<{
  offers: Offer[];
  onOffersChange: (offers: Offer[]) => void;
  user: User;
}> = ({ offers, onOffersChange, user }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [offerName, setOfferName] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [stampRequirement, setStampRequirement] = useState(5);
  const [rewardType, setRewardType] = useState("percentage");
  const [rewardValue, setRewardValue] = useState("20");
  const [rewardDescription, setRewardDescription] = useState("20% OFF");

  const handleCreateOffer = async () => {
    if (
      !offerName.trim() ||
      !offerDescription.trim() ||
      !rewardValue.trim() ||
      !rewardDescription.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create offer using database function
      await createOffer(user!, {
        name: offerName.trim(),
        description: offerDescription.trim(),
        stampRequirement,
        stampsPerScan: 1, // Default to 1 stamp per scan
        rewardType,
        rewardValue: rewardValue.trim(),
        rewardDescription: rewardDescription.trim(),
        isActive: true,
      });

      // Refresh offers list
      const updatedOffers = await fetchAllOffers();
      onOffersChange(updatedOffers);

      setShowCreateForm(false);
      setOfferName("");
      setOfferDescription("");
      setStampRequirement(5);
      setRewardType("percentage");
      setRewardValue("20");
      setRewardDescription("20% OFF");

      toast({
        title: "Offer Created",
        description: "New offer has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Manage Offers</h2>
        <p className="text-gray-400">
          Create and manage loyalty program offers for customers
        </p>
      </div>

      {/* Create New Offer Button */}
      <div className="mb-8 text-center">
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Gift className="w-4 h-4 mr-2" />
          Create New Offer
        </Button>
      </div>

      {/* Create Offer Form */}
      {showCreateForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Create New Offer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="offerName" className="text-white font-medium">
                  Offer Name
                </Label>
                <Input
                  id="offerName"
                  value={offerName}
                  onChange={e => setOfferName(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  placeholder="e.g., Welcome Offer, Summer Special"
                />
              </div>
              <div>
                <Label
                  htmlFor="offerDescription"
                  className="text-white font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="offerDescription"
                  value={offerDescription}
                  onChange={e => setOfferDescription(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  placeholder="Describe what customers need to do to earn this reward"
                />
              </div>
              <div>
                <Label
                  htmlFor="stampRequirement"
                  className="text-white font-medium"
                >
                  Stamps Required
                </Label>
                <Input
                  id="stampRequirement"
                  type="number"
                  min="1"
                  max="50"
                  value={stampRequirement}
                  onChange={e =>
                    setStampRequirement(parseInt(e.target.value) || 1)
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rewardType" className="text-white font-medium">
                  Reward Type
                </Label>
                <select
                  id="rewardType"
                  value={rewardType}
                  onChange={e => setRewardType(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 mt-1"
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed_amount">Fixed Amount Off</option>
                  <option value="free_item">Free Item</option>
                </select>
              </div>
              <div>
                <Label htmlFor="rewardValue" className="text-white font-medium">
                  Reward Value
                </Label>
                <Input
                  id="rewardValue"
                  value={rewardValue}
                  onChange={e => setRewardValue(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  placeholder={
                    rewardType === "percentage"
                      ? "20"
                      : rewardType === "fixed_amount"
                        ? "5.00"
                        : "Free Coffee"
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="rewardDescription"
                  className="text-white font-medium"
                >
                  Reward Description
                </Label>
                <Input
                  id="rewardDescription"
                  value={rewardDescription}
                  onChange={e => setRewardDescription(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  placeholder={
                    rewardType === "percentage"
                      ? "20% OFF"
                      : rewardType === "fixed_amount"
                        ? "$5.00 OFF"
                        : "Free Coffee"
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOffer}
              disabled={isCreating}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Offer"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Current Offers */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Current Offers</h3>
        {offers.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold text-white mb-2">
              No Offers Yet
            </h4>
            <p className="text-gray-400">
              Create your first offer to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map(offer => (
              <div
                key={offer.offerId}
                className={`bg-gradient-to-br ${
                  offer.isActive
                    ? "from-green-900/40 to-green-800/40 border-green-700/50"
                    : "from-gray-800/40 to-gray-700/40 border-gray-600/50"
                } border rounded-xl p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">
                    {offer.name}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      offer.isActive
                        ? "bg-green-900/50 text-green-300 border border-green-700/50"
                        : "bg-gray-900/50 text-gray-300 border border-gray-600/50"
                    }`}
                  >
                    {offer.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  {offer.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stamps:</span>
                    <span className="text-white">{offer.stampRequirement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reward:</span>
                    <span className="text-white">
                      {offer.rewardDescription}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">
                      {offer.rewardType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RewardsHistoryTab: React.FC<{ allUsers: User[] }> = ({ allUsers }) => {
  // Helper function to safely get stamp requirement
  const getStampRequirement = (
    reward: Reward & { userName: string; userEmail: string; userId: string }
  ) => {
    if (reward.offerSnapshot?.stampRequirement) {
      return reward.offerSnapshot.stampRequirement;
    }
    // Fallback for old rewards that might not have offerSnapshot
    const legacyReward = reward as Reward & {
      settingsSnapshot?: { purchaseLimit: number };
    };
    if (legacyReward.settingsSnapshot?.purchaseLimit) {
      return legacyReward.settingsSnapshot.purchaseLimit;
    }
    return "Unknown";
  };

  // Extract all rewards from all users
  const allRewards = allUsers.flatMap(user =>
    (user.completedRewards || []).map(reward => ({
      ...reward,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
    }))
  );

  // Group rewards by status
  const activeRewards = allRewards.filter(r => !r.claimedAt);
  const claimedRewards = allRewards.filter(r => r.claimedAt);
  const expiredRewards = allRewards.filter(r => {
    if (!r.expiresAt) return false;
    return new Date() > r.expiresAt.toDate();
  });

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Rewards History & Status
        </h2>
        <p className="text-gray-400">Monitor all rewards across the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {allRewards.length}
          </div>
          <div className="text-blue-300 text-sm">Total Rewards</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {activeRewards.length}
          </div>
          <div className="text-green-300 text-sm">Active Rewards</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {claimedRewards.length}
          </div>
          <div className="text-yellow-300 text-sm">Claimed Rewards</div>
        </div>
        <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {expiredRewards.length}
          </div>
          <div className="text-red-300 text-sm">Expired Rewards</div>
        </div>
      </div>

      {/* Active Rewards */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-green-400" />
          Active Rewards ({activeRewards.length})
        </h3>
        {activeRewards.length === 0 ? (
          <div className="text-center py-8 bg-gray-800/30 rounded-xl">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-400">No active rewards at the moment</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeRewards.map(reward => (
              <div
                key={reward.rewardId}
                className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-700/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold text-white">
                    {reward.rewardDescription}
                  </div>
                  <div className="text-xs text-green-300 bg-green-900/50 px-2 py-1 rounded-full">
                    ACTIVE
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">User:</span>
                    <span className="text-white">{reward.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">
                      {reward.rewardType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">{reward.rewardValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goal:</span>
                    <span className="text-white">
                      {getStampRequirement(reward)} purchases
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Earned:</span>
                    <span className="text-white">
                      {reward.createdAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claimed Rewards */}
      {claimedRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-yellow-400" />
            Claimed Rewards ({claimedRewards.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {claimedRewards.slice(0, 6).map(reward => (
              <div
                key={reward.rewardId}
                className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-700/50 rounded-xl p-4 opacity-75"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold text-white">
                    {reward.rewardDescription}
                  </div>
                  <div className="text-xs text-yellow-300 bg-yellow-900/50 px-2 py-1 rounded-full">
                    CLAIMED
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">User:</span>
                    <span className="text-white">{reward.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Claimed:</span>
                    <span className="text-white">
                      {reward.claimedAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">
                      {reward.rewardType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {claimedRewards.length > 6 && (
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Showing 6 of {claimedRewards.length} claimed rewards
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AnalyticsTab: React.FC<{ allUsers: User[] }> = ({ allUsers }) => {
  const customers = allUsers.filter(u => u.role === "customer");
  const totalRewards = customers.reduce(
    (sum, user) => sum + (user.completedRewards?.length || 0),
    0
  );
  const activeUsers = customers.filter(
    u =>
      u.lastScanAt &&
      new Date().getTime() - u.lastScanAt.toDate().getTime() <
        7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">System Analytics</h2>
        <p className="text-gray-400">Overview of loyalty program performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {customers.length}
          </div>
          <div className="text-blue-300 text-lg">Total Customers</div>
          <div className="text-blue-400 text-sm mt-2">
            Active loyalty members
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">
            {totalRewards}
          </div>
          <div className="text-green-300 text-lg">Total Rewards</div>
          <div className="text-green-400 text-sm mt-2">Earned by customers</div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-purple-400 mb-2">
            {activeUsers}
          </div>
          <div className="text-purple-300 text-lg">Active Users</div>
          <div className="text-purple-400 text-sm mt-2">Last 7 days</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {customers.slice(0, 5).map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {user.purchases} purchases
                </div>
                <div className="text-gray-400 text-sm">
                  {user.lastScanAt
                    ? user.lastScanAt.toDate().toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UserManagementTab: React.FC<{ allUsers: User[] }> = ({ allUsers }) => {
  const customers = allUsers.filter(u => u.role === "customer");
  const admins = allUsers.filter(
    u => u.role === "admin" || u.role === "super_admin"
  );

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
        <p className="text-gray-400">Overview of all system users</p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {allUsers.length}
          </div>
          <div className="text-blue-300 text-lg">Total Users</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">
            {customers.length}
          </div>
          <div className="text-green-300 text-lg">Customers</div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-purple-400 mb-2">
            {admins.length}
          </div>
          <div className="text-purple-300 text-lg">Administrators</div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-400" />
          Customer Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-gray-300">Name</th>
                <th className="text-left p-3 text-gray-300">Email</th>
                <th className="text-left p-3 text-gray-300">Purchases</th>
                <th className="text-left p-3 text-gray-300">Rewards</th>
                <th className="text-left p-3 text-gray-300">Last Scan</th>
                <th className="text-left p-3 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 10).map(user => (
                <tr
                  key={user.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="p-3 text-white">{user.name}</td>
                  <td className="p-3 text-gray-300">{user.email}</td>
                  <td className="p-3 text-white">{user.purchases}</td>
                  <td className="p-3 text-white">
                    {user.completedRewards?.length || 0}
                  </td>
                  <td className="p-3 text-gray-300">
                    {user.lastScanAt
                      ? user.lastScanAt.toDate().toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.lastScanAt &&
                        new Date().getTime() -
                          user.lastScanAt.toDate().getTime() <
                          7 * 24 * 60 * 60 * 1000
                          ? "bg-green-900/50 text-green-300 border border-green-700/50"
                          : "bg-gray-900/50 text-gray-300 border border-gray-700/50"
                      }`}
                    >
                      {user.lastScanAt &&
                      new Date().getTime() -
                        user.lastScanAt.toDate().getTime() <
                        7 * 24 * 60 * 60 * 1000
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length > 10 && (
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Showing 10 of {customers.length} customers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
