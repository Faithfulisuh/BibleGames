import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'achievement' | 'progress' | 'success' | 'verse';
  accentColor?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

/**
 * Card component that can be used for game cards, achievements, and other content displays
 */
export default function Card({
  title,
  description,
  children,
  onPress,
  variant = 'default',
  accentColor,
  footer,
  header,
  className = '',
}: CardProps) {
  // Get variant-specific styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'achievement':
        return 'bg-white border-l-4 border-goldAccent';
      case 'progress':
        return 'bg-white border-l-4 border-lightBlue';
      case 'success':
        return 'bg-white border-l-4 border-lightGreen';
      case 'verse':
        return 'bg-white border-l-4 border-lightPurple';
      default:
        return 'bg-white';
    }
  };

  // Get custom accent color border if provided
  const accentBorder = accentColor ? `border-l-4 ${accentColor}` : '';

  // Wrapper component - Pressable if onPress is provided, View otherwise
  const Wrapper = onPress ? Pressable : View;
  
  // Additional props for Pressable
  const pressableProps = onPress ? { onPress } : {};

  return (
    <Wrapper
      className={`${getVariantClasses()} ${accentBorder} rounded-xl shadow-md p-5 mb-4 ${className}`}
      {...pressableProps}
    >
      {header && <View className="mb-3">{header}</View>}
      
      {title && (
        <Text className="text-xl font-pbold text-textPrimary mb-2">{title}</Text>
      )}
      
      {description && (
        <Text className="text-textSecondary mb-3">{description}</Text>
      )}
      
      {children && <View>{children}</View>}
      
      {footer && <View className="mt-3">{footer}</View>}
    </Wrapper>
  );
}
