import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const PWAStatus = () => {
  const [status, setStatus] = useState<{
    serviceWorker: boolean;
    manifest: boolean;
    https: boolean;
    standalone: boolean;
  }>({
    serviceWorker: false,
    manifest: false,
    https: false,
    standalone: false,
  });

  useEffect(() => {
    const checkPWAStatus = async () => {
      const newStatus = {
        serviceWorker: "serviceWorker" in navigator,
        manifest: false,
        https:
          window.location.protocol === "https:" ||
          window.location.hostname === "localhost",
        standalone: window.matchMedia("(display-mode: standalone)").matches,
      };

      // Check if manifest is accessible
      try {
        const response = await fetch("/manifest.json");
        newStatus.manifest = response.ok;
      } catch {
        newStatus.manifest = false;
      }

      setStatus(newStatus);
    };

    checkPWAStatus();
  }, []);

  const allGood = Object.values(status).every(Boolean);
  const hasIssues = Object.values(status).some(Boolean) && !allGood;

  // Don't show in production or if app is installed
  if (!import.meta.env.DEV || status.standalone) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs font-semibold text-white">PWA Status:</span>
        {allGood ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : hasIssues ? (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Service Worker:</span>
          <Badge
            variant={status.serviceWorker ? "default" : "destructive"}
            className="text-xs"
          >
            {status.serviceWorker ? "✓" : "✗"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Manifest:</span>
          <Badge
            variant={status.manifest ? "default" : "destructive"}
            className="text-xs"
          >
            {status.manifest ? "✓" : "✗"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">HTTPS/Localhost:</span>
          <Badge
            variant={status.https ? "default" : "destructive"}
            className="text-xs"
          >
            {status.https ? "✓" : "✗"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Standalone:</span>
          <Badge
            variant={status.standalone ? "default" : "secondary"}
            className="text-xs"
          >
            {status.standalone ? "Installed" : "Not Installed"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PWAStatus;
