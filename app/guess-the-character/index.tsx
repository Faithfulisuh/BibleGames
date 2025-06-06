import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet from "../../components/BottomSheet";
import GameResults from "../../components/GameResults";
import { useGameProgress } from "../../lib/GameProgressContext";
import { useTheme } from "../../lib/ThemeContext";

// Import character data from JSON file
import characterData from "../../assets/json/characters.json";

// Game states
enum GameState {
  PLAYING = "playing",
  RESULTS = "results",
  LOADING = "loading",
}

// Character data interface
interface Character {
  name: string;
  hints: string[];
}

// Game level interface
interface GameLevel {
  level: number;
  maxHints: number;
  pointsPerCorrect: number;
  timeLimit: number; // in seconds
}

// Inspirational verses for results screen
const inspirationalVerses = [
  {
    text: "Study to show yourself approved to God, a worker who does not need to be ashamed",
    reference: "2 Timothy 2:15",
  },
  {
    text: "Your word is a lamp for my feet, a light on my path.",
    reference: "Psalm 119:105",
  },
  {
    text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness",
    reference: "2 Timothy 3:16",
  },
  {
    text: "For the word of God is alive and active. Sharper than any double-edged sword",
    reference: "Hebrews 4:12",
  },
  {
    text: "Do your best to present yourself to God as one approved, a worker who does not need to be ashamed",
    reference: "2 Timothy 2:15",
  },
];

