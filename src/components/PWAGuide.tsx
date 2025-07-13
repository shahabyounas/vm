import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";

const PWAGuide = () => {
  const [open, setOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Improved PWA installation detection
  const checkIfInstalled = () => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isFullscreen = window.matchMedia(
      "(display-mode: fullscreen)"
    ).matches;
    const isMinimalUI = window.matchMedia("(display-mode: minimal-ui)").matches;
    const hasNavigatorStandalone =
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    return (
      isStandalone || isFullscreen || isMinimalUI || hasNavigatorStandalone
    );
  };

  useEffect(() => {
    // Check if app is already installed
    const installed = checkIfInstalled();
    if (installed) {
      setIsInstalled(true);
    }

    // Add a listener for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  // Don't show guide if app is installed
  if (isInstalled) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <Button
        onClick={() => setOpen(!open)}
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white"
      >
        <Info className="w-4 h-4 mr-2" />
        Install Guide
      </Button>

      {open && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">How to Install</h3>

          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Chrome/Edge (Desktop):</strong>
              <p>
                Look for the install icon (plus sign) in your browser address
                bar, or use the menu (three dots) and select "Install app"
              </p>
            </div>

            <div>
              <strong>Chrome/Edge (Mobile):</strong>
              <p>
                Tap the menu (three dots) and select "Add to Home screen" or
                "Install app"
              </p>
            </div>

            <div>
              <strong>Safari (Mobile):</strong>
              <p>
                Tap the Share button (square with arrow) and select "Add to Home
                Screen"
              </p>
            </div>

            <div>
              <strong>Safari (Desktop):</strong>
              <p>
                Use the Share button in the toolbar and select "Add to Dock"
              </p>
            </div>

            <div>
              <strong>Firefox:</strong>
              <p>
                Use the menu (three lines) and select "Install App" or "Add to
                Home Screen"
              </p>
            </div>
          </div>

          <Button
            onClick={() => setOpen(false)}
            size="sm"
            className="mt-3 w-full"
          >
            Got it!
          </Button>
        </div>
      )}
    </div>
  );
};

export default PWAGuide;
