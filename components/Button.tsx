import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'purple' | 'blue' | 'green' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  gradientColors?: string[];
  iconPosition?: 'left' | 'right';
  className?: string;
}

/**
 * Button component that supports multiple variants, sizes, and states
 * Matches the design system shown in the app mockups
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  gradientColors,
  iconPosition = 'left',
}: ButtonProps) {
  // Size classes
  const sizeClasses = {
    sm: 'py-2 px-3',
    md: 'py-3 px-4',
    lg: 'py-4 px-6',
  };
  
  // Font size classes
  const fontSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Get default gradient colors based on variant
  const getGradientColors = () => {
    if (gradientColors && gradientColors.length >= 2) {
      return gradientColors;
    }

    switch (variant) {
      case 'primary':
        return ['#3B82F6', '#2563EB']; // Blue gradient
      case 'secondary':
      case 'purple':
        return ['#8B5CF6', '#7C3AED']; // Purple gradient
      case 'green':
        return ['#10B981', '#059669']; // Green gradient
      case 'gold':
        return ['#F59E0B', '#D97706']; // Gold/orange gradient
      default:
        return ['#3B82F6', '#2563EB']; // Default blue gradient
    }
  };

  // Get style based on variant for non-gradient buttons
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg';
      case 'text':
        return 'bg-transparent';
      default:
        return 'bg-blueGradientStart rounded-lg';
    }
  };

  // Get text color based on variant
  const getTextColorClass = () => {
    switch (variant) {
      case 'outline':
        return 'text-white';
      case 'text':
        return 'text-blueGradientStart';
      default:
        return 'text-white';
    }
  };

  // Render button content
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && iconPosition === 'left' && <View className="mr-2">{icon}</View>}
          <Text
            className={`font-pbold ${fontSizeClasses[size]} ${getTextColorClass()}`}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View className="ml-2">{icon}</View>}
        </View>
      )}
    </>
  );

  // Use gradient for all main button variants except outline and text
  const useGradient = variant !== 'outline' && variant !== 'text';

  // If using gradient
  if (useGradient && !disabled) {
    return (
      <Pressable
        onPress={!disabled && !loading ? onPress : undefined}
        className={`${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50' : ''}`}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={getGradientColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`${sizeClasses[size]} rounded-full items-center justify-center`}
        >
          {renderContent()}
        </LinearGradient>
      </Pressable>
    );
  }

  // Regular button without gradient
  return (
    <Pressable
      onPress={!disabled && !loading ? onPress : undefined}
      className={`${getVariantClasses()} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} 
      ${disabled ? 'opacity-50' : ''} rounded-full items-center justify-center`}
      disabled={disabled || loading}
    >
      {renderContent()}
    </Pressable>
  );
}
