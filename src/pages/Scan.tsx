import { useState, useEffect } from "react";
import { db } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { redeemReward } from "@/db/adapter";

const Scan = () => {
  const [verified, setVerified] = useState<null | boolean>(null);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<{
    userEmail: string;
    userId: string;
    offerId: string;
    offerName: string;
    stampsPerScan: number;
    action?: string;
    rewardId?: string;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
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

      // Try to parse as JSON first (new format)
      let qrData;
      try {
        qrData = JSON.parse(rawValue);
      } catch {
        // Fallback to old format: LOYALTY:{email}:{uid}
        const parts = rawValue.split(":");
        if (parts.length < 3 || parts[0] !== "LOYALTY") {
          trackEvent("scan_qr_invalid", { rawValue });
          throw new Error("Invalid QR code format");
        }
        qrData = {
          userEmail: parts[1],
          userId: parts[2],
          offerId: "default_offer", // Fallback for old format
        };
      }

      // Validate QR data
      if (!qrData.userEmail || !qrData.userId) {
        throw new Error("Invalid QR code data - missing user information");
      }

      // Look up user by UID in Firebase
      const userRef = doc(db, "users", qrData.userId);
      const userSnap = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", qrData.userEmail),
          where("id", "==", qrData.userId)
        )
      );
      if (userSnap.empty) {
        trackEvent("scan_qr_no_user", {
          email: qrData.userEmail,
          uid: qrData.userId,
        });
        throw new Error("No user found for this QR code");
      }
      const userDoc = userSnap.docs[0];
      const userData = userDoc.data();

      // Analytics: QR code valid and user found
      trackEvent("scan_qr_success", {
        scanned_user: qrData.userEmail,
        scanned_uid: qrData.userId,
        offer_id: qrData.offerId,
      });

      // Handle different actions based on QR data
      if (qrData.action === "redeem_reward" && qrData.rewardId) {
        // Handle reward redemption
        console.log("Processing reward redemption for:", qrData.rewardId);
        await redeemReward(
          null,
          qrData.userEmail,
          qrData.userId,
          qrData.rewardId
        );
      } else {
        // Handle stamp collection
        console.log("Processing stamp collection for offer:", qrData.offerId);
        console.log("QR Data:", qrData);
        await addPurchase(qrData.userEmail, qrData.userId, qrData.offerId);
      }

      setScannedUser(qrData.userEmail);
      setVerified(true);
      setScannedQRData(qrData);

      // Get updated user data to show current purchase count
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        const updatedUserData = updatedUserSnap.data();
        const purchaseCount = updatedUserData.purchases || 0;

        // Show different messages based on action
        let successMessage = "";

        if (qrData.action === "redeem_reward") {
          successMessage = `Reward redeemed for ${qrData.userName}! 🎉`;
          trackEvent("reward_redeemed", {
            scanned_user: qrData.userEmail,
            reward_id: qrData.rewardId,
          });
        } else {
          // Stamp collection
          const stampsEarned = qrData.stampsPerScan || 1;
          const stampText = stampsEarned === 1 ? "stamp" : "stamps";
          successMessage = `${stampsEarned} ${stampText} added for ${qrData.offerName || "loyalty program"}!`;

          // Get updated user data to show current purchase count and progress
          const updatedUserSnap = await getDoc(userRef);
          if (updatedUserSnap.exists()) {
            const updatedUserData = updatedUserSnap.data();
            const purchaseCount = updatedUserData.purchases || 0;
            successMessage += ` Total stamps: ${purchaseCount}`;

            if (qrData.offerId && qrData.offerId !== "default_offer") {
              // Find the specific offer reward to show accurate progress
              const offerReward = updatedUserData.completedRewards?.find(
                reward => reward.offerSnapshot?.offerId === qrData.offerId
              );

              if (offerReward) {
                const currentProgress = offerReward.scanHistory?.length || 0;
                const offerRequirement =
                  offerReward.offerSnapshot?.stampRequirement || 5;
                const remaining = Math.max(
                  0,
                  offerRequirement - currentProgress
                );

                console.log(
                  `Offer progress: ${currentProgress}/${offerRequirement}, remaining: ${remaining}`
                );

                if (currentProgress >= offerRequirement) {
                  successMessage += " - Offer completed! 🎉";
                  trackEvent("offer_completed", {
                    scanned_user: qrData.userEmail,
                    offer_id: qrData.offerId,
                  });
                } else {
                  successMessage += ` - Progress: ${currentProgress}/${offerRequirement} (${remaining} more needed)`;
                }
              }
            } else {
              // Fallback to old system
              const userPurchaseLimit = updatedUserData.purchaseLimit || 5;
              if (purchaseCount >= userPurchaseLimit) {
                successMessage += " - Reward ready! 🎉";
                trackEvent("reward_ready", {
                  scanned_user: qrData.userEmail,
                  scanned_uid: qrData.userId,
                });
              } else {
                const remaining = userPurchaseLimit - purchaseCount;
                successMessage += ` - ${remaining} more to earn reward`;
              }
            }
          }
        }

        toast({
          title: "Success",
          description: successMessage,
        });
      }

      // Show success message for 3 seconds before redirecting
      setTimeout(() => {
        // Force a page refresh to ensure the latest data is loaded
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Error processing QR scan:", error);
      let message = "Failed to process loyalty point";

      if (error instanceof Error) {
        message = error.message;
      }

      setVerified(false);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      trackEvent("scan_qr_error", {
        error: (error as Error).message,
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
    setScannedQRData(null);
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
                  Stamp Added Successfully!
                </div>
                <div className="text-lg text-green-300 mb-3">
                  {scannedUser && (
                    <div className="mb-3">
                      <span className="text-green-400 font-semibold">
                        {scannedUser}
                      </span>
                      <span className="text-green-300">
                        {" "}
                        has earned {scannedQRData?.stampsPerScan || 1}{" "}
                        {scannedQRData?.stampsPerScan === 1
                          ? "stamp"
                          : "stamps"}
                        !
                      </span>
                    </div>
                  )}
                  {scannedQRData?.offerName && (
                    <div className="text-sm text-green-400 bg-green-900/30 px-3 py-1 rounded-full inline-block mb-2">
                      Offer: {scannedQRData.offerName}
                    </div>
                  )}
                  {scannedQRData?.stampsPerScan &&
                    scannedQRData.stampsPerScan > 1 && (
                      <div className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full inline-block">
                        {scannedQRData.stampsPerScan}x Multiplier Active
                      </div>
                    )}
                  <div className="text-xs text-green-300 mt-2">
                    This scan added {scannedQRData?.stampsPerScan || 1} stamp
                    {scannedQRData?.stampsPerScan > 1 ? "s" : ""} to the user's
                    progress
                  </div>
                </div>
                <div className="mt-4 text-xs text-green-500">
                  Redirecting to dashboard...
                </div>
              </div>
            )}
            {verified === false && (
              <div className="mt-6 p-6 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700 rounded-xl text-center shadow-2xl">
                <div className="text-6xl mb-4">❌</div>
                <div className="text-2xl font-bold text-red-400 mb-2">
                  Scan Failed
                </div>
                <div className="text-lg text-red-300 mb-3">
                  There was an error processing the QR code
                </div>
                <div className="text-sm text-red-400 bg-red-900/30 px-3 py-1 rounded-full inline-block">
                  Please try scanning again
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