export default function GuessTheCharacterScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { getProgress, updateProgress } = useGameProgress();

  // Bottom sheet for achievements and feedback
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
    actions: [] as { text: string; onPress: () => void; primary?: boolean }[],
  });

  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [usedCharacters, setUsedCharacters] = useState<string[]>([]);

  // Constants
  const STORAGE_KEY = "guessTheCharacter_progress";

  // Game level configuration (static since each character is a level)
  const levelData: GameLevel = {
    level: currentLevel,
    maxHints: 3,
    pointsPerCorrect: 100,
    timeLimit: 60,
  };

  // Load progress from AsyncStorage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgressString = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedProgressString) {
          const savedData = JSON.parse(savedProgressString);
          
          // Set all saved state
          setUsedCharacters(savedData.usedCharacters || []);
          setCurrentCharacter(savedData.currentCharacter);
          setCurrentLevel(savedData.currentLevel || 1);
          setHintsUsed(savedData.hintsUsed || 0);
          setRevealedHints(savedData.revealedHints || 0);
          setScore(savedData.score || 0);
          setTotalScore(savedData.totalScore || 0);
          setGameState(savedData.gameState || GameState.PLAYING);
          setCompletedLevels(savedData.completedLevels || []);
          setAchievements(savedData.achievements || []);
        } else {
          console.log("No saved progress, loading from context");
          const savedProgress = getProgress("Guess the Character");
          if (savedProgress) {
            setCurrentLevel(savedProgress.level);
            setTotalScore(savedProgress.score);
            setAchievements(savedProgress.achievements);
            setCompletedLevels(savedProgress.completedLevels);
          }
          startNewRound();
          setGameState(GameState.PLAYING);
        }
      } catch (error) {
        console.error("Error loading game progress:", error);
        startNewRound();
        setGameState(GameState.PLAYING);
      }
    };

    loadProgress();
  }, []);

  // Save progress to AsyncStorage
  const saveProgress = async () => {
    try {
      const progressData = {
        usedCharacters,
        currentCharacter,
        currentLevel,
        hintsUsed,
        revealedHints,
        score,
        totalScore,
        lastPlayed: new Date().toISOString(),
        gameState,
        completedLevels,
        achievements,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      
      // Also update the game progress context
      await updateProgress("Guess the Character", {
        level: currentLevel,
        score: totalScore,
        hintsUsed,
        completedLevels,
        achievements,
      });
    } catch (error) {
      console.error("Error saving game progress:", error);
    }
  };

  // Save progress when relevant state changes
  useEffect(() => {
    if (currentCharacter && gameState === GameState.PLAYING) {
      saveProgress();
    }
  }, [
    currentCharacter,
    hintsUsed,
    revealedHints,
    score,
    totalScore,
    currentLevel,
    usedCharacters,
  ]);

  // Start a new round
  const startNewRound = () => {
    console.log("Starting new round");

    // Filter available characters
    let availableCharacters = characterData.filter(
      (char) => !usedCharacters.includes(char.name)
    );

    // If no characters left, reset used characters
    if (availableCharacters.length === 0) {
      setUsedCharacters([]);
      availableCharacters = characterData;
    }

    // Select character based on current level (1-based index)
    const characterIndex = (currentLevel - 1) % characterData.length;
    let selectedCharacter = availableCharacters[0]; // Fallback

    // Try to select a character that hasn't been used
    if (availableCharacters.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * availableCharacters.length
      );
      selectedCharacter = availableCharacters[randomIndex];
    }

    // Update used characters
    setUsedCharacters((prev) => [...prev, selectedCharacter.name]);

    // Set current character
    setCurrentCharacter(selectedCharacter);
    console.log("New character selected:", selectedCharacter.name);

    // Reset game state
    setUserAnswer("");
    setRevealedHints(1);
    setHintsUsed(1);
    setScore(levelData.pointsPerCorrect);

    // Save progress
    setTimeout(() => {
      saveProgress();
      console.log("New character saved");
    }, 100);
  };

  // Handle hint reveal
  const handleGetHint = () => {
    if (revealedHints < levelData.maxHints) {
      setRevealedHints(revealedHints + 1);
      setHintsUsed(hintsUsed + 1);
      const hintPenalty = Math.floor(
        levelData.pointsPerCorrect / levelData.maxHints
      );
      setScore(Math.max(0, score - hintPenalty));
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!currentCharacter) return;

    const maxPoints = levelData.pointsPerCorrect;
    const hintPenalty = Math.floor(maxPoints / levelData.maxHints) * hintsUsed;
    const currentPoints = Math.floor(Math.max(0, maxPoints - hintPenalty));

    const isCorrect =
      userAnswer.trim().toLowerCase() === currentCharacter.name.toLowerCase();

    if (isCorrect) {
      const newTotalScore = totalScore + currentPoints;
      setTotalScore(newTotalScore);

      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels([...completedLevels, currentLevel]);
      }

      const newAchievements = [...achievements];
      if (hintsUsed === 0 && !achievements.includes("perfect_answer")) {
        newAchievements.push("perfect_answer");
        setAchievements(newAchievements);
        setBottomSheetContent({
          title: "Achievement Unlocked!",
          message: "You completed a level without using any hints!",
          type: "success",
          actions: [
            {
              text: "Continue",
              onPress: () => setBottomSheetVisible(false),
              primary: true,
            },
          ],
        });
        setBottomSheetVisible(true);
      }

      updateProgress("Guess the Character", {
        level: currentLevel,
        score: newTotalScore,
        hintsUsed,
        completedLevels: [...completedLevels, currentLevel],
        achievements: newAchievements,
      });

      setGameState(GameState.RESULTS);
    } else {
      setBottomSheetContent({
        title: "Incorrect Answer",
        message: `That's not right. Try again or use a hint.`,
        type: "error",
        actions: [
          {
            text: "Try Again",
            onPress: () => setBottomSheetVisible(false),
            primary: false,
          },
          ...(hintsUsed < levelData.maxHints
            ? [
                {
                  text: "Use Hint",
                  onPress: () => {
                    setBottomSheetVisible(false);
                    handleGetHint();
                  },
                  primary: true,
                },
              ]
            : []),
        ],
      });
      setBottomSheetVisible(true);
      setUserAnswer("");
    }
  };

  // Handle next level
  const handleNextLevel = async () => {
    const nextLevel = currentLevel + 1;
    
    // Update state
    setCurrentLevel(nextLevel);
    setUsedCharacters([]); // Reset used characters for new level cycle
    setHintsUsed(0);
    setRevealedHints(0);
    setScore(levelData.pointsPerCorrect);
    setGameState(GameState.PLAYING);

    // Save progress and update context
    await saveProgress();
    await updateProgress("Guess the Character", {
      level: nextLevel,
      score: totalScore,
      hintsUsed: 0,
      completedLevels: [...completedLevels, currentLevel],
      achievements,
    });

    // Start new round
    startNewRound();
  };

  // Handle retry level
  const handleRetryLevel = async () => {
    // Reset level-specific state
    setUsedCharacters([]);
    setHintsUsed(0);
    setRevealedHints(0);
    setScore(levelData.pointsPerCorrect);
    setGameState(GameState.PLAYING);

    // Save progress
    await saveProgress();
    await updateProgress("Guess the Character", {
      level: currentLevel,
      score: totalScore,
      hintsUsed: 0,
      completedLevels,
      achievements,
    });

    // Start new round
    startNewRound();
  };

  // Render game screen
  const renderGameScreen = () => {
    if (!currentCharacter) return null;

    const maxPoints = levelData.pointsPerCorrect;
    const pointsPerHint = maxPoints / levelData.maxHints;
    const currentPoints = Math.max(0, maxPoints - hintsUsed * pointsPerHint);

    return (
      <View className="flex-1 bg-white">
        <LinearGradient colors={["#3B82F6", "#2563EB"]} className="p-4 pt-12">
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={() => {
                saveProgress();
                router.back();
              }}
              className="mr-2"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-xl font-pbold flex-1 text-center">
              Guess the Character
            </Text>
            <View className="bg-white rounded-lg px-3 py-1">
              <Text className="text-blueGradientStart text-xl font-pbold">
                Level {currentLevel}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="flex-row items-center p-2 bg-blueGradientStart bg-opacity-10">
          <Ionicons name="star" size={18} color="#F59E0B" />
          <Text className="ml-1 font-pbold text-textPrimary">{totalScore}</Text>
          <View className="ml-auto flex-row items-center">
            <Text className="text-textSecondary mr-1">Hints Used</Text>
            <Text className="font-pbold text-textPrimary">
              {hintsUsed}/{levelData.maxHints}
            </Text>
          </View>
        </View>

        <View className="p-4 flex-1">
          <Text className="text-xl font-pbold text-textPrimary mb-2">
            Can you identify this Bible character?
          </Text>
          <Text className="text-textSecondary mb-4">
            Use the single-word hints below to help you guess the correct Bible
            character.
          </Text>

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-pbold text-textPrimary">Hints</Text>
              <Pressable
                onPress={handleGetHint}
                className={`bg-goldAccent px-3 py-1 rounded-full ${
                  revealedHints >= levelData.maxHints ? "opacity-50" : ""
                }`}
                disabled={revealedHints >= levelData.maxHints}
              >
                <Text className="text-textPrimary font-pmedium">
                  Get Hint ({levelData.maxHints - hintsUsed}/
                  {levelData.maxHints})
                </Text>
              </Pressable>
            </View>

            <View className="border border-dashed border-mediumGray border-opacity-30 rounded-lg p-6 items-center justify-center">
              {revealedHints > 0 ? (
                <View className="items-center">
                  {currentCharacter.hints
                    .slice(0, revealedHints)
                    .map((hint, index) => (
                      <Text
                        key={index}
                        className="text-textPrimary font-pmedium mb-2"
                      >
                        {index + 1}. {hint}
                      </Text>
                    ))}
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons
                    name="help-circle-outline"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="text-textSecondary mt-2">
                    Need more clues? Click "Get Hint"
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-pbold text-textPrimary mb-2">
              Your Answer
            </Text>
            <TextInput
              className="border border-lightGray border-opacity-50 rounded-lg p-3 text-textPrimary"
              placeholder="e.g., Moses"
              value={userAnswer}
              onChangeText={setUserAnswer}
            />
          </View>

          <Pressable
            className={`bg-blueGradientStart rounded-lg py-3 items-center ${
              !userAnswer ? "opacity-50" : ""
            }`}
            onPress={handleSubmitAnswer}
            disabled={!userAnswer}
          >
            <Text className="text-white font-pbold text-lg">Submit Answer</Text>
          </Pressable>

          <View className="mt-6">
            <Text className="text-textSecondary font-pmedium mb-1">
              Potential Points
            </Text>
            <View className="bg-blueGradientStart bg-opacity-10 h-2 rounded-full w-full overflow-hidden">
              <View
                className="bg-blueGradientStart h-full rounded-full"
                style={{ width: `${(currentPoints / maxPoints) * 100}%` }}
              />
            </View>
            <Text className="text-right text-textPrimary font-pbold mt-1">
              {Math.floor(currentPoints)} pts
            </Text>
            <Text className="text-textSecondary text-xs">
              Points decrease with each hint used
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render results screen
  const renderResultsScreen = () => {
    if (!currentCharacter) return null;

    const nextLevel = Math.min(currentLevel + 1, characterData.length);
    const progressPercentage = (currentLevel / characterData.length) * 100;
    const randomVerse =
      inspirationalVerses[
        Math.floor(Math.random() * inspirationalVerses.length)
      ];

    return (
      <GameResults
        gameType="Guess the Character"
        reference={currentCharacter.name}
        verseText={`Biblical character known for: ${currentCharacter.hints.join(
          ", "
        )}`}
        score={totalScore}
        isPersonalBest={false}
        hintsUsed={hintsUsed}
        maxHints={levelData.maxHints}
        shekelsEarned={0}
        achievements={[
          {
            title: "Perfect Assembly",
            description: "Complete a level with no hints used",
          },
        ]}
        levelProgress={{
          current: currentLevel,
          next: nextLevel,
          percentage: progressPercentage,
        }}
        onPlayAgain={handleNextLevel}
        onNextVerse={handleNextLevel}
        onRetryLevel={handleRetryLevel}
        onHome={() => router.back()}
        inspirationalVerse={randomVerse}
      />
    );
  };

  // Main render
  return (
    <View
      className={`flex-1 ${
        isDark ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      {gameState === GameState.LOADING ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#3B82F6" : "#2563EB"}
          />
          <Text
            className={`mt-4 ${
              isDark ? "text-dark-textSecondary" : "text-light-textSecondary"
            }`}
          >
            Loading...
          </Text>
        </View>
      ) : gameState === GameState.PLAYING ? (
        renderGameScreen()
      ) : (
        renderResultsScreen()
      )}

      <BottomSheet
        isVisible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title={bottomSheetContent.title}
        message={bottomSheetContent.message}
        type={bottomSheetContent.type}
        actions={bottomSheetContent.actions}
      />
    </View>
  );
}
