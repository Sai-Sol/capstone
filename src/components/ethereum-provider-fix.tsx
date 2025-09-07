"use client";

import { useEffect } from 'react';

/**
 * Ethereum Provider Conflict Resolution Component
 * 
 * This component prevents the "Cannot set property ethereum" error
 * by implementing safe ethereum provider access patterns.
 */
export default function EthereumProviderFix() {
  useEffect(() => {
    // Prevent ethereum property conflicts
    const preventEthereumConflicts = () => {
      if (typeof window === 'undefined') return;

      try {
        // Store original ethereum reference
        const originalEthereum = window.ethereum;
        
        // Create a safe descriptor that prevents overwrites
        Object.defineProperty(window, 'ethereum', {
          get() {
            return originalEthereum;
          },
          set(value) {
            // Log attempts to override but don't actually set
            console.warn('Prevented ethereum provider override to avoid conflicts');
            return true;
          },
          configurable: false,
          enumerable: true
        });

        console.log('✅ Ethereum provider conflict prevention activated');
      } catch (error) {
        console.warn('Could not set up ethereum provider protection:', error);
      }
    };

    // Apply fix after a short delay to ensure all extensions are loaded
    const timer = setTimeout(preventEthereumConflicts, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}