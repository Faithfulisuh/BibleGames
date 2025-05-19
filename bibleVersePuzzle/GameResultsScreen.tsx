import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

// Interfaces
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

interface GameResultsScreenProps {
  gameResults: GameResults;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export default function GameResultsScreen({ gameResults, onPlayAgain, onNewGame }: GameResultsScreenProps) {
  const totalScore = gameResults.results.reduce((sum, result) => sum + result.points, 0);
  const correctVerses = gameResults.results.filter(result => result.correct).length;
  
  const renderResultItem = ({ item }: { item: GameResult }) => (
    <View className="bg-cardBg rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-pmedium text-primary">{item.reference}</Text>
        <View className="bg-inputBg px-3 py-1 rounded-full">
          <Text className="font-pbold text-secondary">{item.points} pts</Text>
        </View>
      </View>
      
      <View className="flex-row">
        <View className={`px-3 py-1 rounded-full ${item.correct ? 'bg-green-100' : 'bg-red-100'}`}>
          <Text className={`text-sm ${item.correct ? 'text-green-600' : 'text-red-600'}`}>
            {item.correct ? 'Correct' : 'Incorrect'}
          </Text>
        </View>
        
        {item.timeRemaining > 0 && (
          <View className="px-3 py-1 rounded-full bg-blue-100 ml-2">
            <Text className="text-sm text-blue-600">
              {item.timeRemaining}s remaining
            </Text>
          </View>
        )}
        
        {item.timeRemaining === 0 && !item.correct && (
          <View className="px-3 py-1 rounded-full bg-yellow-100 ml-2">
            <Text className="text-sm text-yellow-600">
              Time expired
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <View className="bg-cardBg rounded-2xl shadow-lg p-5 mb-4">
        <Text className="text-2xl font-pbold text-center text-primary mb-2">
          Game Results
        </Text>
        
        <View className="flex-row justify-around my-4">
          <View className="items-center">
            <Text className="text-3xl font-pbold text-secondary">{totalScore}</Text>
            <Text className="text-sm text-textMedium">Total Score</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-3xl font-pbold text-secondary">{correctVerses}/{gameResults.totalVerses}</Text>
            <Text className="text-sm text-textMedium">Verses Correct</Text>
          </View>
        </View>
        
        <View className="bg-inputBg p-4 rounded-lg">
          <Text className="text-center text-primary font-pmedium">
            {getPerformanceMessage(correctVerses, gameResults.totalVerses, totalScore)}
          </Text>
        </View>
      </View>
      
      <Text className="text-lg font-pmedium text-primary mb-2">
        Verse Results
      </Text>
      
      <FlatList
        data={gameResults.results}
        renderItem={renderResultItem}
        keyExtractor={(item, index) => `result-${index}`}
        className="mb-4"
      />
      
      <View className="flex-row justify-between mt-auto">
        <Pressable
          className="bg-secondary rounded-xl py-3 px-6 flex-1 mr-2"
          onPress={onPlayAgain}
        >
          <Text className="text-white text-center font-pmedium">
            Play Again
          </Text>
        </Pressable>
        
        <Pressable
          className="bg-primary rounded-xl py-3 px-6 flex-1 ml-2"
          onPress={onNewGame}
        >
          <Text className="text-white text-center font-pmedium">
            New Game
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getPerformanceMessage(correct: number, total: number, score: number): string {
  const percentage = (correct / total) * 100;
  
  if (percentage === 100) {
    return "Perfect! You're a Bible verse master! 🏆";
  } else if (percentage >= 80) {
    return "Excellent work! Your Bible knowledge is impressive! 🌟";
  } else if (percentage >= 60) {
    return "Good job! Keep studying to improve your score! 📚";
  } else if (percentage >= 40) {
    return "Nice effort! More practice will help you improve! 💪";
  } else {
    return "Keep practicing! You'll get better with time! 🙏";
  }
}
