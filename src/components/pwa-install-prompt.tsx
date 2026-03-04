"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (
      typeof window === "undefined" ||
      window.matchMedia("(display-mode: standalone)").matches ||
      localStorage.getItem("pwa-install-dismissed") === "true"
    ) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("pwa-install-dismissed", "true");
    }
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl bg-[#0a4a36] text-white shadow-2xl border border-emerald-700/50 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-72.png" alt="Deenify" className="h-7 w-7 rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">Install Deenify</p>
          <p className="text-xs text-emerald-200 leading-tight mt-0.5">Add to your home screen for quick access</p>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white gap-1 px-3 h-8 text-xs font-semibold"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-emerald-200" />
        </button>
      </div>
    </div>
  );
}
