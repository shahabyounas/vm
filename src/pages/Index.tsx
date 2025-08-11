import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PWAGuide from "@/components/PWAGuide";
import { Download, Database } from "lucide-react";
import logo from "../../public/logo.png";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
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

  const handleManualInstall = () => {
    // Check if we're in a supported browser
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

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
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Cover Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bgCover.jpeg)" }}
      ></div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Smoke background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-700 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo/Title */}
        <div>
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Vape Master Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-12 max-w-md">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-4">
            Loyalty Program
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed">
            Join our loyalty program and get rewards! Earn points with every
            purchase and unlock exclusive benefits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          <Link to="/register" className="block">
            <Button className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Join Now
            </Button>
          </Link>

          <Link to="/login" className="block">
            <Button
              variant="outline"
              className="w-full py-4 text-lg font-semibold bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Already a Member?
            </Button>
          </Link>
        </div>

        {/* PWA Install Guide - Only show if not installed */}
        {!isInstalled && (
          <div className="mt-8">
            <PWAGuide />
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-6 text-center text-gray-500">
          <p className="text-sm">Smoke responsibly • 21+ only</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
