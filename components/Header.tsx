import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'purple' | 'blue' | 'green' | 'orange';
  transparent?: boolean;
}

/**
 * Header component for app screens with optional back button and right element
 */
export default function Header({
  title,
  subtitle,
  onBack,
  rightElement,
  variant = 'purple',
  transparent = false,
}: HeaderProps) {
  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'purple':
        return ['#8B5CF6', '#7C3AED']; // Bible Verse Puzzle
      case 'blue':
        return ['#3B82F6', '#2563EB']; // Guess the Verse
      case 'green':
        return ['#10B981', '#059669']; // Community Reviews
      case 'orange':
        return ['#F59E0B', '#D97706']; // Daily Challenge
      default:
        return ['#8B5CF6', '#7C3AED'];
    }
  };

  const renderContent = () => (
    <View className="pt-12 pb-4 px-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {onBack && (
            <Pressable onPress={onBack} className="mr-3">
              <Text className="text-white text-sm font-pregular">⬅️ back</Text>
            </Pressable>
          )}
          <View className="flex-1">
            <Text className="text-white text-2xl font-pbold" numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text className="text-white text-sm opacity-80 mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightElement && <View>{rightElement}</View>}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View className="bg-transparent">
        {renderContent()}
      </View>
    );
  }

  return (
    <LinearGradient colors={getGradientColors() as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      {renderContent()}
    </LinearGradient>
  );
}
