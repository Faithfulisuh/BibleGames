import { REACT_APP_API_KEY } from "@env";
import React, { useState, useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

const API_KEY = REACT_APP_API_KEY;
const BIBLE_ID = "de4e12af7f28f599-02"; // ESV Bible ID
const VERSES_PER_GAME = 10;
const TIME_PER_VERSE = 30; // seconds
const MAX_HINTS_PER_GAME = 5; // Maximum number of hints allowed per game
const HINT_PENALTY = 10; // Points deducted for each hint used

// Interfaces
interface GameConfig {
  bookId: string;
  bookName: string;
  chapterId?: string;
  chapterNumber?: string;
}

interface Verse {
  id: string;
  reference: string;
  content: string;
}

interface GameResult {
  reference: string;
  verseId: string;
  completed: boolean;
  correct: boolean;
  timeRemaining: number;
  hintsUsed: number;
  points: number;
}

interface GameResults {
  results: GameResult[];
  totalScore: number;
  correctVerses: number;
  totalVerses: number;
}

interface GamePlayScreenProps {
  gameConfig: GameConfig;
  onGameComplete: (results: GameResults) => void;
  onNewGame: () => void;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// WordTile component for draggable word tiles
interface WordTileProps {
  word: string;
  index: number;
  onRemove: () => void;
  onSwap: (fromIndex: number, toIndex: number) => void;
  totalWords: number;
}

const WordTile: React.FC<WordTileProps> = ({ word, index, onRemove, onSwap, totalWords }) => {
  // Track if the tile is being dragged
  const [isDragging, setIsDragging] = useState(false);
  
  // Track the current position of the tile
  const position = useSharedValue({ x: 0, y: 0 });
  
  // Reset position when dragging ends
  const resetPosition = () => {
    position.value = withSpring({ x: 0, y: 0 });
  };
  
  // Animated style for the tile
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
      ],
      zIndex: isDragging ? 1 : 0,
    };
  });
  
  // Function to calculate new position and swap tiles if needed
  const calculateSwap = (translationX: number, translationY: number) => {
    if (totalWords <= 1) return;
    
    const tileWidth = 80; // Approximate width of a tile
    const tileHeight = 40; // Approximate height of a tile
    const tilesPerRow = Math.floor(300 / tileWidth); // Approximate number of tiles per row
    
    // Calculate the row and column of the original position
    const originalRow = Math.floor(index / tilesPerRow);
    const originalCol = index % tilesPerRow;
    
    // Calculate the current row and column based on the drag position
    const currentRow = Math.floor((originalRow * tileHeight + translationY) / tileHeight);
    const currentCol = Math.floor((originalCol * tileWidth + translationX) / tileWidth);
    
    // Calculate the new index based on the current row and column
    const newIndex = Math.min(Math.max(currentRow * tilesPerRow + currentCol, 0), totalWords - 1);
    
    // If we've moved to a different index, swap the tiles
    if (newIndex !== index) {
      onSwap(index, newIndex);
      // Reset position after swap
      position.value = { x: 0, y: 0 };
    }
  };
  
  // Create a pan gesture using the new Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsDragging)(true);
    })
    .onUpdate((event) => {
      position.value = {
        x: event.translationX,
        y: event.translationY,
      };
      
      if (isDragging) {
        runOnJS(calculateSwap)(event.translationX, event.translationY);
      }
    })
    .onEnd(() => {
      runOnJS(setIsDragging)(false);
      runOnJS(resetPosition)();
    });
  
  return (
    <GestureHandlerRootView style={{ margin: 1 }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[animatedStyle]}>
          <Pressable
            onLongPress={() => setIsDragging(true)}
            onPress={onRemove}
            className={`bg-secondary rounded-xl px-3 py-1 ${isDragging ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-pmedium">
              {word}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default function GamePlayScreen({ gameConfig, onGameComplete, onNewGame }: GamePlayScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameVerses, setGameVerses] = useState<Verse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string[]>([]);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showReference, setShowReference] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_PER_VERSE);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hintsRemaining, setHintsRemaining] = useState<number>(MAX_HINTS_PER_GAME);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  // Use number type for browser environment
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    loadGameVerses();
    // Reset hints at the beginning of the game
    setHintsRemaining(MAX_HINTS_PER_GAME);
    setHintsUsed(0);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameVerses.length > 0 && currentVerseIndex < gameVerses.length) {
      setupCurrentVerse();
    }
  }, [gameVerses, currentVerseIndex]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeUp();
    }
  }, [timeLeft]);

  const loadGameVerses = async (): Promise<void> => {
    setLoading(true);
    try {
      let verses: Verse[] = [];
      
      if (gameConfig.chapterId) {
        // If chapter is selected, get verses from that specific chapter
        verses = await fetchVersesFromChapter(gameConfig.chapterId);
      } else {
        // If only book is selected, get verses from random chapters in that book
        verses = await fetchVersesFromBook(gameConfig.bookId);
      }
      
      // Limit to VERSES_PER_GAME verses
      const selectedVerses = verses.slice(0, VERSES_PER_GAME);
      
      // Initialize game results array
      const initialResults: GameResult[] = selectedVerses.map(verse => ({
        reference: verse.reference,
        verseId: verse.id,
        completed: false,
        correct: false,
        timeRemaining: 0,
        hintsUsed: 0,
        points: 0
      }));
      
      setGameVerses(selectedVerses);
      setGameResults(initialResults);
      setLoading(false);
    } catch (error) {
      console.error("Error loading game verses:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setLoading(false);
    }
  };

  const fetchVersesFromChapter = async (chapterId: string): Promise<Verse[]> => {
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapterId}/verses`,
      {
        headers: { "api-key": API_KEY },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch verses");
    }
    
    const data = await response.json();
    
    // Get verse content for each verse
    const verses: Verse[] = await Promise.all(
      data.data.map(async (verse: { id: string; reference: string }) => {
        const verseContent = await fetchVerseContent(verse.id);
        return {
          id: verse.id,
          reference: verse.reference,
          content: verseContent
        };
      })
    );
    
    return verses;
  };

  const fetchVersesFromBook = async (bookId: string): Promise<Verse[]> => {
    // First get all chapters in the book
    const chaptersResponse = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${bookId}/chapters`,
      {
        headers: { "api-key": API_KEY },
      }
    );
    
    if (!chaptersResponse.ok) {
      const errorData = await chaptersResponse.json();
      throw new Error(errorData.message || "Failed to fetch chapters");
    }
    
    const chaptersData = await chaptersResponse.json();
    
    // Filter out intro chapter
    const chapters = chaptersData.data.filter(
      (chapter: { id: string }) => !chapter.id.endsWith(".intro")
    );
    
    // Randomly select chapters
    const selectedChapters = shuffle(chapters).slice(0, 3);
    
    // Get verses from each selected chapter
    let allVerses: Verse[] = [];
    
    for (const chapter of selectedChapters) {
      // Add type assertion to handle the unknown type
      const chapterVerses = await fetchVersesFromChapter((chapter as {id: string}).id);
      allVerses = [...allVerses, ...chapterVerses];
    }
    
    // Randomly select verses from all collected verses
    return shuffle(allVerses).slice(0, VERSES_PER_GAME);
  };

  const fetchVerseContent = async (verseId: string): Promise<string> => {
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/verses/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`,
      {
        headers: { "api-key": API_KEY },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch verse content");
    }
    
    const data = await response.json();
    return data.data.content;
  };

  const setupCurrentVerse = (): void => {
    const currentVerse = gameVerses[currentVerseIndex];
    
    // Extract words from verse content
    const verseText = currentVerse.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .trim();
    
    const words = verseText
      .replace(/[.,;:!?"'()\[\]{}]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.trim() !== "");
    
    // Scramble words
    const scrambledWords = shuffle(words);
    
    setScrambled(scrambledWords);
    setAnswer([]);
    setIsCorrect(null);
    setShowReference(false);
    setTimeLeft(TIME_PER_VERSE);
    setHintsUsed(0); // Reset hints used for this verse
    
    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const handleSelectWord = (word: string, idx: number): void => {
    setAnswer([...answer, word]);
    setScrambled(scrambled.filter((_, i) => i !== idx));
  };

  const handleRemoveWord = (word: string, idx: number): void => {
    setScrambled([...scrambled, word]);
    setAnswer(answer.filter((_, i) => i !== idx));
  };
  
  // Function to provide a hint by placing the next correct word
  const handleUseHint = (): void => {
    if (hintsRemaining <= 0 || isCorrect !== null) return;
    
    const currentVerse = gameVerses[currentVerseIndex];
    const verseText = currentVerse.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .trim();
    
    const originalWords = verseText
      .replace(/[.,;:!?"'()\[\]{}]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.trim() !== "");
    
    // Find the next word that should be placed
    const nextWordIndex = answer.length;
    if (nextWordIndex < originalWords.length) {
      const nextCorrectWord = originalWords[nextWordIndex];
      
      // Find this word in the scrambled array
      const scrambledIndex = scrambled.findIndex(word => word === nextCorrectWord);
      
      if (scrambledIndex !== -1) {
        // Move the word from scrambled to answer
        handleSelectWord(nextCorrectWord, scrambledIndex);
        
        // Update hint counters
        setHintsRemaining(prev => prev - 1);
        setHintsUsed(prev => prev + 1);
      }
    }
  };

  // Function to swap two words in the answer array
  const swapAnswerWords = (fromIndex: number, toIndex: number): void => {
    if (fromIndex === toIndex) return;
    
    const newAnswer = [...answer];
    const temp = newAnswer[fromIndex];
    newAnswer[fromIndex] = newAnswer[toIndex];
    newAnswer[toIndex] = temp;
    setAnswer(newAnswer);
  };

  const handleSubmit = (): void => {
    const currentVerse = gameVerses[currentVerseIndex];
    const verseText = currentVerse.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .trim();
    
    const originalWords = verseText
      .replace(/[.,;:!?"'()\[\]{}]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.trim() !== "");
    
    const isAnswerCorrect = answer.join(" ") === originalWords.join(" ");
    setIsCorrect(isAnswerCorrect);
    setShowReference(true);
    
    // Calculate points based on time remaining, correctness, and hints used
    let points = 0;
    if (isAnswerCorrect) {
      // Base points: 50
      // Time bonus: up to 50 additional points based on time remaining
      // Hint penalty: subtract points for hints used in this verse
      const hintPenalty = hintsUsed * HINT_PENALTY;
      points = Math.max(0, 50 + Math.floor((timeLeft / TIME_PER_VERSE) * 50) - hintPenalty);
    }
    
    // Update game results
    const updatedResults = [...gameResults];
    updatedResults[currentVerseIndex] = {
      ...updatedResults[currentVerseIndex],
      completed: true,
      correct: isAnswerCorrect,
      timeRemaining: timeLeft,
      hintsUsed: hintsUsed,
      points: points
    };
    setGameResults(updatedResults);
    
    // Pause timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Move to next verse after a short delay
    setTimeout(() => {
      if (currentVerseIndex + 1 >= gameVerses.length) {
        endGame(updatedResults);
      } else {
        setCurrentVerseIndex(prev => prev + 1);
      }
    }, 2000);
  };

  const handleTimeUp = (): void => {
    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Mark verse as failed due to timeout
    const updatedResults = [...gameResults];
    updatedResults[currentVerseIndex] = {
      ...updatedResults[currentVerseIndex],
      completed: true,
      correct: false,
      timeRemaining: 0,
      points: 0
    };
    setGameResults(updatedResults);
    
    // Show timeout message
    setIsCorrect(false);
    setShowReference(true);
    
    // Move to next verse after a short delay
    setTimeout(() => {
      if (currentVerseIndex + 1 >= gameVerses.length) {
        endGame(updatedResults);
      } else {
        setCurrentVerseIndex(prev => prev + 1);
      }
    }, 2000);
  };

  const endGame = (results: GameResult[]): void => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameOver(true);
    
    // Calculate total score
    const totalScore = results.reduce((sum, result) => sum + result.points, 0);
    const correctVerses = results.filter(result => result.correct).length;
    
    // Pass results to parent component
    onGameComplete({
      results: results,
      totalScore,
      correctVerses,
      totalVerses: gameVerses.length
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#574bdb" />
        <Text className="mt-4 text-textMedium">Loading verses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-error text-center mb-4">{error}</Text>
        <Pressable
          className="bg-secondary rounded-xl py-3 px-6"
          onPress={loadGameVerses}
        >
          <Text className="text-white font-pmedium">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (gameOver || currentVerseIndex >= gameVerses.length) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-2xl font-pbold text-center text-primary mb-6">
          Game Complete!
        </Text>
        <Text className="text-lg text-center mb-6">
          Your results are being calculated...
        </Text>
        <ActivityIndicator size="large" color="#574bdb" />
      </View>
    );
  }

  const currentVerse = gameVerses[currentVerseIndex];
  
  return (
    <View className="flex-1 bg-background items-center w-full">
      {/* Progress Bar */}
      <View className="w-full px-4 py-2 flex-row justify-between items-center bg-cardBg">
        <Text className="font-pmedium text-primary">
          Verse {currentVerseIndex + 1} of {gameVerses.length}
        </Text>
      </View>
      
      {/* Prominent Timer Display */}
      <View className="w-11/12 mt-2 items-center justify-center">
        <View className={`px-6 py-3 rounded-full ${timeLeft <= 10 ? 'bg-red-100' : 'bg-inputBg'} shadow-md`}>
          <Text className={`text-2xl font-pbold ${timeLeft <= 10 ? 'text-error' : 'text-secondary'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>
      
      {/* Card Container */}
      <View className="m-4 bg-cardBg rounded-2xl shadow-lg p-5 w-11/12">
        {/* Title */}
        <Text className="text-xl font-pbold text-center text-primary mb-3">
          Arrange the Verse
        </Text>
        
        {/* Reference - only shown after submit */}
        {showReference && (
          <Text className="text-base text-center font-pmedium text-textMedium mb-3">
            {currentVerse.reference}
          </Text>
        )}
        
        {/* Answer Area */}
        <View className="min-h-16 bg-inputBg rounded-xl mb-6 border border-accent flex-row flex-wrap items-center justify-start px-3 py-3">
          {answer.length === 0 ? (
            <Text className="text-textLight">
              Tap the words below to arrange them in the correct order...
            </Text>
          ) : (
            <View className="flex-row flex-wrap">
              {answer.map((word, idx) => (
                <WordTile 
                  key={idx}
                  word={word}
                  index={idx}
                  onRemove={() => handleRemoveWord(word, idx)}
                  onSwap={swapAnswerWords}
                  totalWords={answer.length}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Scrambled Words */}
        <View className="flex-row flex-wrap justify-center mb-6">
          {scrambled.map((word, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleSelectWord(word, idx)}
              className="bg-inputBg rounded-xl px-3 py-1 m-1"
            >
              <Text className="text-primary font-pmedium">
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {/* Game Control Buttons */}
        <View className="mb-4">
          {/* Hint and Submit Buttons */}
          <View className="flex-row justify-between mb-2">
            <Pressable
              className={`bg-accent rounded-xl py-3 px-4 ${hintsRemaining <= 0 ? 'opacity-50' : ''}`}
              onPress={handleUseHint}
              disabled={hintsRemaining <= 0 || isCorrect !== null}
            >
              <Text className="text-primary text-center font-pmedium">
                Hint ({hintsRemaining} left)
              </Text>
            </Pressable>
            
            <Pressable
              className={`rounded-xl py-3 flex-1 ml-2 ${
                answer.length > 0 ? "bg-secondary" : "bg-gray-400"
              }`}
              onPress={handleSubmit}
              disabled={answer.length === 0}
            >
              <Text className="text-white text-center text-lg font-pbold">
                Submit
              </Text>
            </Pressable>
          </View>
          
          {/* Restart Button */}
          <Pressable
            className="bg-error rounded-xl py-2 px-4 mt-1"
            onPress={onNewGame}
          >
            <Text className="text-white text-center font-pmedium">
              Restart Game
            </Text>
          </Pressable>
        </View>
        
        {/* Result Message */}
        {isCorrect !== null && (
          <View className={`mt-4 p-3 rounded-lg ${
            isCorrect ? "bg-green-100" : "bg-red-100"
          }`}>
            <Text className={`text-center font-pmedium ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}>
              {isCorrect 
                ? "Correct! Well done!" 
                : "Not quite right. Keep practicing!"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
