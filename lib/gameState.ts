import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGameState = () => {
  const [gameData, setGameData] = useState({
    level: 1,
    totalScore: 0,
    streak: 0,
    matchedVerses: [] as string[],
    achievements: [] as string[],
  });

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('bibleGameData');
        if (savedData) {
          setGameData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };
    loadGameData();
  }, []);

  const saveGameData = async (newData: Partial<typeof gameData>) => {
    const updatedData = { ...gameData, ...newData };
    setGameData(updatedData);
    try {
      await AsyncStorage.setItem('bibleGameData', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  return { gameData, saveGameData };
};
