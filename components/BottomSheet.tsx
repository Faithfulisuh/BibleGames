import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  actions: {
    text: string;
    onPress: () => void;
    primary?: boolean;
  }[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  title,
  message,
  type = 'info',
  actions,
}) => {
  const { height } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, height, slideAnim, backdropOpacity]);

  if (!isVisible) return null;

  // Get color based on type
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', bgColor: 'bg-success', borderColor: 'border-green-600' };
      case 'error':
        return { icon: '❌', bgColor: 'bg-error', borderColor: 'border-red-600' };
      default:
        return { icon: 'ℹ️', bgColor: 'bg-primary', borderColor: 'border-primary' };
    }
  };

  const { icon, bgColor, borderColor } = getIconAndColor();

  return (
    <View className="absolute inset-0 justify-end">
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          opacity: backdropOpacity,
        }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>
      
      <Animated.View
        style={{ transform: [{ translateY: slideAnim }] }}
        className={`bg-white rounded-t-3xl px-5 pt-6 pb-10 shadow-lg border-t-4 ${borderColor}`}
      >
        <View className="flex-row items-center mb-4">
          <Text className="text-3xl mr-2">{icon}</Text>
          <Text className="text-2xl font-pbold text-textPrimary flex-1">{title}</Text>
        </View>
        
        {message && (
          <Text className="text-lg text-textPrimary mb-6">{message}</Text>
        )}
        
        <View className="flex-row justify-end space-x-3">
          {actions.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              className={`px-5 py-3 rounded-xl ${action.primary ? bgColor : 'bg-gray-200'}`}
            >
              <Text className={`font-pbold text-textDark`}>
                {action.text}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default BottomSheet;
