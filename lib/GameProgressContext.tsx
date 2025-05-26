import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Game progress interface
export interface GameProgress {
  gameType: 'Bible Verse Puzzle' | 'Guess the Character' | 'Daily Challenge' | 'Guess the Verse' | 'Reviews';
  level: number;
  score: number;
  hintsUsed: number;
  completedLevels: number[];
  achievements: string[];
  lastPlayed: string;
  percentComplete?: number;
}

interface GameProgressContextType {
  progress: Record<string, GameProgress>;
  updateProgress: (gameType: GameProgress['gameType'], updates: Partial<Omit<GameProgress, 'gameType'>>) => Promise<void>;
  getProgress: (gameType: GameProgress['gameType']) => GameProgress | null;
  resetProgress: (gameType: GameProgress['gameType']) => Promise<void>;
}

const defaultProgress: Record<string, GameProgress> = {
  'Bible Verse Puzzle': {
    gameType: 'Bible Verse Puzzle',
    level: 1,
    score: 0,
    hintsUsed: 0,
    completedLevels: [],
    achievements: [],
    lastPlayed: new Date().toISOString(),
    percentComplete: 0
  },
  'Guess the Character': {
    gameType: 'Guess the Character',
    level: 1,
    score: 0,
    hintsUsed: 0,
    completedLevels: [],
    achievements: [],
    lastPlayed: new Date().toISOString(),
    percentComplete: 0
  },
  'Daily Challenge': {
    gameType: 'Daily Challenge',
    level: 1,
    score: 0,
    hintsUsed: 0,
    completedLevels: [],
    achievements: [],
    lastPlayed: new Date().toISOString(),
    percentComplete: 0
  },
  'Guess the Verse': {
    gameType: 'Guess the Verse',
    level: 1,
    score: 0,
    hintsUsed: 0,
    completedLevels: [],
    achievements: [],
    lastPlayed: new Date().toISOString(),
    percentComplete: 0
  },
  'Reviews': {
    gameType: 'Reviews',
    level: 1,
    score: 0,
    hintsUsed: 0,
    completedLevels: [],
    achievements: [],
    lastPlayed: new Date().toISOString(),
    percentComplete: 0
  },
};

const GameProgressContext = createContext<GameProgressContextType | undefined>(undefined);

export const useGameProgress = () => {
  const context = useContext(GameProgressContext);
  if (!context) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }
  return context;
};

export const GameProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, GameProgress>>({});

  // Load progress from AsyncStorage on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const storedProgress = await AsyncStorage.getItem('gameProgress');
        if (storedProgress) {
          setProgress(JSON.parse(storedProgress));
        } else {
          // Initialize with default progress
          setProgress(defaultProgress);
          await AsyncStorage.setItem('gameProgress', JSON.stringify(defaultProgress));
        }
      } catch (error) {
        console.error('Error loading game progress:', error);
        // Initialize with default progress on error
        setProgress(defaultProgress);
      }
    };

    loadProgress();
  }, []);

  // Save progress to AsyncStorage whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem('gameProgress', JSON.stringify(progress));
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
    };

    if (Object.keys(progress).length > 0) {
      saveProgress();
    }
  }, [progress]);

  // Update progress for a specific game
  const updateProgress = async (
    gameType: GameProgress['gameType'],
    updates: Partial<Omit<GameProgress, 'gameType'>>
  ) => {
    setProgress(prevProgress => {
      const currentProgress = prevProgress[gameType] || defaultProgress[gameType];
      
      // Create a new progress object with the updates
      const updatedProgress: GameProgress = {
        ...currentProgress,
        ...updates,
        lastPlayed: new Date().toISOString(),
      };
      
      return {
        ...prevProgress,
        [gameType]: updatedProgress,
      };
    });
  };

  // Get progress for a specific game
  const getProgress = (gameType: GameProgress['gameType']) => {
    return progress[gameType] || null;
  };

  // Reset progress for a specific game
  const resetProgress = async (gameType: GameProgress['gameType']) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      [gameType]: defaultProgress[gameType],
    }));
  };

  return (
    <GameProgressContext.Provider
      value={{
        progress,
        updateProgress,
        getProgress,
        resetProgress,
      }}
    >
      {children}
    </GameProgressContext.Provider>
  );
};
