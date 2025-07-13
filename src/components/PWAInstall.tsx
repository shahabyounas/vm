import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      setDebugInfo("App is already installed");
      return;
    }

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      setDebugInfo("Service Worker not supported");
      return;
    }

    // Check if manifest is accessible
    fetch("/manifest.json")
      .then((response) => {
        if (!response.ok) {
          setDebugInfo("Manifest not accessible");
          return;
        }
        setDebugInfo("Manifest accessible");
      })
      .catch(() => {
        setDebugInfo("Manifest fetch failed");
      });

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      setDebugInfo("Install prompt available");
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log("App installed");
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setDebugInfo("App installed successfully");
    };

    // Check if we can install manually - show button after a short delay
    const checkInstallability = () => {
      // Show manual install button for all browsers
      setTimeout(() => {
        setShowInstallButton(true);
        setDebugInfo("Manual install available");
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check installability after a delay
    setTimeout(checkInstallability, 1000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          console.log("User accepted the install prompt");
          setDebugInfo("Install accepted");
        } else {
          console.log("User dismissed the install prompt");
          setDebugInfo("Install dismissed");
        }

        setDeferredPrompt(null);
        setShowInstallButton(false);
      } catch (error) {
        console.error("Install error:", error);
        setDebugInfo("Install error: " + error);
      }
    } else {
      // Manual install instructions
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isEdge = /Edg/.test(navigator.userAgent);
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      if (isChrome || isEdge) {
        alert(
          'To install: Look for the install icon (plus sign) in your browser address bar, or use the menu (three dots) and select "Install app"'
        );
      } else if (isSafari) {
        alert(
          'To install: Tap the Share button (square with arrow) and select "Add to Home Screen"'
        );
      } else {
        alert(
          "To install: Use your browser menu to add this site to your home screen or desktop"
        );
      }
      setDebugInfo("Manual install instructions shown");
    }
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    setDebugInfo("Install prompt dismissed");
  };

  // Show debug info in development
  const isDevelopment = import.meta.env.DEV;

  // Don't render anything if app is installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {showInstallButton && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 shadow-lg border border-red-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-white" />
              <div>
                <p className="text-white font-semibold text-sm">
                  Install Vaporwave Loyalty Club
                </p>
                <p className="text-red-100 text-xs">
                  Get quick access and work offline
                </p>
                {isDevelopment && debugInfo && (
                  <p className="text-red-200 text-xs mt-1">
                    Debug: {debugInfo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-white text-red-600 hover:bg-red-50 font-semibold"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-red-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstall;
