import React from "react";

interface DashboardTabsProps {
  activeTab: "progress" | "card";
  setActiveTab: (tab: "progress" | "card") => void;
  userRole: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  userRole,
}) => (
  <div className="w-full flex justify-center mt-6">
    <div className="flex w-full max-w-md">
      {userRole === "customer" ? (
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
);

export default DashboardTabs;
