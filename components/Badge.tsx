import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { useResponsive } from '../lib/useResponsive';

interface BadgeProps {
  label: string;
  variant?: 'achievement' | 'score' | 'timer' | 'success' | 'info' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Badge component for displaying achievements, scores, and status indicators
 * Supports both light and dark themes and responsive design
 */
export default function Badge({
  label,
  variant = 'achievement',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const { isDark } = useTheme();
  const { isPhone } = useResponsive();

  // Adjust size for smaller screens
  const responsiveSize = isPhone && size === 'lg' ? 'md' : size;

  // Get background color based on variant and theme
  const getBackgroundColor = () => {
    switch (variant) {
      case 'achievement':
      case 'score':
        return isDark ? 'bg-dark-goldAccent' : 'bg-light-goldAccent';
      case 'timer':
      case 'info':
        return isDark ? 'bg-dark-lightBlue' : 'bg-light-lightBlue';
      case 'success':
        return isDark ? 'bg-dark-lightGreen' : 'bg-light-lightGreen';
      case 'warning':
        return isDark ? 'bg-orangeGradientStart bg-opacity-30' : 'bg-orangeGradientStart bg-opacity-20';
      case 'error':
        return isDark ? 'bg-error bg-opacity-30' : 'bg-error bg-opacity-20';
      default:
        return isDark ? 'bg-dark-goldAccent' : 'bg-light-goldAccent';
    }
  };

  // Get text color based on variant and theme
  const getTextColor = () => {
    switch (variant) {
      case 'achievement':
      case 'score':
        return isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary';
      case 'timer':
      case 'info':
        return 'text-blueGradientEnd';
      case 'success':
        return 'text-greenGradientEnd';
      case 'warning':
        return 'text-orangeGradientEnd';
      case 'error':
        return 'text-error';
      default:
        return isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary';
    }
  };

  // Size classes - adjusted for responsive design
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: isPhone ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-base',
  };

  return (
    <View className={`${getBackgroundColor()} rounded-full flex-row items-center ${sizeClasses[responsiveSize]} ${className}`}>
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={`font-pmedium ${getTextColor()}`}>{label}</Text>
    </View>
  );
}
