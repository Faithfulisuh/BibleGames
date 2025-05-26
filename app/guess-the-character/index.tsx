import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import GameResults from '../../components/GameResults';
import { useGameProgress } from '../../lib/GameProgressContext';
import BottomSheet from '../../components/BottomSheet';

// Import character data from JSON file
import characterData from '../../characters.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Game states
enum GameState {
  PLAYING = 'playing',
  RESULTS = 'results',
  LOADING = 'loading',
}

// Character data interface
interface Character {
  id: string;
  name: string;
  hints: string[];
  difficulty: string;
  testament: string;
  description?: string;
}

// Game level interface
interface GameLevel {
  level: number;
  difficulty: string;
  testament: string;
  maxHints: number;
  pointsPerCorrect: number;
  timeLimit: number; // in seconds
}

// Bible characters data
const bibleCharacters: Character[] = [
  {
    id: '1',
    name: 'Moses',
    hints: ['Leader', 'Egypt', 'Exodus', 'Ten Commandments', 'Burning Bush'],
    difficulty: 'easy',
    testament: 'old',
    description: 'Led the Israelites out of Egypt and received the Ten Commandments.'
  },
  {
    id: '2',
    name: 'David',
    hints: ['King', 'Goliath', 'Psalms', 'Shepherd', 'Jerusalem'],
    difficulty: 'easy',
    testament: 'old',
    description: 'A shepherd who became king of Israel, known for defeating Goliath.'
  },
  {
    id: '3',
    name: 'Paul',
    hints: ['Apostle', 'Letters', 'Missionary', 'Saul', 'Damascus'],
    difficulty: 'easy',
    testament: 'new',
    description: 'Former persecutor who became an apostle and wrote many New Testament letters.'
  },
  {
    id: '4',
    name: 'Abraham',
    hints: ['Father', 'Faith', 'Isaac', 'Covenant', 'Promised Land'],
    difficulty: 'easy',
    testament: 'old',
    description: 'Called by God to leave his homeland and become the father of many nations.'
  },
  {
    id: '5',
    name: 'Esther',
    hints: ['Queen', 'Persia', 'Mordecai', 'Haman', 'Courage'],
    difficulty: 'medium',
    testament: 'old',
    description: 'Jewish queen of Persia who saved her people from destruction.'
  },
  {
    id: '6',
    name: 'Daniel',
    hints: ['Prophet', 'Lions', 'Babylon', 'Dreams', 'Faithful'],
    difficulty: 'medium',
    testament: 'old',
    description: 'Prophet who interpreted dreams and survived the lions\'s den.'
  },
  {
    id: '7',
    name: 'Peter',
    hints: ['Apostle', 'Fisherman', 'Denial', 'Rock', 'Pentecost'],
    difficulty: 'medium',
    testament: 'new',
    description: 'Fisherman who became an apostle, denied Jesus three times, then led the early church.'
  },
  {
    id: '8',
    name: 'Elijah',
    hints: ['Prophet', 'Fire', 'Ahab', 'Chariot', 'Jezebel'],
    difficulty: 'medium',
    testament: 'old',
    description: 'Prophet who challenged the prophets of Baal and was taken to heaven in a chariot of fire.'
  },
  {
    id: '9',
    name: 'Nehemiah',
    hints: ['Builder', 'Wall', 'Jerusalem', 'Cupbearer', 'Governor'],
    difficulty: 'hard',
    testament: 'old',
    description: 'Led the rebuilding of Jerusalem\'s walls after the Babylonian exile.'
  },
  {
    id: '10',
    name: 'Barnabas',
    hints: ['Encourager', 'Cyprus', 'Paul', 'Missionary', 'Antioch'],
    difficulty: 'hard',
    testament: 'new',
    description: 'Early Christian leader known as the "Son of Encouragement" who mentored Paul.'
  }
];

