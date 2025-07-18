import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { user, loading, settings, settingsLoading, updateSettings } =
    useAuth();
  const navigate = useNavigate();
  const [purchaseLimit, setPurchaseLimit] = useState(5);
  const [descriptionMessage, setDescriptionMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (
      !loading &&
      (!user || (user.role !== "admin" && user.role !== "super_admin"))
    ) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Load current settings
  useEffect(() => {
    if (settings) {
      setPurchaseLimit(settings.purchaseLimit);
      setDescriptionMessage(settings.descriptionMessage);
    }
  }, [settings]);

  // Show loading state while auth is initializing
  if (loading || settingsLoading) {
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

  const handleSave = async () => {
    if (purchaseLimit < 1) {
      toast({
        title: "Invalid Purchase Limit",
        description: "Purchase limit must be at least 1",
        variant: "destructive",
      });
      return;
    }

    if (!descriptionMessage.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description message",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings(user, purchaseLimit, descriptionMessage.trim());
      toast({
        title: "Settings Updated",
        description: "Global settings have been saved successfully!",
      });
    } catch (error) {
      console.log("usser", user);
      console.error("Error updating settings:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Global Settings
                </h2>
                <p className="text-gray-400">
                  Configure loyalty program settings for new users
                </p>
              </div>

              <div className="space-y-8">
                {/* Purchase Limit Setting */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="purchaseLimit"
                      className="text-white text-lg font-semibold"
                    >
                      Purchase Limit
                    </Label>
                    <div className="text-sm text-gray-400">
                      Current: {settings?.purchaseLimit || 10}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="purchaseLimit"
                      type="number"
                      min="1"
                      max="50"
                      value={purchaseLimit}
                      onChange={(e) =>
                        setPurchaseLimit(parseInt(e.target.value) || 1)
                      }
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 text-lg"
                      placeholder="Enter purchase limit"
                    />
                    <p className="text-sm text-gray-400">
                      Number of purchases required for new users to earn a
                      reward
                    </p>
                  </div>
                </div>

                {/* Description Message Setting */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="descriptionMessage"
                      className="text-white text-lg font-semibold"
                    >
                      Description Message
                    </Label>
                    <div className="text-sm text-gray-400">
                      {descriptionMessage.length}/200
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      id="descriptionMessage"
                      value={descriptionMessage}
                      onChange={(e) => setDescriptionMessage(e.target.value)}
                      maxLength={200}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 min-h-[120px] resize-none"
                      placeholder="Enter description message for new users..."
                    />
                    <p className="text-sm text-gray-400">
                      This message will be shown to new users on their dashboard
                    </p>
                  </div>
                </div>

                {/* Current Settings Info */}
                {settings && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">
                      Current Settings
                    </h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Purchase Limit: {settings.purchaseLimit}</div>
                      <div>Description: {settings.descriptionMessage}</div>
                      <div>
                        Last Updated:{" "}
                        {settings.updatedAt.toDate().toLocaleString()}
                      </div>
                      <div>Updated By: {settings.updatedBy}</div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>

                {/* Important Note */}
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">
                    ⚠️ Important Note
                  </h4>
                  <p className="text-blue-200 text-sm">
                    These settings will only affect new users who register after
                    the changes are saved. Existing users will keep their
                    original purchase limits to maintain fairness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
