import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'blue' | 'green';
  badge?: React.ReactNode;
  className?: string;
  isPersonalBest?: boolean;
}

/**
 * ScoreDisplay component for showing player scores and achievements
 * Matches the design shown in the game results screens
 */
export default function ScoreDisplay({
  score,
  label = 'Total Score',
  size = 'md',
  variant = 'gold',
  badge,
  className = '',
  isPersonalBest = false,
}: ScoreDisplayProps) {
  // Size classes
  const containerSizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const scoreSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'gold':
        return ['#F59E0B', '#D97706']; // Gold/orange gradient
      case 'blue':
        return ['#3B82F6', '#2563EB']; // Blue gradient
      case 'green':
        return ['#10B981', '#059669']; // Green gradient
      default:
        return ['#F59E0B', '#D97706']; // Default gold gradient
    }
  };

  const renderContent = () => (
    <View className={`items-center justify-center ${containerSizeClasses[size]} ${className}`}>
      <Text className={`font-pbold ${scoreSizeClasses[size]} text-white`}>
        {score.toLocaleString()}
      </Text>
      <View className="flex-row items-center">
        <Text className={`font-pmedium ${labelSizeClasses[size]} text-white text-opacity-80`}>
          {label}
        </Text>
        {isPersonalBest && (
          <View className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
            <Text className="text-xs text-white">New Personal Best!</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={getGradientColors() as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="rounded-lg"
    >
      {renderContent()}
    </LinearGradient>
  );
}
