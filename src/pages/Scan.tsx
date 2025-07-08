import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/utils";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Scan = () => {
  const [scanned, setScanned] = useState(false);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!qrRef.current) return;
    const qrCodeScanner = new Html5Qrcode(qrRef.current.id);
    html5QrCodeRef.current = qrCodeScanner;
    qrCodeScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (data: string) => {
        if (!scanned) {
          setScanned(true);
          // Assume QR code is: LOYALTY:{email}:{uid}
          const parts = data.split(":");
          const uid = parts[2];
          if (!uid) {
            toast({
              title: "Invalid QR",
              description: "Could not parse user ID.",
              variant: "destructive",
            });
            setTimeout(() => setScanned(false), 2000);
            return;
          }
          // Fetch user and increment purchase
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            toast({
              title: "User Not Found",
              description: "No user for this QR code.",
              variant: "destructive",
            });
            setTimeout(() => setScanned(false), 2000);
            return;
          }
          try {
            await runTransaction(db, async (transaction) => {
              const freshSnap = await transaction.get(userRef);
              if (!freshSnap.exists()) throw new Error("User not found");
              const userData = freshSnap.data();
              const newPurchases = (userData.purchases || 0) + 1;
              const isRewardReady = newPurchases >= 5;
              transaction.update(userRef, {
                purchases: newPurchases,
                isRewardReady,
                lastScanAt: new Date(),
              });
            });
            setScannedUser(uid);
            toast({ title: "Success", description: "Loyalty point added!" });
          } catch (error: unknown) {
            let message = "Failed to increment loyalty point.";
            if (
              error &&
              typeof error === "object" &&
              "message" in error &&
              typeof (error as { message?: unknown }).message === "string"
            ) {
              message = (error as { message: string }).message;
            }
            toast({
              title: "Error",
              description: message,
              variant: "destructive",
            });
          }
          setTimeout(() => {
            setScanned(false);
            setScannedUser(null);
          }, 2000);
        }
      },
      (err) => {
        toast({
          title: "Scan Error",
          description: String(err),
          variant: "destructive",
        });
      }
    );
    return () => {
      qrCodeScanner.stop().catch(() => {});
      qrCodeScanner.clear();
    };
  }, [scanned]);

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
            <div
              id="qr-reader"
              ref={qrRef}
              style={{ width: 300, height: 300 }}
            />
            {scannedUser && (
              <div className="mt-4 text-green-400 font-semibold">
                Loyalty point added for user: {scannedUser}
              </div>
            )}
            <Button
              className="mt-6"
              onClick={() => setScanned(false)}
              disabled={!scanned}
            >
              Ready for Next Scan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
