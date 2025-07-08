import { useState } from "react";
import { db } from "@/lib/utils";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";

const Scan = () => {
  const [scanned, setScanned] = useState(false);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleQRCodeScan = async (data: string | null) => {
    if (!data || scanned) return;
    setScanned(true);
    setScanError(null);

    try {
      // Assume QR code is: LOYALTY:{email}:{uid}
      const parts = data.split(":");
      if (parts.length < 3 || parts[0] !== "LOYALTY") {
        throw new Error("Invalid QR code format - must be LOYALTY:email:uid");
      }
      const email = parts[1];
      if (!email) throw new Error("No email found in QR code");

      // Look up user by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error("No user found for this email");
      }
      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      const userData = userDoc.data();
      const currentPurchases = userData.purchases || 0;
      const newPurchases = currentPurchases + 1;
      const isRewardReady = newPurchases >= 5;

      await runTransaction(db, async (transaction) => {
        const freshSnap = await transaction.get(userRef);
        if (!freshSnap.exists()) throw new Error("User not found");
        transaction.update(userRef, {
          purchases: newPurchases,
          isRewardReady,
          lastScanAt: new Date(),
        });
      });

      setScannedUser(email);
      let successMessage = `Loyalty point added! Total purchases: ${newPurchases}`;
      if (isRewardReady) {
        successMessage += " - Reward ready! 🎉";
      } else {
        const remaining = 5 - newPurchases;
        successMessage += ` - ${remaining} more to earn reward`;
      }
      toast({
        title: "Success",
        description: successMessage,
      });
    } catch (error: unknown) {
      let message = "Failed to process loyalty point";
      if (error instanceof Error) {
        message = error.message;
      }
      setScanError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    setTimeout(() => {
      setScanned(false);
      setScannedUser(null);
    }, 3000);
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedUser(null);
    setScanError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-40 h-40 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-red-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-6 flex items-center">
          <Link
            to="/"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-white">
            Scan Loyalty QR
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-red-900/30 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Scan a User's QR Code
            </h2>
            {scanError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                {scanError}
              </div>
            )}
            <div className="relative w-full flex flex-col items-center">
              <Scanner
                onDecode={handleQRCodeScan}
                onError={(err) => setScanError(err?.message || "Camera error")}
                constraints={{ facingMode: "environment" }}
                containerStyle={{
                  width: 300,
                  height: 300,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
                videoStyle={{ width: 300, height: 300, objectFit: "cover" }}
              />
            </div>
            {scannedUser && (
              <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-400 font-semibold">
                <div className="text-center">
                  <div className="text-lg mb-1">✅ Scan Successful!</div>
                  <div className="text-sm text-green-300">
                    Loyalty point added for user
                  </div>
                  <div className="text-xs text-green-400 mt-1 font-mono">
                    {scannedUser}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={resetScanner}
                disabled={!scanned && !scanError}
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
