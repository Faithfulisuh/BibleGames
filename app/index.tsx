import { Ionicons } from "@expo/vector-icons";
import { Account, Client } from "appwrite";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BottomSheet from "../components/BottomSheet";
import GameCard from "../components/GameCard";
import ProgressIndicator from "../components/ProgressIndicator";
import ThemeToggle from "../components/ThemeToggle";
import { config, loadUserProgress, logout, saveUserProgress } from "../lib/appwrite";
import { useGameProgress } from "../lib/GameProgressContext";
import { useGameState } from "../lib/gameState"; // Added import for game state
import { useTheme } from "../lib/ThemeContext";
import { useResponsive } from "../lib/useResponsive";


// Game selection enum
enum GAMES {
  MATCH_THE_VERSE = "match-the-verse",
  GUESS_THE_CHARACTER = "guess_the_character",
  REVIEWS = "reviews",
}

// DailyChallenge component for the home screen
const DailyChallenge: React.FC<{
  verse: string;
  timeLeft: string;
  percentComplete: number;
  onPress: () => void;
}> = ({ verse, timeLeft, percentComplete, onPress }) => {
  return (
    <Pressable
      className="mb-6 rounded-xl overflow-hidden shadow-md"
      onPress={onPress}
    >
      <LinearGradient
        colors={["#F59E0B", "#EC4899"] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-4"
      >
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white text-xl font-pbold">Daily Challenge</Text>
          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={16}
              color="white"
              style={{ marginRight: 4 }}
            />
            <Text className="text-white">{timeLeft} left</Text>
          </View>
        </View>

        <Text className="text-white text-opacity-80 mb-2">{verse}</Text>

        <ProgressIndicator
          progress={percentComplete / 100}
          variant="score"
          label={`${percentComplete}% complete`}
        />
      </LinearGradient>
    </Pressable>
  );
};

const HomeScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isPhone, isTablet } = useResponsive();
  const { progress } = useGameProgress();
  const { gameData } = useGameState(); // Added gameState hook
  const userLevel = progress["Guess the Character"]?.level || 1;
  const [isLoggedIn, setIsLoggedIn] = useState(false); // default to not logged in
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });
  // Save current game's progress to Appwrite when it changes and user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    // Get current user ID
    const client = new Client();
    client.setEndpoint(config.endpoint).setProject(config.projectId);
    const account = new Account(client);
    account.get().then(user => {
      // Save only the current game's progress (e.g., "Guess the Character")
      // You can change this to the relevant game key as needed
      const gameKey = "Guess the Character";
      if (progress[gameKey]) {
        saveUserProgress(user.$id, { [gameKey]: progress[gameKey] });
      }
    });
  }, [progress["Guess the Character"], isLoggedIn]);

  // Appwrite session check and load progress
  const { updateProgress } = useGameProgress();
  useEffect(() => {
    const client = new Client();
    client.setEndpoint(config.endpoint).setProject(config.projectId);
    const account = new Account(client);
    account.get().then(
      async (user) => {
        setIsLoggedIn(true);
        // Load user progress from Appwrite and update context
        try {
          const progress = await loadUserProgress(user.$id);
          if (progress) {
            // Only update progress for known games
            const allowedGames = [
              "Guess the Character",
              "Match the Verse",
              "Reviews"
            ];
            Object.entries(progress).forEach(([game, data]) => {
              if (allowedGames.includes(game)) {
                updateProgress(game as any, data as Partial<Record<string, any>>);
              }
            });
          }
        } catch (e) {
          // No progress found or error
        }
      },
      () => setIsLoggedIn(false)
    );
  }, []);

  // Save current game's progress to Appwrite when it changes and user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    // Get current user ID
    const client = new Client();
    client.setEndpoint(config.endpoint).setProject(config.projectId);
    const account = new Account(client);
    account.get().then(user => {
      // Save only the current game's progress (e.g., "Guess the Character")
      // You can change this to the relevant game key as needed
      const gameKey = "Guess the Character";
      if (progress[gameKey]) {
        saveUserProgress(user.$id, { [gameKey]: progress[gameKey] });
      }
    });
  }, [progress["Guess the Character"], isLoggedIn]);


  // Handle game selection
  const handleGameSelect = (gameId: string) => {
    switch (gameId) {
      case "match-the-verse":
        router.push("/match-the-verse");
        break;
      case "guess-the-character":
        router.push("/guess-the-character");
        break;
      case "daily-challenge":
        // Will be implemented later
        setBottomSheetContent({
          title: "Coming Soon",
          message: "Daily challenges are coming soon!",
          type: "info",
        });
        setBottomSheetVisible(true);
        break;
      default:
        console.log(`Unknown game: ${gameId}`);
    }
  };

  // Handle daily challenge
  const handleDailyChallenge = () => {
    // Navigate to the daily challenge - commented out until developed
    // router.push({ pathname: 'daily-challenge' } as any);
    setBottomSheetContent({
      title: "Daily Challenge",
      message:
        "Daily Challenge feature is coming soon! Complete daily challenges to earn extra shekels and unlock special achievements.",
      type: "info",
    });
    setBottomSheetVisible(true);
  };

  const handleAuth = async () => {
    if (isLoggedIn) {
      // Logout
      try {
        await logout();
        // Re-check session to ensure it's closed
        const client = new Client();
        client.setEndpoint(config.endpoint).setProject(config.projectId);
        const account = new Account(client);
        try {
          await account.get();
          setIsLoggedIn(true); // still logged in
        } catch {
          setIsLoggedIn(false); // session closed
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        // Optionally show error
      }
    } else {
      // Login (navigate to sign-in)
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <View
      className={`flex-1 ${
        isDark ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      {/* Header */}
      <View className="pt-12 pb-4 px-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="h-10 w-10 bg-purpleGradientStart rounded-lg items-center justify-center mr-3">
            <Image source={require('../assets/images/icon.png')} style={{ width: 60, height: 60 }} className="rounded-3xl mr-2" />
          </View>
          <View className="flex-row items-center">
            <Text
              className={`text-2xl font-pblack mr-2 ${
                isDark ? "text-dark-textPrimary" : "text-light-textPrimary"
              }`}
            >
              Word Bits
            </Text>
            {/* <View className="bg-purpleGradientStart bg-opacity-20 px-2 py-1 rounded-md">
              <Text className="text-purpleGradientStart text-xs font-pmedium">
                {userLevel >= 10
                  ? "Advanced"
                  : userLevel >= 5
                  ? "Intermediate"
                  : "Beginner"}
              </Text>
            </View> */}
          </View>
        </View>

        <View className="flex-row items-center gap-x-1">
          <ThemeToggle />
          <TouchableOpacity onPress={handleAuth}>
            <Text className="font-psemibold text-blue-600">{isLoggedIn ? 'Logout' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Daily Challenge
        <DailyChallenge
          verse="In the beginning God created the heavens and the earth..."
          timeLeft="8h 23m"
          percentComplete={progress["Daily Challenge"]?.percentComplete || 0}
          onPress={handleDailyChallenge}
        /> */}

        <Text
          className={`text-xl font-pbold mb-4 ${
            isDark ? "text-dark-textPrimary" : "text-light-textPrimary"
          }`}
        >
          Choose Your Game
        </Text>

        {/* Match the Verse */}
        <GameCard
          title="Match the Verse"
          description="Match each card to their corresponding verses"
          difficulty="Not specified"
          icon={
            <Ionicons name="extension-puzzle-outline" size={24} color="white" />
          }
          variant="purple"
          stats={{
            // played: gameData.totalScore || 0, // Using totalScore as played games indicator
            level: gameData.level || 1, // Using level from gameData
          }}
          onPress={() => router.push({ pathname: "match-the-verse" } as any)}
        />

        {/* Guess the Character */}
        <GameCard
          title="Guess the Character"
          description="Identify Bible characters and places from clues"
          difficulty="Not specified"
          icon={<Ionicons name="search" size={24} color="white" />}
          variant="blue"
          stats={{
            played:
              progress["Guess the Character"]?.completedLevels?.length || 0,
            level: progress["Guess the Character"]?.level || 1,
          }}
          onPress={() => {
            router.push({ pathname: "guess-the-character" } as any);
          }}
        />

        {/* Community Reviews */}
        <GameCard
          title="Community Chat"
          description="Share your experience and read what others say"
          difficulty="All Users"
          icon={<Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />}
          variant="green"
          stats={{
            played: progress["Reviews"]?.completedLevels?.length || 0,
          }}
          onPress={() => {
            router.push({ pathname: "reviews" } as any);
          }}
        />

        {/* Coming Soon Games */}
        <GameCard
          title="Bible Trivia"
          description="Test your knowledge with multiple-choice questions about Bible facts, stories, and characters"
          difficulty="All Levels"
          icon={<Ionicons name="help-circle" size={24} color="white" />}
          variant="gray"
          isReady={false}
          onPress={() => {}}
        />

        <GameCard
          title="Scripture Memory"
          description="Games to help memorize Bible verses through interactive challenges"
          difficulty="All Levels"
          icon={<Ionicons name="bookmark" size={24} color="white" />}
          variant="gray"
          isReady={false}
          onPress={() => {}}
        />
        <TouchableOpacity onPress={handleAuth}>
          <Text className="font-psemibold text-blue-600">{isLoggedIn ? 'Logout' : 'Login'}</Text>
        </TouchableOpacity>

        {/* Bottom padding */}
        <View className="pb-8" />
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet
        isVisible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title={bottomSheetContent.title}
        message={bottomSheetContent.message}
        type={bottomSheetContent.type}
        actions={[
          {
            text: "OK",
            onPress: () => setBottomSheetVisible(false),
            primary: true,
          },
        ]}
      />

      {/* Bottom padding for scrolling */}
      <View className="pb-20" />
    </View>
  );
};

export default HomeScreen;
