import { useWindowDimensions } from 'react-native';

/**
 * Hook for responsive design
 * Provides utility functions and values for adapting UI to different screen sizes
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Breakpoints (similar to Tailwind CSS)
  const isXs = width < 640;
  const isSm = width >= 640 && width < 768;
  const isMd = width >= 768 && width < 1024;
  const isLg = width >= 1024 && width < 1280;
  const isXl = width >= 1280;

  // Orientation
  const isPortrait = height > width;
  const isLandscape = width > height;

  // Device type approximation
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // Responsive font size helper
  const getFontSize = (base: number, options?: { min?: number; max?: number }) => {
    const { min, max } = { min: base * 0.8, max: base * 1.5, ...options };
    
    // Scale font size based on screen width
    let size = base;
    if (isXs) size = base * 0.8;
    else if (isSm) size = base * 0.9;
    else if (isMd) size = base;
    else if (isLg) size = base * 1.1;
    else if (isXl) size = base * 1.2;
    
    // Clamp between min and max
    return Math.max(min, Math.min(size, max));
  };

  // Responsive spacing helper
  const getSpacing = (base: number, options?: { min?: number; max?: number }) => {
    const { min, max } = { min: base * 0.5, max: base * 2, ...options };
    
    // Scale spacing based on screen width
    let spacing = base;
    if (isXs) spacing = base * 0.7;
    else if (isSm) spacing = base * 0.85;
    else if (isMd) spacing = base;
    else if (isLg) spacing = base * 1.2;
    else if (isXl) spacing = base * 1.5;
    
    // Clamp between min and max
    return Math.max(min, Math.min(spacing, max));
  };

  // Get column count for grid layouts
  const getColumnCount = (baseCount: number) => {
    if (isXs) return Math.max(1, baseCount - 2);
    if (isSm) return Math.max(2, baseCount - 1);
    if (isMd) return baseCount;
    if (isLg) return baseCount + 1;
    return baseCount + 2;
  };

  return {
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isPortrait,
    isLandscape,
    isPhone,
    isTablet,
    isDesktop,
    getFontSize,
    getSpacing,
    getColumnCount,
  };
}
