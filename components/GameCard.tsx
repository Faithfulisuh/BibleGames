import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';

interface GameCardProps {
  title: string;
  description: string;
  onPress: () => void;
  variant?: 'purple' | 'blue' | 'green' | 'orange' | 'gray';
  difficulty?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  stats?: {
    played?: number;
    level?: number;
    bestTime?: string;
  };
  isReady?: boolean;
  useGradient?: boolean;
  className?: string;
}

/**
 * GameCard component for displaying game options on the home screen
 * Enhanced to match the PRD design requirements
 */
export default function GameCard({
  title,
  description,
  onPress,
  variant = 'purple',
  difficulty,
  disabled = false,
  icon,
  badge,
  stats,
  isReady = true,
  useGradient = true,
  className = '',
}: GameCardProps) {
  const { isDark } = useTheme();
  
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
      case 'gray':
        return ['#6B7280', '#4B5563']; // Coming Soon
      default:
        return ['#8B5CF6', '#7C3AED'];
    }
  };

  // Get border color based on variant (for non-gradient cards)
  const getBorderColor = () => {
    switch (variant) {
      case 'purple':
        return 'border-purpleGradientStart';
      case 'blue':
        return 'border-blueGradientStart';
      case 'green':
        return 'border-greenGradientStart';
      case 'orange':
        return 'border-orangeGradientStart';
      case 'gray':
        return 'border-mediumGray';
      default:
        return 'border-purpleGradientStart';
    }
  };

  // If using gradient design (modern style from PRD)
  if (useGradient) {
    return (
      <Pressable 
        className={`mb-4 rounded-xl overflow-hidden shadow-md ${className} ${disabled ? 'opacity-70' : ''}`}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
      >
        <LinearGradient
          colors={getGradientColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3">{icon}</View>
              <Text className="text-white text-xl font-pbold">{title}</Text>
            </View>
            {difficulty && (
              <Text className="text-white text-opacity-80 text-sm">{difficulty}</Text>
            )}
          </View>
        </LinearGradient>
        
        <View className={`p-4 ${isDark ? 'bg-dark-cardBackground' : 'bg-white'}`}>
          <Text className={`mb-2 ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
            {description}
          </Text>
          
          <View className="flex-row items-center justify-between mt-1">
            {stats && (
              <View className="flex-row items-center flex-wrap">
                {stats.played !== undefined && (
                  <View className="flex-row items-center mr-3">
                    <Ionicons 
                      name="game-controller-outline" 
                      size={16} 
                      color={isDark ? '#D1D5DB' : '#6B7280'} 
                      style={{ marginRight: 4 }}
                    />
                    <Text className={`text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
                      {stats.played} played
                    </Text>
                  </View>
                )}
                
                {stats.level !== undefined && (
                  <View className="flex-row items-center mr-3">
                    <Ionicons 
                      name="trophy-outline" 
                      size={16} 
                      color={isDark ? '#D1D5DB' : '#6B7280'} 
                      style={{ marginRight: 4 }}
                    />
                    <Text className={`text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
                      Level {stats.level}
                    </Text>
                  </View>
                )}
                
                {stats.bestTime && (
                  <View className="flex-row items-center">
                    <Ionicons 
                      name="time-outline" 
                      size={16} 
                      color={isDark ? '#D1D5DB' : '#6B7280'} 
                      style={{ marginRight: 4 }}
                    />
                    <Text className={`text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
                      Best: {stats.bestTime}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            <View className="flex-row items-center">
              {badge || (
                <>
                  {isReady ? (
                    <Text className="text-sm text-greenGradientStart mr-1">Ready</Text>
                  ) : (
                    <Text className="text-sm text-orangeGradientStart mr-1">Coming Soon</Text>
                  )}
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={isReady ? '#10B981' : '#F59E0B'} 
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Classic card style (original implementation)
  return (
    <Pressable
      className={`${isDark ? 'bg-dark-cardBackground' : 'bg-white'} rounded-xl shadow-md p-5 mb-4 border-l-4 ${getBorderColor()} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={`text-xl font-pbold ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>{title}</Text>
          </View>
          <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>{description}</Text>
        </View>
        {badge && <View>{badge}</View>}
      </View>
    </Pressable>
  );
}