// Game levels
const gameLevels: GameLevel[] = [
  { level: 1, difficulty: 'Easy', testament: 'Mixed', maxHints: 3, pointsPerCorrect: 100, timeLimit: 60 },
  { level: 2, difficulty: 'Easy', testament: 'Old Testament', maxHints: 3, pointsPerCorrect: 100, timeLimit: 60 },
  { level: 3, difficulty: 'Easy', testament: 'New Testament', maxHints: 3, pointsPerCorrect: 100, timeLimit: 60 },
  { level: 4, difficulty: 'Easy', testament: 'Mixed', maxHints: 3, pointsPerCorrect: 120, timeLimit: 60 },
  { level: 5, difficulty: 'Medium', testament: 'Mixed', maxHints: 3, pointsPerCorrect: 120, timeLimit: 60 },
  { level: 6, difficulty: 'Medium', testament: 'Old Testament', maxHints: 3, pointsPerCorrect: 120, timeLimit: 60 },
  { level: 7, difficulty: 'Medium', testament: 'New Testament', maxHints: 3, pointsPerCorrect: 120, timeLimit: 60 },
  { level: 8, difficulty: 'Medium', testament: 'Mixed', maxHints: 3, pointsPerCorrect: 150, timeLimit: 60 },
  { level: 9, difficulty: 'Hard', testament: 'Mixed', maxHints: 3, pointsPerCorrect: 150, timeLimit: 60 },
  { level: 10, difficulty: 'Hard', testament: 'Old Testament', maxHints: 3, pointsPerCorrect: 150, timeLimit: 60 },
  { level: 11, difficulty: 'Hard', testament: 'New Testament', maxHints: 3, pointsPerCorrect: 150, timeLimit: 60 },
  { level: 12, difficulty: 'Hard', testament: 'Mixed', maxHints: 2, pointsPerCorrect: 200, timeLimit: 60 },
  { level: 13, difficulty: 'Hard', testament: 'Mixed', maxHints: 2, pointsPerCorrect: 200, timeLimit: 45 },
  { level: 14, difficulty: 'Hard', testament: 'Old Testament Leaders', maxHints: 2, pointsPerCorrect: 200, timeLimit: 45 },
  { level: 15, difficulty: 'Hard', testament: 'New Testament Leaders', maxHints: 1, pointsPerCorrect: 250, timeLimit: 45 },
];

