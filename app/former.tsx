// TODO: Add an in-game currency like coins (shekels of silver) similar to Word Cookies
// This will be used for purchasing hints and other power-ups in the game
// Let's do authentication using appwrite
// Instead of one word per tile, let's use 3 words per tile
// Try "Guess the verse" either from example "John 1:1" or "In the beginning was the word and the word was with God and the word was God."
//- Sentence clues - https://claude.ai/public/artifacts/ddb7a43e-3fa1-4367-be13-d8bc4a10565b
// Single word version (webapp) - https://claude.ai/public/artifacts/7af6d5f0-a2fc-497f-a73d-45519c49f7e0
// v2 - https://claude.ai/public/artifacts/605ce4c6-1983-49bd-a842-c1ce20868207
// Change the question "What bible place am i?" to "What am I?" Also make it known that it could be either a place or a character.

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import BibleVersePuzzle from "../bibleVersePuzzle/BibleVersePuzzle";
import GuessTheVerse from "../guessTheVerse/GuessTheVerse";
import Reviews from "../reviews/Reviews";

// Game selection enum
enum GAMES {
  HOME = "home",
  BIBLE_VERSE_PUZZLE = "bible_verse_puzzle",
  GUESS_THE_VERSE = "guess_the_verse",
  REVIEWS = "reviews",
}

// Game card component props interface
interface GameCardProps {
  title: string;
  description: string;
  onPress: () => void;
  color: string;
}

// Game card component
function GameCard({ title, description, onPress, color }: GameCardProps) {
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
  const [currentGame, setCurrentGame] = useState<GAMES>(GAMES.HOME);

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

  if (currentGame === GAMES.GUESS_THE_VERSE) {
    return (
      <View className="flex-1">
        <View className="bg-primary pt-12 pb-4 px-4 flex-row items-center">
          <Pressable onPress={goHome} className="mr-3">
            <Text className="text-white text-sm font-pregular">⬅️ back</Text>
          </Pressable>
          <Text className="text-white text-3xl font-pbold">
            Guess the Verse
          </Text>
        </View>
        <GuessTheVerse />
      </View>
    );
  }

  if (currentGame === GAMES.REVIEWS) {
    return (
      <View className="flex-1">
        <View className="bg-primary pt-12 pb-4 px-4 flex-row items-center">
          <Pressable onPress={goHome} className="mr-3">
            <Text className="text-white text-sm font-pregular">⬅️ back</Text>
          </Pressable>
          <Text className="text-white text-3xl font-pbold">
            App Reviews
          </Text>
        </View>
        <Reviews />
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

        <GameCard
          title="Guess the Verse"
          description="Guess the Bible verse from the given clues. Test your knowledge of Scripture with this fun challenge!"
          onPress={() => setCurrentGame(GAMES.GUESS_THE_VERSE)}
          color="border-secondary"
        />

        <GameCard
          title="Reviews"
          description="Share your thoughts about the app and read what others have to say. Your feedback helps us improve!"
          onPress={() => setCurrentGame(GAMES.REVIEWS)}
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
