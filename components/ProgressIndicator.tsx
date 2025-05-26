import React from 'react';
import { View, Text } from 'react-native';

interface ProgressIndicatorProps {
  progress: number; // 0 to 1
  variant?: 'timer' | 'score' | 'level';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ProgressIndicator component for displaying progress, timers, and scores
 */
export default function ProgressIndicator({
  progress,
  variant = 'timer',
  showLabel = true,
  label,
  size = 'md',
  className = '',
}: ProgressIndicatorProps) {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Get background and fill colors based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'timer':
        return 'bg-lightBlue';
      case 'score':
        return 'bg-goldAccent';
      case 'level':
        return 'bg-lightPurple';
      default:
        return 'bg-lightBlue';
    }
  };

  const getFillColor = () => {
    switch (variant) {
      case 'timer':
        return 'bg-blueGradientStart';
      case 'score':
        return 'bg-orangeGradientStart';
      case 'level':
        return 'bg-purpleGradientStart';
      default:
        return 'bg-blueGradientStart';
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'timer':
        return 'text-blueGradientEnd';
      case 'score':
        return 'text-orangeGradientEnd';
      case 'level':
        return 'text-purpleGradientEnd';
      default:
        return 'text-blueGradientEnd';
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // Format label if not provided
  const formattedLabel = label || `${Math.round(clampedProgress * 100)}%`;

  return (
    <View className={`${className}`}>
      {showLabel && (
        <Text className={`text-xs font-pmedium mb-1 ${getTextColor()}`}>
          {formattedLabel}
        </Text>
      )}
      <View className={`${getBackgroundColor()} rounded-full w-full ${sizeClasses[size]} overflow-hidden`}>
        <View 
          className={`${getFillColor()} h-full rounded-full`} 
          style={{ width: `${clampedProgress * 100}%` }} 
        />
      </View>
    </View>
  );
}
