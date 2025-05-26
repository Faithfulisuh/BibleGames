import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  variant?: 'purple' | 'blue' | 'green' | 'orange';
  children: React.ReactNode;
  className?: string;
  customColors?: string[];
}

/**
 * GradientBackground component for creating gradient backgrounds
 * Uses predefined gradients from the design system or custom colors
 */
export default function GradientBackground({
  variant = 'purple',
  children,
  className = '',
  customColors,
}: GradientBackgroundProps) {
  // Get gradient colors based on variant
  const getGradientColors = () => {
    if (customColors && customColors.length >= 2) {
      return customColors;
    }
    
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

  return (
    <LinearGradient
      colors={getGradientColors() as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className={`${className}`}
    >
      {children}
    </LinearGradient>
  );
}