// Inspirational verses for results screen
const inspirationalVerses = [
  { text: "Study to show yourself approved to God, a worker who does not need to be ashamed", reference: "2 Timothy 2:15" },
  { text: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105" },
  { text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness", reference: "2 Timothy 3:16" },
  { text: "For the word of God is alive and active. Sharper than any double-edged sword", reference: "Hebrews 4:12" },
  { text: "Do your best to present yourself to God as one approved, a worker who does not need to be ashamed", reference: "2 Timothy 2:15" },
];

export default function GuessTheCharacterScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { getProgress, updateProgress } = useGameProgress();
  
  // Bottom sheet for achievements and feedback
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    actions: [] as {text: string; onPress: () => void; primary?: boolean}[]
  });
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [usedCharacters, setUsedCharacters] = useState<string[]>([]);
  
  // Constants
  const STORAGE_KEY = 'guessTheCharacter_progress';
  
  // Get the current level data
  const getCurrentLevelData = (): GameLevel => {
    return gameLevels[Math.min(currentLevel - 1, gameLevels.length - 1)];
  };
  
  // Load progress from AsyncStorage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Load saved progress from AsyncStorage
        const savedProgressString = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (savedProgressString) {
          const savedData = JSON.parse(savedProgressString);
          setUsedCharacters(savedData.usedCharacters || []);
          
          // Restore the current character and game state if available
          if (savedData.currentCharacter) {
            console.log('Restoring saved character:', savedData.currentCharacter.name);
            setCurrentCharacter(savedData.currentCharacter);
            setCurrentLevel(savedData.currentLevel || 1);
            setHintsUsed(savedData.hintsUsed || 0);
            setRevealedHints(savedData.revealedHints || 0);
            setScore(savedData.score || 0);
            setTotalScore(savedData.totalScore || 0);
            
            // Set game state to playing with the saved character
            setGameState(GameState.PLAYING);
          } else {
            console.log('No saved character found, starting new round');
            // Start a new round if no current character is saved
            startNewRound();
            setGameState(GameState.PLAYING);
          }
        } else {
          console.log('No saved progress found, loading from context');
          // Load game progress from context
          const savedProgress = getProgress('Guess the Character');
          if (savedProgress) {
            setCurrentLevel(savedProgress.level);
            setTotalScore(savedProgress.score);
            setAchievements(savedProgress.achievements);
            setCompletedLevels(savedProgress.completedLevels);
          }
          
          // Start a new round with the saved level
          startNewRound();
          
          // Set game state to playing after loading
          setGameState(GameState.PLAYING);
        }
      } catch (error) {
        console.error('Error loading game progress:', error);
        // Start a new game if there's an error
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
        lastPlayed: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving game progress to AsyncStorage:', error);
    }
  };
  
  // Save progress when game state changes
  useEffect(() => {
    if (currentCharacter && gameState === GameState.PLAYING) {
      saveProgress();
    }
  }, [currentCharacter, hintsUsed, revealedHints, score, totalScore, currentLevel, usedCharacters]);
  
  // Only start a new round when level changes AND we're not restoring from saved state
  // This is commented out to prevent overriding the saved character when returning to the game
  /*
  useEffect(() => {
    if (gameState !== GameState.LOADING) {
      startNewRound();
    }
  }, [currentLevel]);
  */
  
  // Start a new round
  const startNewRound = () => {
    console.log('Starting new round');
    const levelData = getCurrentLevelData();
    
    // Use characters from the JSON file instead of hardcoded array
    const allCharacters: Character[] = characterData.map((char, index) => ({
      id: index.toString(),
      name: char.name,
      hints: char.hints,
      difficulty: 'medium', // Default difficulty
      testament: 'old', // Default testament (not important since we're using JSON data)
      description: `Biblical character known for: ${char.hints.join(', ')}`
    }));
    
    // Filter out characters that have already been used
    let availableCharacters = allCharacters.filter(char => 
      !usedCharacters.includes(char.name)
    );
    
    // If we've used all characters, reset the used characters list
    if (availableCharacters.length === 0) {
      setUsedCharacters([]);
      availableCharacters = allCharacters;
    }
    
    // Select a random character from available characters
    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selectedCharacter = availableCharacters[randomIndex] || allCharacters[0];
    
    // Add the character to used characters list
    setUsedCharacters(prev => [...prev, selectedCharacter.name]);
    
    // Set the current character
    setCurrentCharacter(selectedCharacter);
    console.log('New character selected:', selectedCharacter.name);
    
    // Reset game state
    setUserAnswer('');
    
    // Show one hint by default
    setRevealedHints(1);
    setHintsUsed(1);
    
    // Calculate max points based on level
    const maxPoints = levelData.pointsPerCorrect;
    setScore(maxPoints);
    
    // Save the new character immediately
    setTimeout(() => {
      saveProgress();
      console.log('New character saved to AsyncStorage');
    }, 100);
  };
  
  // Handle hint reveal
  const handleGetHint = () => {
    if (revealedHints < getCurrentLevelData().maxHints) {
      setRevealedHints(revealedHints + 1);
      setHintsUsed(hintsUsed + 1);
      
      // Reduce score for using a hint
      const levelData = getCurrentLevelData();
      const hintPenalty = Math.floor(levelData.pointsPerCorrect / levelData.maxHints);
      setScore(Math.max(0, score - hintPenalty));
    }
  };
  
  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!currentCharacter) return;
    
    const levelData = getCurrentLevelData();
    const maxPoints = levelData.pointsPerCorrect;
    const hintPenalty = Math.floor(maxPoints / levelData.maxHints) * hintsUsed;
    // Ensure points are integers only
    const currentPoints = Math.floor(Math.max(0, maxPoints - hintPenalty));
    
    // Check if the answer is correct (case insensitive and trimmed of whitespace)
    const isCorrect = userAnswer.trim().toLowerCase() === currentCharacter.name.toLowerCase();
    
    if (isCorrect) {
      // Add points to total score
      const newTotalScore = totalScore + currentPoints;
      setTotalScore(newTotalScore);
      
      // Add level to completed levels if not already completed
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels([...completedLevels, currentLevel]);
      }
      
      // Check for achievements
      const newAchievements = [...achievements];
      
      // Perfect answer (no hints used)
      if (hintsUsed === 0 && !achievements.includes('perfect_answer')) {
        newAchievements.push('perfect_answer');
        setAchievements(newAchievements);
        
        // Show achievement notification
        setBottomSheetContent({
          title: "Achievement Unlocked!",
          message: "You completed a level without using any hints!",
          type: "success",
          actions: [{
            text: "Continue",
            onPress: () => setBottomSheetVisible(false),
            primary: true
          }]
        });
        setBottomSheetVisible(true);
      }
      
      // Save progress to GameProgressContext
      updateProgress('Guess the Character', {
        level: currentLevel,
        score: newTotalScore,
        hintsUsed,
        completedLevels: [...completedLevels, currentLevel],
        achievements: newAchievements,
      });
      
      // Show results
      setGameState(GameState.RESULTS);
    } else {
      // Incorrect answer - use BottomSheet instead of Alert
      setBottomSheetContent({
        title: "Incorrect Answer",
        message: `That's not right. Try again or use a hint.`,
        type: "error",
        actions: [
          { 
            text: "Try Again", 
            onPress: () => setBottomSheetVisible(false),
            primary: false 
          },
          ...(hintsUsed < levelData.maxHints ? [
            { 
              text: "Use Hint", 
              onPress: () => {
                setBottomSheetVisible(false);
                handleGetHint();
              },
              primary: true 
            }
          ] : [])
        ]
      });
      setBottomSheetVisible(true);
      
      // Clear the answer field
      setUserAnswer('');
    }
  };
  
  // Handle play again
  const handlePlayAgain = async () => {
    startNewRound();
    setGameState(GameState.PLAYING);
    
    // Save current progress
    await updateProgress('Guess the Character', {
      level: currentLevel,
      score: totalScore,
      hintsUsed: 0,
      completedLevels: completedLevels,
      achievements: achievements,
    });
    
    // Save the new character and game state
    saveProgress();
  };
  
  // Handle next level
  const handleNextLevel = async () => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    setGameState(GameState.PLAYING);
    
    // Save progress with new level
    await updateProgress('Guess the Character', {
      level: nextLevel,
      score: totalScore,
      hintsUsed: 0,
      completedLevels: completedLevels,
      achievements: achievements,
    });
  };
  
  // Handle retry level
  const handleRetryLevel = async () => {
    startNewRound();
    setGameState(GameState.PLAYING);
    
    // Save current progress
    await updateProgress('Guess the Character', {
      level: currentLevel,
      score: totalScore,
      hintsUsed: 0,
      completedLevels: completedLevels,
      achievements: achievements,
    });
  };
  
  // Render the game screen
  const renderGameScreen = () => {
    if (!currentCharacter) return null;
    
    const levelData = getCurrentLevelData();
    const maxPoints = levelData.pointsPerCorrect;
    const pointsPerHint = maxPoints / levelData.maxHints;
    const currentPoints = Math.max(0, maxPoints - (hintsUsed * pointsPerHint));
    
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          className="p-4 pt-12"
        >
          <View className="flex-row items-center mb-2">
            <Pressable 
              onPress={() => {
                // Save state before navigating back
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
              <Text className="text-blueGradientStart text-xl font-pbold">Level {currentLevel}</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-opacity-80">
              {levelData.difficulty} • {levelData.testament}
            </Text>
          </View>
        </LinearGradient>
        
        {/* Score Display */}
        <View className="flex-row items-center p-2 bg-blueGradientStart bg-opacity-10">
          <Ionicons name="star" size={18} color="#F59E0B" />
          <Text className="ml-1 font-pbold text-textPrimary">{totalScore}</Text>
          <View className="ml-auto flex-row items-center">
            <Text className="text-textSecondary mr-1">Hints Used</Text>
            <Text className="font-pbold text-textPrimary">{hintsUsed}/{levelData.maxHints}</Text>
          </View>
        </View>
        
        {/* Main Content */}
        <View className="p-4 flex-1">
          <Text className="text-xl font-pbold text-textPrimary mb-2">
            Can you identify this Bible character?
          </Text>
          <Text className="text-textSecondary mb-4">
            Use the single-word hints below to help you guess the correct Bible character.
          </Text>
          
          {/* Hints Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-pbold text-textPrimary">Hints</Text>
              <Pressable 
                onPress={handleGetHint}
                className={`bg-goldAccent px-3 py-1 rounded-full ${revealedHints >= levelData.maxHints ? 'opacity-50' : ''}`}
                disabled={revealedHints >= levelData.maxHints}
              >
                <Text className="text-textPrimary font-pmedium">Get Hint ({levelData.maxHints - hintsUsed}/{levelData.maxHints})</Text>
              </Pressable>
            </View>
            
            {/* Hint Display */}
            <View className="border border-dashed border-mediumGray border-opacity-30 rounded-lg p-6 items-center justify-center">
              {revealedHints > 0 ? (
                <View className="items-center">
                  {currentCharacter.hints.slice(0, revealedHints).map((hint, index) => (
                    <Text key={index} className="text-textPrimary font-pmedium mb-2">
                      {index + 1}. {hint}
                    </Text>
                  ))}
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="help-circle-outline" size={48} color="#9CA3AF" />
                  <Text className="text-textSecondary mt-2">Need more clues? Click "Get Hint"</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Answer Input */}
          <View className="mb-4">
            <Text className="font-pbold text-textPrimary mb-2">Your Answer</Text>
            <TextInput
              className="border border-lightGray border-opacity-50 rounded-lg p-3 text-textPrimary"
              placeholder="e.g., Moses"
              value={userAnswer}
              onChangeText={setUserAnswer}
            />
          </View>
          
          {/* Submit Button */}
          <Pressable 
            className={`bg-blueGradientStart rounded-lg py-3 items-center ${!userAnswer ? 'opacity-50' : ''}`}
            onPress={handleSubmitAnswer}
            disabled={!userAnswer}
          >
            <Text className="text-white font-pbold text-lg">Submit Answer</Text>
          </Pressable>
          
          {/* Points Indicator */}
          <View className="mt-6">
            <Text className="text-textSecondary font-pmedium mb-1">Potential Points</Text>
            <View className="bg-blueGradientStart bg-opacity-10 h-2 rounded-full w-full overflow-hidden">
              <View 
                className="bg-blueGradientStart h-full rounded-full"
                style={{ width: `${(currentPoints / maxPoints) * 100}%` }}
              />
            </View>
            <Text className="text-right text-textPrimary font-pbold mt-1">{Math.floor(currentPoints)} pts</Text>
            <Text className="text-textSecondary text-xs">Points decrease with each hint used</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render the results screen
  const renderResultsScreen = () => {
    if (!currentCharacter) return null;
    
    // Calculate level progress percentage
    const nextLevel = Math.min(currentLevel + 1, gameLevels.length);
    const progressPercentage = 75; // Example value, would be calculated based on user progress
    
    // Get a random inspirational verse
    const randomVerse = inspirationalVerses[Math.floor(Math.random() * inspirationalVerses.length)];
    
    return (
      <GameResults
        gameType="Guess the Character"
        reference={currentCharacter.name}
        verseText={currentCharacter.description || ''}
        score={totalScore}
        isPersonalBest={false}
        hintsUsed={hintsUsed}
        maxHints={getCurrentLevelData().maxHints}
        shekelsEarned={0} // In-game currency will be added soon
        achievements={[
          { 
            title: "Perfect Assembly", 
            description: "Complete a level with no hints used" 
          }
        ]}
        levelProgress={{
          current: currentLevel,
          next: nextLevel,
          percentage: progressPercentage
        }}
        onPlayAgain={handleNextLevel} // Changed from handlePlayAgain to handleNextLevel
        onNextVerse={handleNextLevel}
        onRetryLevel={handleRetryLevel}
        onHome={() => router.back()}
        inspirationalVerse={randomVerse}
      />
    );
  };
  
  // Main render
  return (
    <View className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      {gameState === GameState.LOADING ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#3B82F6' : '#2563EB'} />
          <Text className={`mt-4 ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
            Loading...
          </Text>
        </View>
      ) : gameState === GameState.PLAYING ? (
        renderGameScreen()
      ) : (
        renderResultsScreen()
      )}
      
      {/* Bottom Sheet for Achievements and Feedback */}
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
