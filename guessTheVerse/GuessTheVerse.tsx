import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Image, ImageBackground, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import characters from '../characters.json';
import BottomSheet from '../components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';

const GuessTheVerse = () => {
  const [allCharacters, setAllCharacters] = useState<typeof characters>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentCharacter, setCurrentCharacter] = useState<(typeof characters)[0] | null>(null);
  const [shownHints, setShownHints] = useState<string[]>([]);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedCharacters, setUsedCharacters] = useState<string[]>([]);
  
  // Bottom sheet states
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetConfig, setBottomSheetConfig] = useState<{
    title: string;
    message?: string;
    type: 'success' | 'error' | 'info';
    actions: { text: string; onPress: () => void; primary?: boolean }[];
  }>({ 
    title: '', 
    type: 'info',
    actions: [] 
  });

  // Load saved game state or initialize new game
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        // Load saved game data
        const savedLevel = await AsyncStorage.getItem('guessTheVerse_level');
        const savedUsedCharacters = await AsyncStorage.getItem('guessTheVerse_usedCharacters');
        const savedAllCharacters = await AsyncStorage.getItem('guessTheVerse_allCharacters');
        
        if (savedLevel && savedUsedCharacters && savedAllCharacters) {
          // Restore saved state
          const level = parseInt(savedLevel);
          const usedChars = JSON.parse(savedUsedCharacters);
          const allChars = JSON.parse(savedAllCharacters);
          
          setCurrentLevel(level);
          setUsedCharacters(usedChars);
          setAllCharacters(allChars);
          
          // Select the next character based on saved state
          selectNextCharacter(allChars, usedChars);
        } else {
          // Initialize new game
          const shuffled = [...characters].sort(() => Math.random() - 0.5);
          setAllCharacters(shuffled);
          selectNextCharacter(shuffled, []);
        }
      } catch (error) {
        console.error('Error loading saved game:', error);
        // Fallback to new game
        const shuffled = [...characters].sort(() => Math.random() - 0.5);
        setAllCharacters(shuffled);
        selectNextCharacter(shuffled, []);
      }
    };
    
    loadSavedState();
  }, []);

  // Select the next character that hasn't been used yet
  const selectNextCharacter = (chars: typeof characters, used: string[]) => {
    const availableChars = chars.filter(char => !used.includes(char.name));
    
    if (availableChars.length === 0) {
      // All characters have been used, game completed
      const handleRestart = () => {
        const newShuffled = [...characters].sort(() => Math.random() - 0.5);
        setAllCharacters(newShuffled);
        setUsedCharacters([]);
        setCurrentLevel(1);
        selectNextCharacter(newShuffled, []);
        setBottomSheetVisible(false);
      };
      
      setBottomSheetConfig({
        title: "Congratulations!",
        message: "You've completed all levels! The game will restart with shuffled characters.",
        type: 'success',
        actions: [{ text: "Restart", onPress: handleRestart, primary: true }]
      });
      setBottomSheetVisible(true);
      return;
    }
    
    const nextChar = availableChars[0];
    setCurrentCharacter(nextChar);
    setShownHints([nextChar.hints[0]]);
    setGuess('');
    setMessage('');
    setIsCorrect(false);
  };

  // Show the next hint if available
  const showNextHint = () => {
    if (currentCharacter && shownHints.length < currentCharacter.hints.length) {
      setShownHints([...shownHints, currentCharacter.hints[shownHints.length]]);
    }
  };

  // Handle the player's guess
  const handleGuess = () => {
    if (!guess.trim() || !currentCharacter) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedAnswer = currentCharacter.name.toLowerCase();

    if (normalizedGuess === normalizedAnswer) {
      setMessage('Correct! 🎉');
      setIsCorrect(true);
    } else {
      setMessage('Try again! 🤔');
    }
  };

  // Move to the next level
  const nextLevel = () => {
    if (currentCharacter) {
      const newUsed = [...usedCharacters, currentCharacter.name];
      const newLevel = currentLevel + 1;
      
      // Update state
      setUsedCharacters(newUsed);
      setCurrentLevel(newLevel);
      
      // Save progress
      saveGameProgress(newLevel, newUsed, allCharacters);
      
      // Select next character
      selectNextCharacter(allCharacters, newUsed);
    }
  };
  
  // Save game progress to AsyncStorage
  const saveGameProgress = async (level: number, used: string[], all: typeof characters) => {
    try {
      await AsyncStorage.setItem('guessTheVerse_level', level.toString());
      await AsyncStorage.setItem('guessTheVerse_usedCharacters', JSON.stringify(used));
      await AsyncStorage.setItem('guessTheVerse_allCharacters', JSON.stringify(all));
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  if (!currentCharacter) {
    return (
      <View className="flex-1 bg-background">
        <Text className="text-lg text-center mt-12 text-textDark">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView className="flex-1" contentContainerStyle={{flexGrow: 1, paddingBottom: 30}}>
        {/* Level indicator */}
      <View className="p-4 items-center">
        <Text className="text-2xl font-pbold text-primary">Level {currentLevel}</Text>
      </View>

      {/* Question container */}
      <View className="bg-cardBg mx-4 rounded-2xl p-5 shadow-md border-l-4 border-primary">
        <Text className="text-xl font-pbold text-textDark text-center mb-2">What Bible place am I?</Text>
        <Text className="text-4xl text-center my-4">🌍</Text>

        {/* Hints */}
        <View className="mb-5">
          {shownHints.map((hint, index) => (
            <View key={index} className="bg-primary p-4 rounded-xl mb-2.5">
              <Text className="text-white text-lg font-pbold text-center">{hint}</Text>
            </View>
          ))}
        </View>

        {!isCorrect ? (
          <>
            {/* Input area */}
            <TextInput
              className="bg-inputBg p-4 rounded-xl text-lg mb-4 text-center border-2 border-gray-300"
              value={guess}
              onChangeText={setGuess}
              placeholder="Type your answer..."
              onSubmitEditing={handleGuess}
            />
            
            <Pressable className="bg-success p-4 rounded-xl items-center mb-2.5" onPress={handleGuess}>
              <Text className="text-white text-base font-pbold">Submit Answer</Text>
            </Pressable>
            
            {/* Show hint button */}
            {currentCharacter && shownHints.length < currentCharacter.hints.length && (
              <View className="flex-row items-center">
                <Pressable className="flex-1 bg-secondary p-4 rounded-xl items-center" onPress={showNextHint}>
                  <Text className="text-white text-base font-pbold">Show Next Hint</Text>
                </Pressable>
                <View className="bg-white bg-opacity-80 rounded-xl p-3 ml-2.5 min-w-[60px] items-center border-2 border-gray-300">
                  <Text className="font-pbold text-textDark">
                    {shownHints.length}/{currentCharacter.hints.length}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View className="items-center my-4">
            <Text className="text-6xl text-center my-4">🎉</Text>
            <View>
              <Text className="text-sm font-pbold text-textMedium mb-2 text-center">THE ANSWER WAS</Text>
              <Text className="text-2xl font-pbold text-primary bg-primary bg-opacity-10 py-3 px-6 rounded-xl mb-5 border-2 border-primary border-opacity-30 text-center">{currentCharacter.name}</Text>
            </View>
            <Pressable className="bg-primary p-4 rounded-xl items-center w-full" onPress={nextLevel}>
              <Text className="text-white text-base font-pbold">▶️ NEXT LEVEL</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Message toast */}
      {message && (
        <View className={`absolute bottom-5 left-5 right-5 p-4 rounded-xl items-center ${message.includes('Correct') ? 'bg-success border-2 border-green-600' : 'bg-error border-2 border-red-600'}`}>
          <Text className="text-white text-lg font-pbold">{message}</Text>
        </View>
      )}
      </ScrollView>
      
      {/* Bottom Sheet */}
      <BottomSheet
        isVisible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title={bottomSheetConfig.title}
        message={bottomSheetConfig.message}
        type={bottomSheetConfig.type}
        actions={bottomSheetConfig.actions}
      />
    </KeyboardAvoidingView>
  );
};

// No StyleSheet needed as we're using Tailwind CSS

export default GuessTheVerse;