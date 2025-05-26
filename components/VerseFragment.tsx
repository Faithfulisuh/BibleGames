import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface VerseFragmentProps {
  text: string;
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isDragTarget?: boolean;
  isDropZone?: boolean;
  placeholder?: string;
}

/**
 * VerseFragment component for displaying Bible verse fragments in puzzle games
 */
export default function VerseFragment({
  text,
  onPress,
  onLongPress,
  selected = false,
  disabled = false,
  size = 'md',
  className = '',
  isDragTarget = false,
  isDropZone = false,
  placeholder = 'Drop verse fragment here',
}: VerseFragmentProps) {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-5 py-4',
  };

  // Font size classes
  const fontSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Get background color based on state
  const getBackgroundColor = () => {
    if (isDropZone) return 'bg-white bg-opacity-5';
    if (disabled) return 'bg-subtleBackground';
    if (selected) return 'bg-lightPurple';
    return 'bg-lightPurple';
  };

  // Get border color and style based on state
  const getBorderStyle = () => {
    if (isDropZone) return 'border border-dashed border-mediumGray border-opacity-30';
    if (disabled) return 'border border-subtleBackground';
    if (selected) return 'border border-purpleGradientStart';
    return '';
  };

  // Get text color based on state
  const getTextColor = () => {
    if (isDropZone) return 'text-mediumGray text-opacity-50';
    if (disabled) return 'text-textSecondary';
    if (selected) return 'text-purpleGradientEnd';
    return 'text-textPrimary';
  };

  // Wrapper component - Pressable if onPress is provided, View otherwise
  const Wrapper = onPress && !disabled ? Pressable : View;
  
  // Additional props for Pressable
  const pressableProps = !disabled ? {
    ...(onPress ? { onPress } : {}),
    ...(onLongPress ? { onLongPress } : {}),
  } : {};

  // Content to display
  const displayText = isDropZone && !text ? placeholder : text;

  return (
    <Wrapper
      className={`${getBackgroundColor()} ${getBorderStyle()} rounded-lg ${sizeClasses[size]} ${className} ${isDropZone ? 'mb-3' : ''}`}
      {...pressableProps}
    >
      <Text 
        className={`${fontSizeClasses[size]} ${getTextColor()} text-center ${isDropZone ? 'opacity-50' : ''}`}
        numberOfLines={1}
      >
        {displayText}
      </Text>
    </Wrapper>
  );
}
