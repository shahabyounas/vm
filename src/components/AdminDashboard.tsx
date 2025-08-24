import React, { useState, useEffect } from "react";
import { User, Offer } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import {
  Users,
  Gift,
  Settings,
  BarChart3,
  TrendingUp,
  Target,
  Menu,
  X,
  QrCode,
  LogOut,
  Home,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useNavigate } from "react-router-dom";
import { fetchAllOffers } from "@/db/offers";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/utils";
import {
  OverviewTab,
  UsersTab,
  OffersTab,
  RewardsTab,
  AnalyticsTab,
  SettingsTab,
} from "./admin";

interface AdminDashboardProps {
  user: User;
  allUsers: User[];
  offers: Offer[];
  onLogout: () => void;
  onScan: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  allUsers,
  offers: initialOffers,
  onLogout,
  onScan,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "offers" | "rewards" | "analytics" | "settings"
  >(() => {
    // Get active tab from localStorage or default to overview
    const savedTab = localStorage.getItem("adminActiveTab");
    return (savedTab as typeof activeTab) || "overview";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "customer" | "admin" | "super_admin"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const navigate = useNavigate();

  // Initialize offers state
  useEffect(() => {
    setOffers(initialOffers);
  }, [initialOffers]);

  // Real-time offers listener
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      const offersRef = collection(db, "offers");
      const offersQuery = query(offersRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        offersQuery,
        snapshot => {
          const updatedOffers: Offer[] = [];
          snapshot.forEach(doc => {
            updatedOffers.push({ ...doc.data(), offerId: doc.id } as Offer);
          });
          setOffers(updatedOffers);
        },
        error => {
          console.error("Error listening to offers:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [user?.role]);

  // Refresh offers list
  const refreshOffers = async () => {
    try {
      const updatedOffers = await fetchAllOffers();
      setOffers(updatedOffers);
      console.log(
        "Offers refreshed successfully. New offers count:",
        updatedOffers.length
      );
    } catch (error) {
      console.error("Failed to refresh offers:", error);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        user.lastScanAt &&
        new Date().getTime() - user.lastScanAt.toDate().getTime() <
          7 * 24 * 60 * 60 * 1000) ||
      (statusFilter === "inactive" &&
        (!user.lastScanAt ||
          new Date().getTime() - user.lastScanAt.toDate().getTime() >=
            7 * 24 * 60 * 60 * 1000));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calculate statistics
  const totalUsers = allUsers.length;
  const customers = allUsers.filter(u => u.role === "customer");
  const activeUsers = customers.filter(
    u =>
      u.lastScanAt &&
      new Date().getTime() - u.lastScanAt.toDate().getTime() <
        7 * 24 * 60 * 60 * 1000
  ).length;
  const totalRewards = customers.reduce(
    (sum, u) => sum + (u.completedRewards?.length || 0),
    0
  );
  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => o.isActive).length;

  useEffect(() => {
    trackEvent("admin_dashboard_view", { tab: activeTab, user_id: user.id });
  }, [activeTab, user.id]);

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      color: "text-blue-400",
    },
    { id: "users", label: "Users", icon: Users, color: "text-green-400" },
    { id: "offers", label: "Offers", icon: Gift, color: "text-purple-400" },
    { id: "rewards", label: "Rewards", icon: Target, color: "text-yellow-400" },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      color: "text-indigo-400",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-red-400",
    },
  ];

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    // Save active tab to localStorage for persistence across refreshes
    localStorage.setItem("adminActiveTab", tab);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-red-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-red-800/30">
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-red-300 text-sm">Vape Master</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-red-800/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-white font-medium">{user.name}</div>
                <div className="text-gray-400 text-sm capitalize">
                  {user.role.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as typeof activeTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${activeTab === item.id ? "text-white" : item.color}`}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="p-4 space-y-3 border-t border-red-800/30">
            <Button
              onClick={onScan}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full border-red-600 text-red-300 hover:bg-red-700/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-900/80 to-black/80 backdrop-blur-sm border-b border-red-800/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-red-300 text-sm">
                  {activeTab === "overview" &&
                    "System overview and key metrics"}
                  {activeTab === "users" && "Manage users and permissions"}
                  {activeTab === "offers" && "Create and manage loyalty offers"}
                  {activeTab === "rewards" && "Track rewards and redemptions"}
                  {activeTab === "analytics" &&
                    "Performance insights and reports"}
                  {activeTab === "settings" &&
                    "System configuration and preferences"}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-white font-semibold">{totalUsers}</div>
                <div className="text-gray-400">Users</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{totalOffers}</div>
                <div className="text-gray-400">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">{totalRewards}</div>
                <div className="text-gray-400">Rewards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab
              totalUsers={totalUsers}
              customers={customers}
              activeUsers={activeUsers}
              totalRewards={totalRewards}
              totalOffers={totalOffers}
              activeOffers={activeOffers}
              recentUsers={allUsers.slice(0, 5)}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
          )}

          {activeTab === "offers" && (
            <OffersTab
              offers={offers}
              userRole={user.role}
              onOfferCreated={refreshOffers}
              currentUser={user}
            />
          )}

          {activeTab === "rewards" && <RewardsTab allUsers={allUsers} />}

          {activeTab === "analytics" && (
            <AnalyticsTab allUsers={allUsers} offers={offers} />
          )}

          {activeTab === "settings" && <SettingsTab user={user} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
