import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/ThemeContext';
import { useGameState } from '../../lib/gameState'; // Updated import path

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { gameData } = useGameState();

  const handleStartGame = () => {
    router.push('/match-the-verse/game');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <View className="flex-1 justify-center p-4">
        <View className="w-full max-w-md">
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-2xl p-4 mb-6"
          >
            <Text className="text-2xl font-pbold text-white text-center">
              Match the Verse
            </Text>
            <Text className="text-purple-100 text-sm mt-1 text-center">
              Learn Scripture Through Play
            </Text>
          </LinearGradient>

          <View className="flex-row justify-between mb-6">
            <View className="bg-orangeGradientStart rounded-xl p-3 items-center flex-1 mx-1">
              <Ionicons name="trophy-outline" size={24} color="white" />
              <Text className="text-white text-xs font-pmedium mt-1">Level</Text>
              <Text className="text-white text-xl font-pbold">{gameData.level}</Text>
            </View>
            <View className="bg-greenGradientStart rounded-xl p-3 items-center flex-1 mx-1">
              <Ionicons name="star-outline" size={24} color="white" />
              <Text className="text-white text-xs font-pmedium mt-1">Score</Text>
              <Text className="text-white text-xl font-pbold">{gameData.totalScore}</Text>
            </View>
            <View className="bg-error rounded-xl p-3 items-center flex-1 mx-1">
              <Ionicons name="flame-outline" size={24} color="white" />
              <Text className="text-white text-xs font-pmedium mt-1">Streak</Text>
              <Text className="text-white text-xl font-pbold">{gameData.streak}</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className={`text-lg font-psemibold text-center ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
              Recent Achievements
            </Text>
            <View className="bg-subtleBackground rounded-xl p-4 min-h-[80px] items-center justify-center">
              {gameData.achievements.length > 0 ? (
                <View className="items-center">
                  <Ionicons name="star" size={32} color="#F59E0B" />
                  <Text className={`text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
                    {gameData.achievements[gameData.achievements.length - 1]}
                  </Text>
                </View>
              ) : (
                <Text className={`text-sm text-center ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
                  Complete levels to unlock achievements!
                </Text>
              )}
            </View>
          </View>

          <Pressable
            onPress={handleStartGame}
            className="bg-purpleGradientStart rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white text-lg font-pbold ml-2">Start Game</Text>
          </Pressable>

          <Text className={`text-sm text-center mt-6 ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
            Match the first half of Bible verses with their second half to earn points and progress through levels!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
