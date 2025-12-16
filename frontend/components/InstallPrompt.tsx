"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Monitor } from "lucide-react";

interface InstallPromptProps {
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

export default function InstallPrompt({ 
  showOnMobile = true, 
  showOnDesktop = false 
}: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    );

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt based on device type
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if ((isMobile && showOnMobile) || (!isMobile && showOnDesktop)) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [showOnMobile, showOnDesktop]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store in localStorage to not show again for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-lg shadow-lg border border-orange-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Smartphone className="w-8 h-8 text-orange-500" />
            ) : (
              <Monitor className="w-8 h-8 text-orange-500" />
            )}
            <div>
              <h3 className="font-bold text-gray-900">
                Install SmartAPD™
              </h3>
              <p className="text-sm text-gray-600">
                {isMobile 
                  ? "Install aplikasi untuk akses cepat dari home screen"
                  : "Install untuk akses cepat dari desktop"
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Later
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          {isMobile ? (
            <>
              <strong>Android:</strong> Tap &quot;Install&quot; → Add to home screen<br/>
              <strong>iOS:</strong> Tap share → &quot;Add to Home Screen&quot;
            </>
          ) : (
            <>
              <strong>Chrome:</strong> Click install button<br/>
              <strong>Other:</strong> Menu → &quot;Install app&quot;
            </>
          )}
        </div>
      </div>
    </div>
  );
}
