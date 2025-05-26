import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AchievementProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'success' | 'info' | 'warning';
  className?: string;
}

/**
 * Achievement component for displaying unlocked achievements
 */
export default function Achievement({
  title,
  description,
  icon,
  variant = 'success',
  className = '',
}: AchievementProps) {
  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'success':
        return ['#10B981', '#059669']; // Green gradient
      case 'info':
        return ['#3B82F6', '#2563EB']; // Blue gradient
      case 'warning':
        return ['#F59E0B', '#D97706']; // Orange gradient
      default:
        return ['#10B981', '#059669']; // Default green gradient
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors() as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className={`rounded-lg p-4 ${className}`}
    >
      <View className="flex-row items-center">
        {icon && <View className="mr-3">{icon}</View>}
        <View>
          <Text className="text-white font-pbold text-base">{title}</Text>
          {description && (
            <Text className="text-white text-sm opacity-80">{description}</Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
