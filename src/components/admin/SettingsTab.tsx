import React from "react";
import { User } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsTabProps {
  user: User;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">System Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              General Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Offer
                </label>
                <select className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2">
                  <option>Select default offer for new users</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout
                </label>
                <Input
                  type="number"
                  placeholder="24"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              Security Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="multiDevice" className="rounded" />
                <label htmlFor="multiDevice" className="text-gray-300">
                  Allow multi-device login
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sessionValidation"
                  className="rounded"
                />
                <label htmlFor="sessionValidation" className="text-gray-300">
                  Enable session validation
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
