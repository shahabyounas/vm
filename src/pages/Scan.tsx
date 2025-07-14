import { useState } from "react";
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

const Scan = () => {
  const [result, setResult] = useState("");
  const [verified, setVerified] = useState<null | boolean>(null);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { addPurchase } = useAuth();

  const handleDecode = async (data: unknown) => {
    if (isProcessing) return;
    setResult(JSON.stringify(data));
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
      console.log("QR Code scanned rawValue:", rawValue);

      // Assume QR code is: LOYALTY:{email}:{uid}
      const parts = rawValue.split(":");
      if (parts.length < 3 || parts[0] !== "LOYALTY") {
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
        throw new Error("No user found for this QR code");
      }
      const userDoc = userSnap.docs[0];
      const userData = userDoc.data();
      console.log("Current user data:", {
        name: userData.name,
        email: userData.email,
        currentPurchases: userData.purchases || 0,
        purchaseLimit: userData.purchaseLimit || 5,
      });

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
        } else {
          const remaining = userPurchaseLimit - purchaseCount;
          successMessage += ` - ${remaining} more to earn reward`;
        }
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      navigate("/dashboard");
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error("Scanner error:", err);
    setResult("Error scanning QR code");
    setVerified(false);
    toast({
      title: "Scanner Error",
      description: "Camera error - please check permissions",
      variant: "destructive",
    });
  };

  const resetScanner = () => {
    setResult("");
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

            {result && (
              <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-2">Scanned:</div>
                  <div className="text-xs font-mono text-gray-400 break-all">
                    {result}
                  </div>
                </div>
              </div>
            )}

            {verified === true && (
              <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-400 font-semibold">
                <div className="text-center">
                  <div className="text-lg mb-1">
                    ✅ QR Code Verified & Updated!
                  </div>
                  <div className="text-sm text-green-300">
                    Loyalty point added for user
                  </div>
                  {scannedUser && (
                    <div className="text-xs text-green-400 mt-1 font-mono">
                      {scannedUser}
                    </div>
                  )}
                </div>
              </div>
            )}

            {verified === false && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 font-semibold">
                <div className="text-center">
                  <div className="text-lg mb-1">❌ QR Code Not Recognized</div>
                  <div className="text-sm text-red-300">
                    No user found for this QR code
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={resetScanner}
                disabled={!result && !verified}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                Reset Scanner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
