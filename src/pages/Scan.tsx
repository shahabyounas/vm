import { useState, useEffect } from "react";
import { db } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/analytics";

const Scan = () => {
  const [verified, setVerified] = useState<null | boolean>(null);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { addPurchase } = useAuth();

  useEffect(() => {
    trackEvent("page_view", { page: "Scan" });
  }, []);

  const handleDecode = async (data: unknown) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setVerified(null);
    setScannedUser(null);

    try {
      // Expecting data to be an array with at least one object with rawValue
      if (
        !Array.isArray(data) ||
        !data[0] ||
        typeof data[0].rawValue !== "string"
      ) {
        throw new Error("Invalid QR scan result format");
      }
      const rawValue = data[0].rawValue;
      // Analytics: QR code scanned
      trackEvent("scan_qr_attempt", { rawValue });

      // Assume QR code is: LOYALTY:{email}:{uid}
      const parts = rawValue.split(":");
      if (parts.length < 3 || parts[0] !== "LOYALTY") {
        trackEvent("scan_qr_invalid", { rawValue });
        throw new Error("Invalid QR code format - must be LOYALTY:email:uid");
      }
      const email = parts[1];
      const uid = parts[2];
      if (!uid) throw new Error("No user ID found in QR code");

      // Look up user by UID in Firebase
      const userRef = doc(db, "users", uid);
      const userSnap = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", email),
          where("id", "==", uid)
        )
      );
      if (userSnap.empty) {
        trackEvent("scan_qr_no_user", { email, uid });
        throw new Error("No user found for this QR code");
      }
      const userDoc = userSnap.docs[0];
      const userData = userDoc.data();
      // Analytics: QR code valid and user found
      trackEvent("scan_qr_success", { scanned_user: email, scanned_uid: uid });

      // Add purchase using the new reward-based system
      await addPurchase(email, uid);

      setScannedUser(email);
      setVerified(true);

      // Get updated user data to show current purchase count
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        const updatedUserData = updatedUserSnap.data();
        const purchaseCount = updatedUserData.purchases || 0;
        const userPurchaseLimit = updatedUserData.purchaseLimit || 5;
        let successMessage = `Loyalty point added! Total purchases: ${purchaseCount}`;
        if (purchaseCount >= userPurchaseLimit) {
          successMessage += " - Reward ready! 🎉";
          trackEvent("reward_ready", { scanned_user: email, scanned_uid: uid });
        } else {
          const remaining = userPurchaseLimit - purchaseCount;
          successMessage += ` - ${remaining} more to earn reward`;
        }
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      // Show success message for 3 seconds before redirecting
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error processing QR scan:", error);
      let message = "Failed to process loyalty point";
      let isCooldownError = false;

      if (error instanceof Error) {
        message = error.message;
        // Check if this is a cooldown error
        isCooldownError =
          message.includes("next stamp in") || message.includes("hours");
      }

      setVerified(false);
      toast({
        title: isCooldownError ? "Cooldown Active" : "Error",
        description: message,
        variant: isCooldownError ? "default" : "destructive",
      });
      trackEvent("scan_qr_error", {
        error: (error as Error).message,
        isCooldownError,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error("Scanner error:", err);
    setVerified(false);
    toast({
      title: "Scanner Error",
      description: "Camera error - please check permissions",
      variant: "destructive",
    });
    trackEvent("scan_qr_scanner_error", { error: String(err) });
  };

  const resetScanner = () => {
    setVerified(null);
    setScannedUser(null);
    setIsProcessing(false);
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
              <h1 className="ml-4 text-2xl font-bold text-white">
                Scan Loyalty QR
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Scan a User's QR Code
            </h2>
            {!verified && (
              <div className="relative w-full flex flex-col items-center">
                <div style={{ width: 300, height: 300, margin: "20px auto" }}>
                  <Scanner onScan={handleDecode} onError={handleError} />
                </div>
                {isProcessing && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Processing...
                  </div>
                )}
              </div>
            )}

            {verified === true && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700 rounded-xl text-center shadow-2xl animate-pulse">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-2xl font-bold text-green-400 mb-2">
                  Scan Successful!
                </div>
                <div className="text-lg text-green-300 mb-3">
                  Loyalty point added successfully
                </div>
                {scannedUser && (
                  <div className="text-sm text-green-400 bg-green-900/30 px-3 py-1 rounded-full inline-block">
                    {scannedUser}
                  </div>
                )}
                <div className="mt-4 text-xs text-green-500">
                  Redirecting to dashboard...
                </div>
              </div>
            )}
            {verified === false && (
              <div className="mt-6 p-6 bg-gradient-to-r from-orange-900/50 to-yellow-900/50 border border-orange-700 rounded-xl text-center shadow-2xl">
                <div className="text-6xl mb-4">⏰</div>
                <div className="text-2xl font-bold text-orange-400 mb-2">
                  Cooldown Active
                </div>
                <div className="text-lg text-orange-300 mb-3">
                  You can only collect one stamp per 24 hours
                </div>
                <div className="text-sm text-orange-400 bg-orange-900/30 px-3 py-1 rounded-full inline-block">
                  Please wait before scanning again
                </div>
              </div>
            )}
            {!verified && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={resetScanner}
                  disabled={!verified}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/20"
                >
                  Reset Scanner
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Scan;
