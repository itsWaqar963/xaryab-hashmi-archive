"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 1800;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore storage failures
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [installing, setInstalling] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    const ios = isIosDevice();
    setIosMode(ios);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      deferredRef.current = promptEvent;
      setDeferredPrompt(promptEvent);
      if (!wasRecentlyDismissed() && !isStandalone()) {
        setVisible(true);
      }
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      deferredRef.current = null;
      markDismissed();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    const timer = window.setTimeout(() => {
      if (isStandalone() || wasRecentlyDismissed()) return;
      if (ios || deferredRef.current) {
        setVisible(true);
      }
    }, SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    markDismissed();
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      markDismissed();
      setVisible(false);
      setDeferredPrompt(null);
      deferredRef.current = null;
    } catch {
      setVisible(false);
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt]);

  if (!visible) return null;
  if (!iosMode && !deferredPrompt) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-prompt-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] shadow-2xl shadow-black/50 overflow-hidden install-prompt-panel">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/25">
              <span className="text-white font-bold text-2xl">X</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="install-prompt-title"
                className="text-lg font-semibold text-white leading-snug"
              >
                Install Xaryab Archive
              </h2>
              <p className="mt-1.5 text-sm text-[#A0A0A0] leading-relaxed">
                Add this app to your home screen for faster access and an
                offline-ready experience.
              </p>
            </div>
          </div>

          {iosMode ? (
            <ol className="mt-5 space-y-2.5 text-sm text-[#A0A0A0]">
              <li className="flex gap-2">
                <span className="text-[#8B5CF6] font-semibold">1.</span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button
                  in Safari
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#8B5CF6] font-semibold">2.</span>
                <span>
                  Choose{" "}
                  <strong className="text-white">Add to Home Screen</strong>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#8B5CF6] font-semibold">3.</span>
                <span>
                  Tap <strong className="text-white">Add</strong> to install
                </span>
              </li>
            </ol>
          ) : null}

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 px-4 py-3 rounded-xl border border-[#2A2A2A] text-sm font-medium text-[#A0A0A0] hover:text-white hover:border-[#3A3A3A] transition-colors"
            >
              Not now
            </button>
            {iosMode ? (
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 px-4 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#A855F7] text-sm font-medium text-white shadow-lg shadow-[#8B5CF6]/20 transition-colors"
              >
                Got it
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInstall}
                disabled={installing || !deferredPrompt}
                className="flex-1 px-4 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#A855F7] disabled:opacity-60 text-sm font-medium text-white shadow-lg shadow-[#8B5CF6]/20 transition-colors"
              >
                {installing ? "Installing…" : "Install app"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
