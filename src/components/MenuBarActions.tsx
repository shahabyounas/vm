import React, { useState, useEffect } from "react";
import { DASHBOARD_ACTIONS, Role } from "@/config/roles";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail } from "lucide-react";

interface MenuBarActionsProps {
  user: {
    role: string;
    name: string;
    email: string;
    id: string;
    contactNumber?: string;
    mobileNumber?: string;
  };
  handleLogout: () => void;
  navigate: (route: string) => void;
}

const MenuBarActions: React.FC<MenuBarActionsProps> = ({
  user,
  handleLogout,
  navigate,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    mobileNumber: user.mobileNumber || "",
  });

  // Update form when modal opens with current user data
  useEffect(() => {
    if (showProfileModal) {
      setEditForm({
        name: user.name,
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [showProfileModal, user.name, user.mobileNumber]);

  const handleProfileEdit = () => {
    setShowProfileModal(true);
  };

  const handleSaveProfile = () => {
    // TODO: Implement save functionality
    console.log("Saving profile:", editForm);
    setShowProfileModal(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user.name,
      mobileNumber: user.mobileNumber || "",
    });
    setShowProfileModal(false);
  };

  const handleAction = (actionKey: string) => {
    if (actionKey === "logout") {
      handleLogout();
    } else if (actionKey === "profile") {
      handleProfileEdit();
    } else {
      // Find the action to get the route
      const action = DASHBOARD_ACTIONS.find(a => a.key === actionKey);
      if (action) {
        navigate(action.route);
      }
    }
  };

  return (
    <>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="bg-transparent text-black border border-white">
            Menu
          </MenubarTrigger>
          <MenubarContent>
            {DASHBOARD_ACTIONS.filter(action =>
              action.roles.includes(user.role as Role)
            ).map(action => {
              const Icon = action.icon;
              return (
                <MenubarItem
                  key={action.key}
                  className={action.colorClass + " flex gap-2 items-center"}
                  onClick={() => handleAction(action.key)}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </MenubarItem>
              );
            })}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Profile Edit Modal - Centered on Screen */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 grid place-items-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-sm w-full">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Name Field - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field - Display Only (Non-editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-700/30 border border-gray-600 rounded-md">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">{user.email}</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>

              {/* Mobile Number Field - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number
                </label>
                <Input
                  value={editForm.mobileNumber}
                  onChange={e =>
                    setEditForm({ ...editForm, mobileNumber: e.target.value })
                  }
                  className="w-full bg-gray-700/50 border-gray-600 text-white"
                  placeholder="Enter mobile number"
                  type="tel"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuBarActions;
