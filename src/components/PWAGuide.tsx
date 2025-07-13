import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Smartphone, Monitor, Tablet } from "lucide-react";

const PWAGuide = () => {
  const [open, setOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  const getInstallInstructions = () => {
    if (isIOS && isSafari) {
      return {
        title: "Install on iPhone/iPad",
        steps: [
          "Tap the Share button (square with arrow up) in Safari",
          "Scroll down and tap 'Add to Home Screen'",
          "Tap 'Add' to install the app",
          "The app will now appear on your home screen",
        ],
      };
    } else if (isAndroid && isChrome) {
      return {
        title: "Install on Android",
        steps: [
          "Tap the menu button (three dots) in Chrome",
          "Tap 'Add to Home screen' or 'Install app'",
          "Tap 'Add' or 'Install' to confirm",
          "The app will be installed and appear on your home screen",
        ],
      };
    } else if (isChrome) {
      return {
        title: "Install on Desktop Chrome",
        steps: [
          "Look for the install icon (plus sign) in the address bar",
          "Click the install icon",
          "Click 'Install' in the popup",
          "The app will be installed and can be launched from your desktop",
        ],
      };
    } else {
      return {
        title: "Install Instructions",
        steps: [
          "Open this website in Chrome, Edge, or Safari",
          "Look for the install option in your browser menu",
          "Follow the browser's installation prompts",
          "The app will be installed and ready to use",
        ],
      };
    }
  };

  const instructions = getInstallInstructions();

  // Don't render anything if app is installed
  if (isInstalled) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="w-3 h-3 mr-1" />
          How to Install
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Install Vaporwave Loyalty Club
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{instructions.title}</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-center space-x-4 pt-4">
              {isIOS && <Smartphone className="w-8 h-8 text-blue-500" />}
              {isAndroid && <Smartphone className="w-8 h-8 text-green-500" />}
              {!isIOS && !isAndroid && (
                <Monitor className="w-8 h-8 text-gray-500" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Why Install as App?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Quick access from home screen
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Works offline
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Faster loading times
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Native app-like experience
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Push notifications (coming soon)
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PWAGuide;
