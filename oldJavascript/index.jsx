import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import BibleVersePuzzle from "../bibleVersePuzzle/BibleVersePuzzle";

// Game selection enum
const GAMES = {
  HOME: "home",
  BIBLE_VERSE_PUZZLE: "bible_verse_puzzle",
  // Add more games here in the future
};

// Game card component
function GameCard({ title, description, onPress, color }) {
  return (
    <Pressable
      className={`bg-cardBg rounded-xl shadow-md p-5 mb-4 border-l-4 ${color}`}
      onPress={onPress}
    >
      <Text className="text-xl font-pbold text-textDark mb-2">{title}</Text>
      <Text className="text-textMedium">{description}</Text>
    </Pressable>
  );
}

export default function Index() {
  const [currentGame, setCurrentGame] = useState(GAMES.HOME);

  // Function to go back to home screen
  const goHome = () => setCurrentGame(GAMES.HOME);

  // Render the selected game
  if (currentGame === GAMES.BIBLE_VERSE_PUZZLE) {
    return (
      <View className="flex-1">
        <View className="bg-primary pt-12 pb-4 px-4 flex-row items-center">
          <Pressable onPress={goHome} className="mr-3">
            <Text className="text-white text-sm font-pregular">⬅️ back</Text>
          </Pressable>
          <Text className="text-white text-3xl font-pbold">
            Bible Verse Puzzle
          </Text>
        </View>
        <BibleVersePuzzle />
      </View>
    );
  }

  // Home screen with game selection
  return (
    <View className="flex-1 bg-background">
      <View className="bg-primary pt-12 pb-6 px-4">
        <Text className="text-white text-2xl font-pbold text-center">
          Bible Games
        </Text>
        <Text className="text-white opacity-80 text-center mt-1">
          Select a game to play
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <GameCard
          title="Bible Verse Puzzle"
          description="Arrange scrambled Bible verses in the correct order. Test your knowledge of Scripture with this fun challenge!"
          onPress={() => setCurrentGame(GAMES.BIBLE_VERSE_PUZZLE)}
          color="border-secondary"
        />

        {/* Placeholder for future games */}
        <View className="bg-cardBg rounded-xl shadow-md p-5 mb-4 opacity-50 border-l-4 border-gray-300">
          <Text className="text-xl font-pbold text-textDark mb-2">
            More Games Coming Soon
          </Text>
          <Text className="text-textMedium">
            Stay tuned for additional faith-based games and challenges!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
