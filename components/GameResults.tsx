import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Achievement from "./Achievement";
import Button from "./Button";
import ProgressIndicator from "./ProgressIndicator";
import ScoreDisplay from "./ScoreDisplay";

interface GameResultsProps {
  gameType: "Match the Verse" | "Guess the Character";
  level?: number;
  reference?: string;
  verseText?: string;
  score: number;
  isPersonalBest?: boolean;
  time?: string;
  accuracy?: number;
  hintsUsed?: number;
  maxHints?: number;
  shekelsEarned?: number;
  achievements?: { title: string; description: string }[];
  levelProgress?: { current: number; next: number; percentage: number };
  onPlayAgain: () => void;
  onNextVerse?: () => void;
  onRetryLevel?: () => void;
  onHome: () => void;
  inspirationalVerse?: { text: string; reference: string };
}

/**
 * GameResults component for displaying game completion results
 * Matches the design shown in the results screens
 */
export default function GameResults({
  gameType,
  level,
  reference,
  verseText,
  score,
  isPersonalBest = false,
  time,
  accuracy,
  hintsUsed = 0,
  maxHints = 3,
  shekelsEarned = 0,
  achievements = [],
  levelProgress,
  onPlayAgain,
  onNextVerse,
  onRetryLevel,
  onHome,
  inspirationalVerse,
}: GameResultsProps) {
  // Determine the background gradient based on game type
  const getGameGradient = () => {
    switch (gameType) {
      case "Match the Verse":
        return "purple";
      case "Guess the Character":
        return "blue";
      default:
        return "purple";
    }
  };

  return (
    <View className="flex-1 bg-white space-y-4">
      {/* Header */}
      <View className="bg-white p-4 flex-row items-center justify-between">
        <Pressable onPress={onHome}>
          <Ionicons name="home" size={24} color="#374151" />
        </Pressable>
        <Text className="text-xl font-pbold text-textPrimary">
          Game Results
        </Text>
        <Pressable>
          <Ionicons name="share-outline" size={24} color="#374151" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-4 space-y-4">
        {/* Success icon */}
        <View className="items-center mb-4">
          <View className="h-16 w-16 bg-purpleGradientStart rounded-full items-center justify-center mb-2">
            <Ionicons name="trophy" size={32} color="white" />
          </View>
          <Text className="text-2xl font-pbold text-textPrimary">
            Great Job!
          </Text>
          <View className="bg-purpleGradientStart px-3 py-1 rounded-full mt-1">
            <Text className="text-white text-sm">
              {gameType} • Level {level}
            </Text>
          </View>
        </View>

        {/* Scripture reference */}
        {reference && (
          <View className="bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="book-outline"
                size={18}
                color="#6B7280"
                className="mr-2"
              />
              <Text className="text-textSecondary">Scripture Reference</Text>
            </View>
            <Text className="text-textPrimary font-pbold text-lg mb-1">
              {reference}
            </Text>
            {verseText && (
              <Text className="text-textPrimary italic">"{verseText}"</Text>
            )}
          </View>
        )}

        {/* Score */}
        <ScoreDisplay
          score={score}
          isPersonalBest={isPersonalBest}
          className="mb-4"
        />

        {/* Stats */}
        <View className="flex-row mb-4">
          {time && (
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20 mr-2">
              <View className="items-center">
                <Ionicons
                  name="time-outline"
                  size={24}
                  color="#3B82F6"
                  className="mb-1"
                />
                <Text className="text-xl font-pbold text-textPrimary">
                  {time}
                </Text>
                <Text className="text-textSecondary text-sm">Time</Text>
              </View>
            </View>
          )}

          {accuracy !== undefined && (
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20 ml-2">
              <View className="items-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#10B981"
                  className="mb-1"
                />
                <Text className="text-xl font-pbold text-textPrimary">
                  {accuracy}%
                </Text>
                <Text className="text-textSecondary text-sm">Accuracy</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats row for hints and shekels */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20 mr-2">
            <View className="items-center">
              <Ionicons
                name="bulb-outline"
                size={24}
                color="#F59E0B"
                className="mb-1"
              />
              <Text className="text-xl font-pbold text-textPrimary">
                {hintsUsed}
              </Text>
              <Text className="text-textSecondary text-sm">Hints Used</Text>
            </View>
          </View>

          <View className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20 ml-2">
            <View className="items-center">
              <Ionicons
                name="cash-outline"
                size={24}
                color="#F59E0B"
                className="mb-1"
              />
              <Text className="text-xl font-pbold text-textPrimary">
                {shekelsEarned}
              </Text>
              <Text className="text-textSecondary text-sm">Shekels Earned</Text>
              {shekelsEarned === 0 && (
                <Text className="text-xs text-textSecondary text-center mt-1 italic">
                  In-game currency coming soon
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Achievements */}
        {achievements.length > 0 && (
          <View className="mb-4">
            {achievements.map((achievement, index) => (
              <Achievement
                key={index}
                title={achievement.title}
                description={achievement.description}
                icon={<Ionicons name="ribbon" size={24} color="white" />}
                className="mb-2"
              />
            ))}
          </View>
        )}

        {/* Level progress */}
        {levelProgress && (
          <View className="bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20 mb-4">
            <Text className="text-textPrimary font-pmedium mb-2">
              Level Progress
            </Text>
            <ProgressIndicator
              progress={levelProgress.percentage / 100}
              variant="level"
              label={`${levelProgress.percentage}% to Level ${levelProgress.next}`}
              size="md"
            />
          </View>
        )}

        {/* Action buttons */}
        <View className="mt-auto">
          <Button
            title="Next Level"
            onPress={onPlayAgain}
            variant="purple"
            fullWidth
            className="mb-3"
          />

          <View className="flex-row">
            <Button
              title="Retry Level"
              onPress={onRetryLevel || onPlayAgain}
              variant="outline"
              className="flex-1 mr-2"
              icon={<Ionicons name="refresh" size={18} color="white" />}
            />
            <Button
              title="Home"
              onPress={onHome}
              variant="outline"
              className="flex-1 ml-2"
              icon={<Ionicons name="home" size={18} color="white" />}
            />
          </View>
        </View>

        {/* Inspirational verse */}
        {inspirationalVerse && (
          <View className="mt-6 mb-4">
            <Text className="text-textPrimary text-center italic">
              "{inspirationalVerse.text}"
            </Text>
            <Text className="text-textSecondary text-center mt-1">
              {inspirationalVerse.reference}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const ScrollView = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <View className={`flex-1 ${className}`}>{children}</View>;
