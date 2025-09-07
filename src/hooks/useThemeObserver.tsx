
'use client';

import { useEffect } from 'react';

// Define the structure of the Android bridge on the window object for TypeScript
declare global {
  interface Window {
    AndroidThemeBridge?: {
      onThemeChanged?: (theme: 'light' | 'dark') => void;
    };
  }
}

/**
 * Notifies the Android WebView when the theme changes.
 * @param theme The new theme value from the `data-theme` attribute.
 */
function notifyAndroidOfThemeChange(theme: string | null) {
  if (window.AndroidThemeBridge && typeof window.AndroidThemeBridge.onThemeChanged === 'function') {
    // Map web themes to a simpler 'light' or 'dark' for the native app
    const nativeTheme = theme === 'dark' ? 'dark' : 'light';
    window.AndroidThemeBridge.onThemeChanged(nativeTheme);
    console.log(`Notified Android: Theme changed to ${nativeTheme}`);
  }
}

/**
 * A custom React hook that observes changes to the `data-theme` attribute
 * on the <html> element and notifies an Android WebView bridge.
 */
export function useThemeObserver() {
  useEffect(() => {
    // Ensure this code only runs on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const targetNode = document.documentElement;

    // Initial check in case the theme is already set on load
    const initialTheme = targetNode.getAttribute('data-theme');
    notifyAndroidOfThemeChange(initialTheme);

    // Create a new observer instance linked to the callback function
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = (mutation.target as HTMLElement).getAttribute('data-theme');
          notifyAndroidOfThemeChange(newTheme);
        }
      }
    });

    // Start observing the target node for configured mutations
    observer.observe(targetNode, { attributes: true });

    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount
}
