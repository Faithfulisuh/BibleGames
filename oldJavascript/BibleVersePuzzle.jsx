import React, { useState } from "react";
import { View } from "react-native";
import GamePlayScreen from "./GamePlayScreen";
import GameResultsScreen from "./GameResultsScreen";
import GameSelectionScreen from "./GameSelectionScreen";

// Game screens enum
const SCREENS = {
  SELECTION: "selection",
  GAMEPLAY: "gameplay",
  RESULTS: "results",
};

export default function BibleVersePuzzle() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SELECTION);
  const [gameConfig, setGameConfig] = useState(null);
  const [gameResults, setGameResults] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setCurrentScreen(SCREENS.GAMEPLAY);
  };

  const handleGameComplete = (results) => {
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

      {currentScreen === SCREENS.GAMEPLAY && (
        <GamePlayScreen
          gameConfig={gameConfig}
          onGameComplete={handleGameComplete}
          onNewGame={handleNewGame}
        />
      )}

      {currentScreen === SCREENS.RESULTS && (
        <GameResultsScreen
          gameResults={gameResults}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
        />
      )}
    </View>
  );
}
