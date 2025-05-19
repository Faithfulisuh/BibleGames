import { REACT_APP_API_KEY } from "@env";
import React, { useState, useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, Text, View, Alert } from "react-native";

const API_KEY = REACT_APP_API_KEY;
const BIBLE_ID = "de4e12af7f28f599-02"; // ESV Bible ID
const VERSES_PER_GAME = 10;
const TIME_PER_VERSE = 30; // seconds

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

//Let there be a functionality that allows users to drag word tiles and rearrange them in the answer box.

export default function GamePlayScreen({ gameConfig, onGameComplete, onNewGame }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameVerses, setGameVerses] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [answer, setAnswer] = useState([]);
  const [scrambled, setScrambled] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showReference, setShowReference] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_VERSE);
  const [gameResults, setGameResults] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadGameVerses();
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

  const loadGameVerses = async () => {
    setLoading(true);
    try {
      let verses = [];
      
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
      const initialResults = selectedVerses.map(verse => ({
        reference: verse.reference,
        verseId: verse.id,
        completed: false,
        correct: false,
        timeRemaining: 0,
        points: 0
      }));
      
      setGameVerses(selectedVerses);
      setGameResults(initialResults);
      setLoading(false);
    } catch (error) {
      console.error("Error loading game verses:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchVersesFromChapter = async (chapterId) => {
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
    
    // Fetch full verse content for each verse
    const versesWithContent = await Promise.all(
      shuffle(data.data).slice(0, VERSES_PER_GAME).map(async (verse) => {
        return await fetchVerseContent(verse.id);
      })
    );
    
    return versesWithContent;
  };

  const fetchVersesFromBook = async (bookId) => {
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
    const chapters = chaptersData.data.filter(chapter => chapter.id !== `${bookId}.intro`);
    
    // Randomly select chapters to get verses from
    const selectedChapters = shuffle(chapters).slice(0, Math.min(5, chapters.length));
    
    // Get verses from each selected chapter
    let allVerses = [];
    for (const chapter of selectedChapters) {
      const versesResponse = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/chapters/${chapter.id}/verses`,
        {
          headers: { "api-key": API_KEY },
        }
      );
      
      if (!versesResponse.ok) continue;
      
      const versesData = await versesResponse.json();
      allVerses = [...allVerses, ...versesData.data];
      
      if (allVerses.length >= VERSES_PER_GAME) break;
    }
    
    // Shuffle and limit verses
    allVerses = shuffle(allVerses).slice(0, VERSES_PER_GAME);
    
    // Fetch full verse content for each verse
    const versesWithContent = await Promise.all(
      allVerses.map(async (verse) => {
        return await fetchVerseContent(verse.id);
      })
    );
    
    return versesWithContent;
  };

  const fetchVerseContent = async (verseId) => {
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/verses/${verseId}`,
      {
        headers: { "api-key": API_KEY },
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch verse content");
    }
    
    const data = await response.json();
    return data.data;
  };

  const setupCurrentVerse = () => {
    if (currentVerseIndex >= gameVerses.length) {
      endGame();
      return;
    }
    
    const currentVerse = gameVerses[currentVerseIndex];
    
    // Process the verse content
    const verseText = currentVerse.content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .trim();
    
    const words = verseText
      .replace(/[.,;:!?"'()\[\]{}]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.trim() !== "");
    
    setScrambled(shuffle(words));
    setAnswer([]);
    setIsCorrect(null);
    setShowReference(false);
    setTimeLeft(TIME_PER_VERSE);
    
    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const handleSelectWord = (word, idx) => {
    setAnswer([...answer, word]);
    setScrambled(scrambled.filter((_, i) => i !== idx));
  };

  const handleRemoveWord = (word, idx) => {
    setScrambled([...scrambled, word]);
    setAnswer(answer.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
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
    
    // Calculate points based on time remaining and correctness
    let points = 0;
    if (isAnswerCorrect) {
      // Base points: 50
      // Time bonus: up to 50 additional points based on time remaining
      points = 50 + Math.floor((timeLeft / TIME_PER_VERSE) * 50);
    }
    
    // Update game results
    const updatedResults = [...gameResults];
    updatedResults[currentVerseIndex] = {
      ...updatedResults[currentVerseIndex],
      completed: true,
      correct: isAnswerCorrect,
      timeRemaining: timeLeft,
      points: points
    };
    setGameResults(updatedResults);
    
    // Pause timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Move to next verse after a short delay
    setTimeout(() => {
      setCurrentVerseIndex(prev => prev + 1);
    }, 2000);
  };

  const handleTimeUp = () => {
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
      setCurrentVerseIndex(prev => prev + 1);
    }, 2000);
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameOver(true);
    
    // Calculate total score
    const totalScore = gameResults.reduce((sum, result) => sum + result.points, 0);
    const correctVerses = gameResults.filter(result => result.correct).length;
    
    // Pass results to parent component
    onGameComplete({
      results: gameResults,
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
      {/* Progress and Timer */}
      <View className="w-full px-4 py-2 flex-row justify-between items-center bg-cardBg">
        <Text className="font-pmedium text-primary">
          Verse {currentVerseIndex + 1} of {gameVerses.length}
        </Text>
        <View className="flex-row items-center">
          <Text className={`font-pbold text-lg ${timeLeft <= 10 ? 'text-error' : 'text-primary'}`}>
            {timeLeft}s
          </Text>
        </View>
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
            answer.map((word, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleRemoveWord(word, idx)}
                className="bg-secondary rounded-xl px-3 py-1 m-1"
              >
                <Text className="text-white font-pmedium">
                  {word}
                </Text>
              </Pressable>
            ))
          )}
        </View>
        
        {/* Scrambled Words */}
        <View className="flex-row flex-wrap justify-center mb-6">
          {scrambled.map((word, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleSelectWord(word, idx)}
              className="border-2 border-accent rounded-xl px-4 py-2 m-1 bg-cardBg"
            >
              <Text className="text-primary font-pmedium text-base">
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {/* Submit Button */}
        <Pressable
          className="bg-secondary rounded-xl py-4 mt-2"
          onPress={handleSubmit}
          disabled={answer.length === 0}
        >
          <Text className="text-white text-center text-lg font-pbold">
            Submit
          </Text>
        </Pressable>
        
        {/* Feedback Messages */}
        {isCorrect === true && (
          <View className="mt-2">
            <Text className="text-success text-center font-pbold">
              Correct! Well done!
            </Text>
            <Text className="text-textMedium text-center text-sm mt-1">
              Points: {gameResults[currentVerseIndex]?.points || 0}
            </Text>
          </View>
        )}
        {isCorrect === false && (
          <Text className="text-error text-center mt-2 font-pbold">
            Not quite right!
          </Text>
        )}
      </View>
      
      {/* New Game Button */}
      <Pressable
        className="mt-auto mb-4 bg-primary rounded-xl py-3 px-6"
        onPress={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          onNewGame();
        }}
      >
        <Text className="text-white font-pmedium">Quit Game</Text>
      </Pressable>
    </View>
  );
}
