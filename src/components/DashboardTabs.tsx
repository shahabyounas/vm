import { Button } from "@/components/ui/button";
import { User, Target, Gift } from "lucide-react";

interface DashboardTabsProps {
  activeTab: "progress" | "card" | "offers";
  onTabChange: (tab: "progress" | "card" | "offers") => void;
  userRole: string;
}

const DashboardTabs = ({
  activeTab,
  onTabChange,
  userRole,
}: DashboardTabsProps) => {
  const tabs = [
    {
      key: "progress" as const,
      label: "Progress",
      icon: Target,
      description: "Track your stamps & rewards",
      color: "blue",
      activeColor: "from-blue-500 to-blue-600",
      inactiveColor: "from-blue-400/20 to-blue-500/20",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-300",
      hoverColor: "hover:from-blue-400/30 hover:to-blue-500/30",
    },
    {
      key: "offers" as const,
      label: "Offers",
      icon: Gift,
      description: "Available loyalty offers",
      color: "green",
      activeColor: "from-green-500 to-green-600",
      inactiveColor: "from-green-400/20 to-green-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-300",
      hoverColor: "hover:from-green-400/30 hover:to-green-500/30",
    },
    {
      key: "card" as const,
      label: "Rewards",
      icon: User,
      description: "Your earned rewards",
      color: "purple",
      activeColor: "from-purple-500 to-purple-600",
      inactiveColor: "from-purple-400/20 to-purple-500/20",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-300",
      hoverColor: "hover:from-purple-400/30 hover:to-purple-500/30",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-xl p-3 backdrop-blur-sm shadow-lg">
      <div className="flex space-x-2 h-24">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center rounded-lg transition-all duration-300 ease-out group relative overflow-hidden min-h-[88px] ${
                isActive
                  ? `bg-gradient-to-b ${tab.activeColor} border-2 ${tab.borderColor} text-white shadow-lg shadow-${tab.color}-500/25`
                  : `bg-gradient-to-b ${tab.inactiveColor} border-2 border-transparent text-gray-400 ${tab.hoverColor} hover:border-${tab.color}-500/30 hover:text-${tab.color}-300`
              }`}
            >
              {/* Animated Background */}
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-b from-${tab.color}-500/10 to-${tab.color}-400/10`
                    : "bg-transparent"
                }`}
              />

              {/* Active Indicator */}
              {isActive && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${tab.color}-400 to-${tab.color}-500`}
                />
              )}

              {/* Icon */}
              <Icon
                className={`w-6 h-6 mb-2 transition-all duration-300 ${
                  isActive
                    ? "text-white scale-110 drop-shadow-sm relative z-10"
                    : `group-hover:scale-110 group-hover:text-${tab.color}-300`
                }`}
              />

              {/* Label */}
              <span
                className={`text-sm font-bold transition-all duration-300 mb-1 ${
                  isActive
                    ? "text-white font-extrabold drop-shadow-lg relative z-10"
                    : "text-gray-300 group-hover:text-white"
                }`}
              >
                {tab.label}
              </span>

              {/* Description */}
              <span
                className={`text-xs text-center transition-all duration-300 leading-tight ${
                  isActive
                    ? "text-white font-semibold drop-shadow-lg relative z-10"
                    : "text-gray-400 group-hover:text-gray-200"
                }`}
              >
                {tab.description}
              </span>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                  isActive
                    ? `ring-2 ring-${tab.color}-500/30`
                    : `group-hover:ring-1 group-hover:ring-${tab.color}-500/20`
                }`}
              />

              {/* Glow Effect for Active Tab */}
              {isActive && (
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-b from-${tab.color}-500/5 to-transparent`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardTabs;
