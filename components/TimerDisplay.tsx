import React from 'react';
import { View, Text } from 'react-native';

interface TimerDisplayProps {
  seconds: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

/**
 * TimerDisplay component for showing countdown timers in games
 */
export default function TimerDisplay({
  seconds,
  size = 'md',
  variant = 'default',
  showLabel = true,
  className = '',
}: TimerDisplayProps) {
  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Get text color based on variant and time remaining
  const getTextColor = () => {
    switch (variant) {
      case 'warning':
        return 'text-warning';
      case 'danger':
        return 'text-error';
      default:
        return 'text-blueGradientEnd';
    }
  };

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'warning':
        return 'bg-warning bg-opacity-10';
      case 'danger':
        return 'bg-error bg-opacity-10';
      default:
        return 'bg-lightBlue';
    }
  };

  return (
    <View className={`${getBackgroundColor()} rounded-lg px-3 py-2 ${className}`}>
      <Text className={`font-pbold ${sizeClasses[size]} ${getTextColor()} text-center`}>
        {formatTime(seconds)}
      </Text>
      {showLabel && (
        <Text className={`font-pmedium text-xs ${getTextColor()} text-center opacity-80`}>
          Time Remaining
        </Text>
      )}
    </View>
  );
}
