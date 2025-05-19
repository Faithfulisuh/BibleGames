import React, { useState } from "react";
import { View } from "react-native";
import GamePlayScreen from "./GamePlayScreen";
import GameResultsScreen from "./GameResultsScreen";
import GameSelectionScreen from "./GameSelectionScreen";

// Game screens enum
enum SCREENS {
  SELECTION = "selection",
  GAMEPLAY = "gameplay",
  RESULTS = "results",
}

// Game configuration interface
interface GameConfig {
  bookId: string;
  bookName: string;
  chapterId?: string;
  chapterNumber?: string;
}

// Game results interface
interface GameResult {
  reference: string;
  verseId: string;
  completed: boolean;
  correct: boolean;
  timeRemaining: number;
  points: number;
}

interface GameResults {
  results: GameResult[];
  totalScore: number;
  correctVerses: number;
  totalVerses: number;
}

export default function BibleVersePuzzle() {
  const [currentScreen, setCurrentScreen] = useState<SCREENS>(SCREENS.SELECTION);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setCurrentScreen(SCREENS.GAMEPLAY);
  };

  const handleGameComplete = (results: GameResults) => {
    setGameResults(results);
    setCurrentScreen(SCREENS.RESULTS);
  };

  const handlePlayAgain = () => {
    // Keep the same book/chapter config
    setCurrentScreen(SCREENS.GAMEPLAY);
  };

  const handleNewGame = () => {
    setGameConfig(null);
    setGameResults(null);
    setCurrentScreen(SCREENS.SELECTION);
  };

  return (
    <View className="flex-1">
      {currentScreen === SCREENS.SELECTION && (
        <GameSelectionScreen onStartGame={handleStartGame} />
      )}

      {currentScreen === SCREENS.GAMEPLAY && gameConfig && (
        <GamePlayScreen
          gameConfig={gameConfig}
          onGameComplete={handleGameComplete}
          onNewGame={handleNewGame}
        />
      )}

      {currentScreen === SCREENS.RESULTS && gameResults && (
        <GameResultsScreen
          gameResults={gameResults}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}
    </View>
  );
}
