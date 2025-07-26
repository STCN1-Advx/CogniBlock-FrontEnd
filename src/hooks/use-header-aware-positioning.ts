'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Hook to determine if the current page has a header and provide appropriate positioning
 * @returns Object containing header presence info and positioning styles
 */
export function useHeaderAwarePositioning() {
  const pathname = usePathname();
  
  const hasHeader = useMemo(() => {
    // Canvas pages don't have headers
    return !pathname.startsWith('/canvas/');
  }, [pathname]);
  
  const dialogPositioning = useMemo(() => {
    if (hasHeader) {
      // Adjust for header height (80px = 5rem)
      return {
        top: 'calc(50% + 2.5rem)',
        transform: 'translate(-50%, -50%)',
        maxHeight: 'calc(100vh - 5rem)'
      };
    } else {
      // No header, center normally
      return {
        top: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: 'calc(100vh - 2rem)'
      };
    }
  }, [hasHeader]);
  
  const overlayClasses = useMemo(() => {
    if (hasHeader) {
      return 'fixed inset-0 z-50 bg-black/80 pt-20';
    } else {
      return 'fixed inset-0 z-50 bg-black/80';
    }
  }, [hasHeader]);
  
  return {
    hasHeader,
    dialogPositioning,
    overlayClasses
  };
}