import React, { useState, useEffect } from "react";
import { User, GlobalSettings } from "@/hooks/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings as SettingsIcon,
  Users,
  Gift,
  Shield,
  Palette,
  Bell,
  Database,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateSettings } from "@/db/settings";
import { Timestamp } from "firebase/firestore";

interface SettingsTabProps {
  user: User;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    businessName: "Vape Master",
    businessDescription: "Premium Vape & E-Liquid Loyalty Program",
    supportEmail: "support@vapemaster.com",
    supportPhone: "+1 (555) 123-4567",
    businessHours: "Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-8PM",
    timezone: "America/New_York",
  });

  // Loyalty Program Settings
  const [loyaltySettings, setLoyaltySettings] = useState({
    defaultStampsPerScan: 1,
    maxStampsPerScan: 5,
    defaultStampRequirement: 5,
    maxStampRequirement: 50,
    allowMultipleRewards: true,
    rewardExpiryDays: 365,
    autoAssignDefaultOffer: true,
  });

  // Reward Settings
  const [rewardSettings, setRewardSettings] = useState({
    defaultRewardType: "percentage",
    defaultRewardValue: "20",
    defaultRewardDescription: "20% OFF",
    allowCustomRewards: true,
    maxRewardValue: "100",
    requireApproval: false,
  });

  // Security & Access Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeoutHours: 24,
    allowMultiDeviceLogin: true,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    enableAuditLog: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    rewardReminders: true,
    inactivityAlerts: true,
    adminAlerts: true,
    customerUpdates: true,
  });

  // UI & Branding Settings
  const [uiSettings, setUiSettings] = useState({
    primaryColor: "#ef4444",
    secondaryColor: "#1f2937",
    accentColor: "#f59e0b",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    enableAnimations: true,
    enableDarkMode: true,
    customCSS: "",
  });

  // Data & Privacy Settings
  const [dataSettings, setDataSettings] = useState({
    dataRetentionDays: 2555, // 7 years
    allowDataExport: true,
    allowDataDeletion: true,
    anonymizeOldData: false,
    backupFrequency: "daily",
    enableAnalytics: true,
  });

  useEffect(() => {
    // Load existing settings from localStorage or API
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("vm_business_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSystemSettings(parsed.system || systemSettings);
        setLoyaltySettings(parsed.loyalty || loyaltySettings);
        setRewardSettings(parsed.rewards || rewardSettings);
        setSecuritySettings(parsed.security || securitySettings);
        setNotificationSettings(parsed.notifications || notificationSettings);
        setUiSettings(parsed.ui || uiSettings);
        setDataSettings(parsed.data || dataSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const allSettings = {
        system: systemSettings,
        loyalty: loyaltySettings,
        rewards: rewardSettings,
        security: securitySettings,
        notifications: notificationSettings,
        ui: uiSettings,
        data: dataSettings,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.email,
      };

      // Save to localStorage
      localStorage.setItem("vm_business_settings", JSON.stringify(allSettings));

      // Update global settings in database
      await updateSettings(
        user,
        loyaltySettings.defaultStampRequirement,
        rewardSettings.defaultRewardDescription,
        rewardSettings.defaultRewardType,
        rewardSettings.defaultRewardValue,
        rewardSettings.defaultRewardDescription
      );

      toast({
        title: "Settings Saved",
        description: "All business settings have been updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save some settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to defaults? This cannot be undone."
      )
    ) {
      setSystemSettings({
        businessName: "Vape Master",
        businessDescription: "Premium Vape & E-Liquid Loyalty Program",
        supportEmail: "support@vapemaster.com",
        supportPhone: "+1 (555) 123-4567",
        businessHours: "Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-8PM",
        timezone: "America/New_York",
      });
      setLoyaltySettings({
        defaultStampsPerScan: 1,
        maxStampsPerScan: 5,
        defaultStampRequirement: 5,
        maxStampRequirement: 50,
        allowMultipleRewards: true,
        rewardExpiryDays: 365,
        autoAssignDefaultOffer: true,
      });
      setRewardSettings({
        defaultRewardType: "percentage",
        defaultRewardValue: "20",
        defaultRewardDescription: "20% OFF",
        allowCustomRewards: true,
        maxRewardValue: "100",
        requireApproval: false,
      });
      setSecuritySettings({
        sessionTimeoutHours: 24,
        allowMultiDeviceLogin: true,
        requireEmailVerification: true,
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 30,
        enableAuditLog: true,
      });
      setNotificationSettings({
        emailNotifications: true,
        pushNotifications: true,
        rewardReminders: true,
        inactivityAlerts: true,
        adminAlerts: true,
        customerUpdates: true,
      });
      setUiSettings({
        primaryColor: "#ef4444",
        secondaryColor: "#1f2937",
        accentColor: "#f59e0b",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        enableAnimations: true,
        enableDarkMode: true,
        customCSS: "",
      });
      setDataSettings({
        dataRetentionDays: 2555,
        allowDataExport: true,
        allowDataDeletion: true,
        anonymizeOldData: false,
        backupFrequency: "daily",
        enableAnalytics: true,
      });

      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults.",
      });
    }
  };

  const exportSettings = () => {
    const allSettings = {
      system: systemSettings,
      loyalty: loyaltySettings,
      rewards: rewardSettings,
      security: securitySettings,
      notifications: notificationSettings,
      ui: uiSettings,
      data: dataSettings,
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
    };

    const blob = new Blob([JSON.stringify(allSettings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vm_business_settings_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Settings Exported",
      description: "Business settings have been exported successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Business Settings
              </h3>
              <p className="text-gray-400 text-sm">
                Configure your loyalty program and business preferences
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={exportSettings}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Database className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System & Business Information */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-400" />
            Business Information
          </h4>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">Business Name</Label>
              <Input
                value={systemSettings.businessName}
                onChange={e =>
                  setSystemSettings({
                    ...systemSettings,
                    businessName: e.target.value,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">
                Business Description
              </Label>
              <Textarea
                value={systemSettings.businessDescription}
                onChange={e =>
                  setSystemSettings({
                    ...systemSettings,
                    businessDescription: e.target.value,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                placeholder="Describe your business and loyalty program"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Support Email</Label>
                <Input
                  value={systemSettings.supportEmail}
                  onChange={e =>
                    setSystemSettings({
                      ...systemSettings,
                      supportEmail: e.target.value,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="email"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Support Phone</Label>
                <Input
                  value={systemSettings.supportPhone}
                  onChange={e =>
                    setSystemSettings({
                      ...systemSettings,
                      supportPhone: e.target.value,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Business Hours</Label>
              <Input
                value={systemSettings.businessHours}
                onChange={e =>
                  setSystemSettings({
                    ...systemSettings,
                    businessHours: e.target.value,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                placeholder="e.g., Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-8PM"
              />
            </div>
          </div>
        </div>

        {/* Loyalty Program Settings */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-green-400" />
            Loyalty Program
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">
                  Default Stamps/Scan
                </Label>
                <Input
                  value={loyaltySettings.defaultStampsPerScan}
                  onChange={e =>
                    setLoyaltySettings({
                      ...loyaltySettings,
                      defaultStampsPerScan: parseInt(e.target.value) || 1,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="number"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Max Stamps/Scan</Label>
                <Input
                  value={loyaltySettings.maxStampsPerScan}
                  onChange={e =>
                    setLoyaltySettings({
                      ...loyaltySettings,
                      maxStampsPerScan: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="number"
                  min="1"
                  max="20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">
                  Default Stamp Requirement
                </Label>
                <Input
                  value={loyaltySettings.defaultStampRequirement}
                  onChange={e =>
                    setLoyaltySettings({
                      ...loyaltySettings,
                      defaultStampRequirement: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="number"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">
                  Max Stamp Requirement
                </Label>
                <Input
                  value={loyaltySettings.maxStampRequirement}
                  onChange={e =>
                    setLoyaltySettings({
                      ...loyaltySettings,
                      maxStampRequirement: parseInt(e.target.value) || 50,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="number"
                  min="10"
                  max="200"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowMultipleRewards"
                  checked={loyaltySettings.allowMultipleRewards}
                  onChange={e =>
                    setLoyaltySettings({
                      ...loyaltySettings,
                      allowMultipleRewards: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="allowMultipleRewards"
                  className="text-gray-300 text-sm"
                >
                  Allow multiple rewards per offer
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoAssignDefaultOffer"
                  checked={loyaltySettings.autoAssignDefaultOffer}
                  onChange={e =>
                    setLoyaltySettings({
                      ...loyaltySettings,
                      autoAssignDefaultOffer: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="autoAssignDefaultOffer"
                  className="text-gray-300 text-sm"
                >
                  Auto-assign default offer to new users
                </Label>
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">
                Reward Expiry (Days)
              </Label>
              <Input
                value={loyaltySettings.rewardExpiryDays}
                onChange={e =>
                  setLoyaltySettings({
                    ...loyaltySettings,
                    rewardExpiryDays: parseInt(e.target.value) || 365,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                type="number"
                min="30"
                max="3650"
              />
            </div>
          </div>
        </div>

        {/* Reward Settings */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-400" />
            Reward Configuration
          </h4>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">
                Default Reward Type
              </Label>
              <select
                value={rewardSettings.defaultRewardType}
                onChange={e =>
                  setRewardSettings({
                    ...rewardSettings,
                    defaultRewardType: e.target.value,
                  })
                }
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 mt-1"
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed_amount">Fixed Amount Off</option>
                <option value="free_item">Free Item</option>
                <option value="buy_one_get_one">Buy One Get One</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">
                  Default Reward Value
                </Label>
                <Input
                  value={rewardSettings.defaultRewardValue}
                  onChange={e =>
                    setRewardSettings({
                      ...rewardSettings,
                      defaultRewardValue: e.target.value,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  placeholder="20"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">
                  Max Reward Value
                </Label>
                <Input
                  value={rewardSettings.maxRewardValue}
                  onChange={e =>
                    setRewardSettings({
                      ...rewardSettings,
                      maxRewardValue: e.target.value,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">
                Default Reward Description
              </Label>
              <Input
                value={rewardSettings.defaultRewardDescription}
                onChange={e =>
                  setRewardSettings({
                    ...rewardSettings,
                    defaultRewardDescription: e.target.value,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                placeholder="20% OFF"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowCustomRewards"
                  checked={rewardSettings.allowCustomRewards}
                  onChange={e =>
                    setRewardSettings({
                      ...rewardSettings,
                      allowCustomRewards: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="allowCustomRewards"
                  className="text-gray-300 text-sm"
                >
                  Allow custom reward creation
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={rewardSettings.requireApproval}
                  onChange={e =>
                    setRewardSettings({
                      ...rewardSettings,
                      requireApproval: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="requireApproval"
                  className="text-gray-300 text-sm"
                >
                  Require admin approval for rewards
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-400" />
            Security & Access
          </h4>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">
                Session Timeout (Hours)
              </Label>
              <Input
                value={securitySettings.sessionTimeoutHours}
                onChange={e =>
                  setSecuritySettings({
                    ...securitySettings,
                    sessionTimeoutHours: parseInt(e.target.value) || 24,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                type="number"
                min="1"
                max="168"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">
                  Max Login Attempts
                </Label>
                <Input
                  value={securitySettings.maxLoginAttempts}
                  onChange={e =>
                    setSecuritySettings({
                      ...securitySettings,
                      maxLoginAttempts: parseInt(e.target.value) || 5,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="number"
                  min="3"
                  max="10"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">
                  Lockout Duration (Min)
                </Label>
                <Input
                  value={securitySettings.lockoutDurationMinutes}
                  onChange={e =>
                    setSecuritySettings({
                      ...securitySettings,
                      lockoutDurationMinutes: parseInt(e.target.value) || 30,
                    })
                  }
                  className="bg-gray-700/50 border-gray-600 text-white mt-1"
                  type="number"
                  min="15"
                  max="1440"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowMultiDeviceLogin"
                  checked={securitySettings.allowMultiDeviceLogin}
                  onChange={e =>
                    setSecuritySettings({
                      ...securitySettings,
                      allowMultiDeviceLogin: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="allowMultiDeviceLogin"
                  className="text-gray-300 text-sm"
                >
                  Allow multi-device login
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={securitySettings.requireEmailVerification}
                  onChange={e =>
                    setSecuritySettings({
                      ...securitySettings,
                      requireEmailVerification: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="requireEmailVerification"
                  className="text-gray-300 text-sm"
                >
                  Require email verification
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAuditLog"
                  checked={securitySettings.enableAuditLog}
                  onChange={e =>
                    setSecuritySettings({
                      ...securitySettings,
                      enableAuditLog: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="enableAuditLog"
                  className="text-gray-300 text-sm"
                >
                  Enable audit logging
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-yellow-400" />
            Notifications
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={e =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: e.target.checked,
                  })
                }
                className="rounded bg-gray-700/50 border-gray-600"
              />
              <Label
                htmlFor="emailNotifications"
                className="text-gray-300 text-sm"
              >
                Email notifications
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pushNotifications"
                checked={notificationSettings.pushNotifications}
                onChange={e =>
                  setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: e.target.checked,
                  })
                }
                className="rounded bg-gray-700/50 border-gray-600"
              />
              <Label
                htmlFor="pushNotifications"
                className="text-gray-300 text-sm"
              >
                Push notifications
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="rewardReminders"
                checked={notificationSettings.rewardReminders}
                onChange={e =>
                  setNotificationSettings({
                    ...notificationSettings,
                    rewardReminders: e.target.checked,
                  })
                }
                className="rounded bg-gray-700/50 border-gray-600"
              />
              <Label
                htmlFor="rewardReminders"
                className="text-gray-300 text-sm"
              >
                Reward reminders
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="inactivityAlerts"
                checked={notificationSettings.inactivityAlerts}
                onChange={e =>
                  setNotificationSettings({
                    ...notificationSettings,
                    inactivityAlerts: e.target.checked,
                  })
                }
                className="rounded bg-gray-700/50 border-gray-600"
              />
              <Label
                htmlFor="inactivityAlerts"
                className="text-gray-300 text-sm"
              >
                Inactivity alerts
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="adminAlerts"
                checked={notificationSettings.adminAlerts}
                onChange={e =>
                  setNotificationSettings({
                    ...notificationSettings,
                    adminAlerts: e.target.checked,
                  })
                }
                className="rounded bg-gray-700/50 border-gray-600"
              />
              <Label htmlFor="adminAlerts" className="text-gray-300 text-sm">
                Admin alerts
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="customerUpdates"
                checked={notificationSettings.customerUpdates}
                onChange={e =>
                  setNotificationSettings({
                    ...notificationSettings,
                    customerUpdates: e.target.checked,
                  })
                }
                className="rounded bg-gray-700/50 border-gray-600"
              />
              <Label
                htmlFor="customerUpdates"
                className="text-gray-300 text-sm"
              >
                Customer updates
              </Label>
            </div>
          </div>
        </div>

        {/* UI & Branding */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-pink-400" />
            UI & Branding
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Primary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={uiSettings.primaryColor}
                    onChange={e =>
                      setUiSettings({
                        ...uiSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white w-20"
                    type="color"
                  />
                  <Input
                    value={uiSettings.primaryColor}
                    onChange={e =>
                      setUiSettings({
                        ...uiSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white flex-1"
                    placeholder="#ef4444"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Secondary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={uiSettings.secondaryColor}
                    onChange={e =>
                      setUiSettings({
                        ...uiSettings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white w-20"
                    type="color"
                  />
                  <Input
                    value={uiSettings.secondaryColor}
                    onChange={e =>
                      setUiSettings({
                        ...uiSettings,
                        secondaryColor: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white flex-1"
                    placeholder="#1f2937"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Accent Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={uiSettings.accentColor}
                    onChange={e =>
                      setUiSettings({
                        ...uiSettings,
                        accentColor: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white w-20"
                    type="color"
                  />
                  <Input
                    value={uiSettings.accentColor}
                    onChange={e =>
                      setUiSettings({
                        ...uiSettings,
                        accentColor: e.target.value,
                      })
                    }
                    className="bg-gray-700/50 border-gray-600 text-white flex-1"
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAnimations"
                  checked={uiSettings.enableAnimations}
                  onChange={e =>
                    setUiSettings({
                      ...uiSettings,
                      enableAnimations: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="enableAnimations"
                  className="text-gray-300 text-sm"
                >
                  Enable animations
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableDarkMode"
                  checked={uiSettings.enableDarkMode}
                  onChange={e =>
                    setUiSettings({
                      ...uiSettings,
                      enableDarkMode: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="enableDarkMode"
                  className="text-gray-300 text-sm"
                >
                  Enable dark mode
                </Label>
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Custom CSS</Label>
              <Textarea
                value={uiSettings.customCSS}
                onChange={e =>
                  setUiSettings({ ...uiSettings, customCSS: e.target.value })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                placeholder="/* Custom CSS styles */"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-indigo-400" />
            Data & Privacy
          </h4>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">
                Data Retention (Days)
              </Label>
              <Input
                value={dataSettings.dataRetentionDays}
                onChange={e =>
                  setDataSettings({
                    ...dataSettings,
                    dataRetentionDays: parseInt(e.target.value) || 2555,
                  })
                }
                className="bg-gray-700/50 border-gray-600 text-white mt-1"
                type="number"
                min="365"
                max="3650"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Backup Frequency</Label>
              <select
                value={dataSettings.backupFrequency}
                onChange={e =>
                  setDataSettings({
                    ...dataSettings,
                    backupFrequency: e.target.value,
                  })
                }
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 mt-1"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowDataExport"
                  checked={dataSettings.allowDataExport}
                  onChange={e =>
                    setDataSettings({
                      ...dataSettings,
                      allowDataExport: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="allowDataExport"
                  className="text-gray-300 text-sm"
                >
                  Allow data export
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowDataDeletion"
                  checked={dataSettings.allowDataDeletion}
                  onChange={e =>
                    setDataSettings({
                      ...dataSettings,
                      allowDataDeletion: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="allowDataDeletion"
                  className="text-gray-300 text-sm"
                >
                  Allow data deletion
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymizeOldData"
                  checked={dataSettings.anonymizeOldData}
                  onChange={e =>
                    setDataSettings({
                      ...dataSettings,
                      anonymizeOldData: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="anonymizeOldData"
                  className="text-gray-300 text-sm"
                >
                  Anonymize old data
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAnalytics"
                  checked={dataSettings.enableAnalytics}
                  onChange={e =>
                    setDataSettings({
                      ...dataSettings,
                      enableAnalytics: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-700/50 border-gray-600"
                />
                <Label
                  htmlFor="enableAnalytics"
                  className="text-gray-300 text-sm"
                >
                  Enable analytics
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          Settings Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Business:</span>
              <span className="text-white">{systemSettings.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Default Stamps:</span>
              <span className="text-white">
                {loyaltySettings.defaultStampRequirement}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Default Reward:</span>
              <span className="text-white">
                {rewardSettings.defaultRewardDescription}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Session Timeout:</span>
              <span className="text-white">
                {securitySettings.sessionTimeoutHours}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Multi-Device:</span>
              <span className="text-white">
                {securitySettings.allowMultiDeviceLogin
                  ? "Enabled"
                  : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Audit Log:</span>
              <span className="text-white">
                {securitySettings.enableAuditLog ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Notifications:</span>
              <span className="text-white">
                {notificationSettings.emailNotifications ? "Email" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Data Retention:</span>
              <span className="text-white">
                {dataSettings.dataRetentionDays} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backup:</span>
              <span className="text-white">{dataSettings.backupFrequency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
