import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Account } from 'appwrite';
import { loadUserProgress, saveUserProgress } from './appwrite';

// Temporary auth context type until we have the real one
type AuthContextType = {
  user: {
    $id: string;
    email?: string;
    name?: string;
  } | null;
};

// Create a temporary auth context
const AuthContext = createContext<AuthContextType>({ user: null });

// Export a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

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
  const [progress, setProgress] = useState<Record<string, GameProgress>>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load progress from Appwrite when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) {
        setProgress({...defaultProgress});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const appwriteProgress = await loadUserProgress(user.$id);
        
        if (appwriteProgress && appwriteProgress.length > 0) {
          // Get the raw progress data from the document
          const savedData = appwriteProgress[0];
          
          // Create a new progress object with default values
          const mergedProgress = {...defaultProgress};
          
          // If we have progress data, merge it with defaults
          if (savedData && typeof savedData === 'object') {
            // Type assertion for the saved data
            const savedProgress = savedData as Record<string, any>;
            
            // Update each game type with saved data if available
            (Object.keys(defaultProgress) as Array<keyof typeof defaultProgress>).forEach(gameType => {
              const savedGameData = savedProgress[gameType];
              if (savedGameData) {
                mergedProgress[gameType] = {
                  ...defaultProgress[gameType as keyof typeof defaultProgress],
                  ...savedGameData,
                  gameType: gameType as GameProgress['gameType']
                };
              }
            });
          }
          
          setProgress(mergedProgress);
        } else {
          // No saved progress, use defaults
          setProgress({...defaultProgress});
        }
      } catch (error) {
        console.error('Error loading game progress from Appwrite:', error);
        // Fall back to default progress on error
        setProgress({...defaultProgress});
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Save progress to Appwrite whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || isLoading) return;

      try {
        // Only save if we have valid progress data
        if (progress && typeof progress === 'object' && Object.keys(progress).length > 0) {
          await saveUserProgress(user.$id, progress);
        }
      } catch (error) {
        console.error('Error saving game progress to Appwrite:', error);
      }
    };

    // Only save if we have a user and we're not in the initial loading state
    if (user && !isLoading) {
      saveProgress();
    }
  }, [progress, user, isLoading]);

  // Update progress for a specific game
  const updateProgress = useCallback(async (
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
  }, []);

  // Get progress for a specific game
  const getProgress = useCallback((gameType: GameProgress['gameType']) => {
    return progress[gameType] || defaultProgress[gameType];
  }, [progress]);

  // Reset progress for a specific game
  const resetProgress = useCallback(async (gameType: GameProgress['gameType']) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      [gameType]: { ...defaultProgress[gameType] },
    }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    progress,
    updateProgress,
    getProgress,
    resetProgress,
    isLoading,
  }), [progress, updateProgress, getProgress, resetProgress, isLoading]);

  return (
    <GameProgressContext.Provider value={contextValue}>
      {children}
    </GameProgressContext.Provider>
  );
};
