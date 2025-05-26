import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ThemeToggle component for switching between light and dark themes
 */
export default function ThemeToggle({
  showLabel = false,
  size = 'md',
  className = '',
}: ThemeToggleProps) {
  const { isDark, toggleTheme, themeMode } = useTheme();

  // Size classes
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <View className={`flex-row items-center ${className}`}>
      <Pressable
        onPress={toggleTheme}
        className={`${sizeClasses[size]} rounded-full ${
          isDark ? 'bg-dark-surface' : 'bg-light-surface'
        }`}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={iconSizes[size]}
          color={isDark ? '#F9FAFB' : '#F59E0B'}
        />
      </Pressable>
      
      {showLabel && (
        <Text
          className={`ml-2 ${
            isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
          }`}
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
          {themeMode === 'system' && ' (System)'}
        </Text>
      )}
    </View>
  );
}
