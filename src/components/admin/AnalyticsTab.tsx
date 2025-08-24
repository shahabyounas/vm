import React, { useMemo } from "react";
import { User, Offer, Reward } from "@/hooks/auth.types";
import {
  TrendingUp,
  Users,
  Gift,
  Target,
  Clock,
  DollarSign,
  Activity,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface AnalyticsTabProps {
  allUsers: User[];
  offers: Offer[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ allUsers, offers }) => {
  // Calculate comprehensive business metrics
  const metrics = useMemo(() => {
    const customers = allUsers.filter(u => u.role === "customer");
    const admins = allUsers.filter(
      u => u.role === "admin" || u.role === "super_admin"
    );

    // Customer metrics
    const totalCustomers = customers.length;
    const newCustomersThisMonth = customers.filter(u => {
      const createdAt = u.createdAt?.toDate();
      if (!createdAt) return false;
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;

    // Activity metrics
    const activeUsers = customers.filter(
      u =>
        u.lastScanAt &&
        new Date().getTime() - u.lastScanAt.toDate().getTime() <
          7 * 24 * 60 * 60 * 1000
    ).length;

    const veryActiveUsers = customers.filter(
      u =>
        u.lastScanAt &&
        new Date().getTime() - u.lastScanAt.toDate().getTime() <
          24 * 60 * 60 * 1000
    ).length;

    // Reward metrics
    const allRewards = customers.flatMap(u => u.completedRewards || []);
    const totalRewards = allRewards.length;
    const claimedRewards = allRewards.filter(r => r.claimedAt).length;
    const activeRewards = totalRewards - claimedRewards;
    const rewardRedemptionRate =
      totalRewards > 0 ? ((claimedRewards / totalRewards) * 100).toFixed(1) : 0;

    // Offer performance
    const activeOffers = offers.filter(o => o.isActive).length;
    const offerUtilization =
      offers.length > 0 ? ((activeOffers / offers.length) * 100).toFixed(1) : 0;

    // Engagement metrics
    const totalStampsCollected = allRewards.reduce(
      (sum, r) => sum + (r.scanHistory?.length || 0),
      0
    );
    const averageStampsPerCustomer =
      totalCustomers > 0
        ? (totalStampsCollected / totalCustomers).toFixed(1)
        : 0;

    // Time-based metrics
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rewardsThisMonth = allRewards.filter(r => {
      const createdAt = r.createdAt?.toDate();
      if (!createdAt) return false;
      return createdAt >= thisMonth;
    }).length;

    const rewardsLastMonth = allRewards.filter(r => {
      const createdAt = r.createdAt?.toDate();
      if (!createdAt) return false;
      return createdAt >= lastMonth && createdAt < thisMonth;
    }).length;

    const monthOverMonthGrowth =
      rewardsLastMonth > 0
        ? (
            ((rewardsThisMonth - rewardsLastMonth) / rewardsLastMonth) *
            100
          ).toFixed(1)
        : rewardsThisMonth > 0
          ? 100
          : 0;

    return {
      customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
      activity: { active: activeUsers, veryActive: veryActiveUsers },
      rewards: {
        total: totalRewards,
        claimed: claimedRewards,
        active: activeRewards,
        redemptionRate: parseFloat(rewardRedemptionRate),
      },
      offers: {
        total: offers.length,
        active: activeOffers,
        utilization: parseFloat(offerUtilization),
      },
      engagement: {
        totalStamps: totalStampsCollected,
        avgPerCustomer: parseFloat(averageStampsPerCustomer),
      },
      growth: {
        thisMonth: rewardsThisMonth,
        lastMonth: rewardsLastMonth,
        monthOverMonth: parseFloat(monthOverMonthGrowth),
      },
    };
  }, [allUsers, offers]);

  // Top performing offers
  const topOffers = useMemo(() => {
    const offerStats = offers.map(offer => {
      const rewardsForOffer = allUsers.flatMap(u =>
        (u.completedRewards || []).filter(
          r => r.offerSnapshot?.offerId === offer.offerId
        )
      );
      const totalRewards = rewardsForOffer.length;
      const claimedRewards = rewardsForOffer.filter(r => r.claimedAt).length;
      const totalStamps = rewardsForOffer.reduce(
        (sum, r) => sum + (r.scanHistory?.length || 0),
        0
      );

      return {
        ...offer,
        totalRewards,
        claimedRewards,
        totalStamps,
        conversionRate:
          totalStamps > 0 ? ((totalRewards / totalStamps) * 100).toFixed(1) : 0,
      };
    });

    return offerStats
      .filter(o => o.totalStamps > 0)
      .sort((a, b) => b.totalStamps - a.totalStamps)
      .slice(0, 5);
  }, [offers, allUsers]);

  // Customer segments
  const customerSegments = useMemo(() => {
    const customers = allUsers.filter(u => u.role === "customer");

    const segments = {
      new: customers.filter(u => {
        const createdAt = u.createdAt?.toDate();
        if (!createdAt) return false;
        const daysSince =
          (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      }).length,
      active: customers.filter(
        u =>
          u.lastScanAt &&
          new Date().getTime() - u.lastScanAt.toDate().getTime() <
            7 * 24 * 60 * 60 * 1000
      ).length,
      returning: customers.filter(
        u =>
          u.lastScanAt &&
          new Date().getTime() - u.lastScanAt.toDate().getTime() >=
            7 * 24 * 60 * 60 * 1000 &&
          new Date().getTime() - u.lastScanAt.toDate().getTime() <
            30 * 24 * 60 * 60 * 1000
      ).length,
      dormant: customers.filter(
        u =>
          !u.lastScanAt ||
          new Date().getTime() - u.lastScanAt.toDate().getTime() >=
            30 * 24 * 60 * 60 * 1000
      ).length,
    };

    return segments;
  }, [allUsers]);

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  // Helper function to safely parse numeric values
  const parseNumericValue = (value: string | number): number => {
    if (typeof value === "number") return value;
    return parseFloat(value) || 0;
  };

  // Helper function to format percentage values
  const formatPercentage = (value: number): string => {
    return value.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Customer Growth */}
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-300">This Month</div>
              <div className="text-sm font-medium text-blue-400">
                +{metrics.customers.newThisMonth}
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {metrics.customers.total.toLocaleString()}
          </div>
          <div className="text-blue-300 text-lg">Total Customers</div>
        </div>

        {/* Reward Performance */}
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 border border-green-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-xs text-green-300">Redemption Rate</div>
              <div className="text-sm font-medium text-green-400">
                {metrics.rewards.redemptionRate}%
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {metrics.rewards.total.toLocaleString()}
          </div>
          <div className="text-green-300 text-lg">Total Rewards</div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-xs text-purple-300">Active Users</div>
              <div className="text-sm font-medium text-purple-400">
                {metrics.activity.active}
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {metrics.engagement.avgPerCustomer}
          </div>
          <div className="text-purple-300 text-lg">Avg Stamps/Customer</div>
        </div>

        {/* Growth Metrics */}
        <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 border border-yellow-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-right">
              <div className="text-xs text-yellow-300">Month over Month</div>
              <div
                className={`text-sm font-medium ${getGrowthColor(metrics.growth.monthOverMonth)}`}
              >
                {getGrowthIcon(metrics.growth.monthOverMonth)}
                {Math.abs(parseFloat(metrics.growth.monthOverMonth))}%
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {metrics.growth.thisMonth}
          </div>
          <div className="text-yellow-300 text-lg">Rewards This Month</div>
        </div>
      </div>

      {/* Customer Segmentation & Offer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Customer Segments
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">New (30 days)</span>
              </div>
              <div className="text-white font-medium">
                {customerSegments.new}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Active (7 days)</span>
              </div>
              <div className="text-white font-medium">
                {customerSegments.active}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">Returning (30 days)</span>
              </div>
              <div className="text-white font-medium">
                {customerSegments.returning}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">Dormant (30+ days)</span>
              </div>
              <div className="text-white font-medium">
                {customerSegments.dormant}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {metrics.customers.total}
              </div>
              <div className="text-gray-400 text-sm">Total Customers</div>
            </div>
          </div>
        </div>

        {/* Top Performing Offers */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Top Performing Offers
          </h3>
          <div className="space-y-3">
            {topOffers.map((offer, index) => (
              <div
                key={offer.offerId}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {offer.name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {offer.totalStamps} stamps collected
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium text-sm">
                    {offer.totalRewards}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {offer.conversionRate}% conversion
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reward Redemption Trends */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-green-400" />
            Reward Redemption
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Earned:</span>
              <span className="text-white font-medium">
                {metrics.rewards.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Claimed:</span>
              <span className="text-white font-medium">
                {metrics.rewards.claimed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active:</span>
              <span className="text-white font-medium">
                {metrics.rewards.active}
              </span>
            </div>
            <div className="pt-2 border-t border-green-700/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {metrics.rewards.redemptionRate}%
                </div>
                <div className="text-green-300 text-sm">Redemption Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Engagement */}
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-blue-400" />
            Customer Engagement
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Stamps:</span>
              <span className="text-white font-medium">
                {metrics.engagement.totalStamps.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg per Customer:</span>
              <span className="text-white font-medium">
                {metrics.engagement.avgPerCustomer}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Very Active:</span>
              <span className="text-white font-medium">
                {metrics.activity.veryActive}
              </span>
            </div>
            <div className="pt-2 border-t border-blue-700/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {metrics.activity.active}
                </div>
                <div className="text-blue-300 text-sm">Active This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Utilization */}
        <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-purple-400" />
            Offer Utilization
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Offers:</span>
              <span className="text-white font-medium">
                {metrics.offers.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Offers:</span>
              <span className="text-white font-medium">
                {metrics.offers.active}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Utilization:</span>
              <span className="text-white font-medium">
                {metrics.offers.utilization}%
              </span>
            </div>
            <div className="pt-2 border-t border-purple-700/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {metrics.growth.thisMonth}
                </div>
                <div className="text-purple-300 text-sm">
                  Rewards This Month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
          Actionable Business Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Customer Retention
            </h4>
            <div className="space-y-3">
              {customerSegments.dormant > customerSegments.active && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <div className="text-red-300 font-medium">
                    ⚠️ High Dormant Customer Rate
                  </div>
                  <div className="text-red-200 text-sm mt-1">
                    {customerSegments.dormant} customers haven't been active in
                    30+ days. Consider re-engagement campaigns.
                  </div>
                </div>
              )}
              {metrics.rewards.redemptionRate < 50 && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <div className="text-yellow-300 font-medium">
                    📊 Low Reward Redemption
                  </div>
                  <div className="text-yellow-200 text-sm mt-1">
                    Only {metrics.rewards.redemptionRate}% of rewards are being
                    claimed. Review reward attractiveness and communication.
                  </div>
                </div>
              )}
              {metrics.offers.utilization < 50 && (
                <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <div className="text-blue-300 font-medium">
                    🎯 Low Offer Utilization
                  </div>
                  <div className="text-blue-200 text-sm mt-1">
                    Only {metrics.offers.utilization}% of offers are active.
                    Consider deactivating underperforming offers.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Growth Opportunities
            </h4>
            <div className="space-y-3">
              {parseNumericValue(metrics.growth.monthOverMonth) > 0 && (
                <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <div className="text-green-300 font-medium">
                    🚀 Positive Growth Trend
                  </div>
                  <div className="text-green-200 text-sm mt-1">
                    Rewards increased by {metrics.growth.monthOverMonth}% this
                    month. Current strategies are working well.
                  </div>
                </div>
              )}
              {metrics.customers.newThisMonth > 0 && (
                <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <div className="text-green-300 font-medium">
                    👥 New Customer Acquisition
                  </div>
                  <div className="text-green-200 text-sm mt-1">
                    {metrics.customers.newThisMonth} new customers this month.
                    Focus on converting them to active users.
                  </div>
                </div>
              )}
              {topOffers.length > 0 && (
                <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                  <div className="text-purple-300 font-medium">
                    ⭐ Top Performing Offer
                  </div>
                  <div className="text-purple-200 text-sm mt-1">
                    "{topOffers[0]?.name}" is your best performer with{" "}
                    {topOffers[0]?.totalStamps} stamps. Consider similar offers
                    or promotions.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
