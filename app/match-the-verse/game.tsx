import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from '../../components/BottomSheet';
import GameResults from '../../components/GameResults';
import { useTheme } from '../../lib/ThemeContext';
import { useGameState } from '../../lib/gameState';

// Load JSON data
const references: string[] = require('../../assets/json/references.json');
const bookMap: { [key: number]: string } = {
  1: 'Genesis', 19: 'Psalm', 20: 'Proverbs', 23: 'Isaiah', 24: 'Jeremiah',
  40: 'Matthew', 42: 'Luke', 43: 'John', 45: 'Romans', 46: '1 Corinthians',
  47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians', 50: 'Philippians',
  51: 'Colossians', 52: '1 Thessalonians', 55: '2 Timothy', 58: 'Hebrews',
  59: 'James', 60: '1 Peter', 62: '1 John',
};

const rawKjvData: { resultset: { row: { field: [number, number, number, number, string] }[] } } = require('../../assets/json/kjv.json');
const verses: { [key: string]: string } = rawKjvData.resultset.row.reduce((acc, row) => {
  const [verseId, bookId, chapter, verse, text] = row.field;
  const bookName = bookMap[bookId] || `Book${bookId}`;
  acc[`${bookName} ${chapter}:${verse}`] = text;
  return acc;
}, {} as { [key: string]: string });

interface GameCard {
  id: number;
  reference: string;
  content: string;
  matched: boolean;
  incorrectAttempts: number;
}

const splitVerse = (verse: string) => {
  const words = verse.split(" ");
  const midPoint = Math.floor(words.length / 2);
  let breakPoint = midPoint;
  
  for (let i = midPoint - 2; i <= midPoint + 2 && i < words.length; i++) {
    if (i > 0 && (words[i - 1].includes(",") || words[i - 1].includes(";") || words[i - 1].includes(":"))) {
      breakPoint = i;
      break;
    }
  }
  
  return {
    firstHalf: words.slice(0, breakPoint).join(" "),
    secondHalf: words.slice(breakPoint).join(" ")
  };
};

const GameScreen: React.FC = () => {
  // Hooks with safe initialization
  const { width } = Dimensions.get('window');
  const [contextErrors, setContextErrors] = useState<string[]>([]);
  
  let router: any = null, isDark = false, gameData = { level: 1, totalScore: 0, streak: 0, matchedVerses: [], achievements: [] }, saveGameData = () => {};
  
  try {
    router = useRouter();
    isDark = useTheme().isDark;
    const gameState = useGameState();
    gameData = gameState.gameData;
    saveGameData = gameState.saveGameData;
  } catch (error) {
    setContextErrors(prev => [...prev, `Context Error: ${error.message}`]);
  }

  // Game state
  const [currentVerses, setCurrentVerses] = useState<Array<{ reference: string; firstHalf: string; secondHalf: string }>>([]);
  const [cardList, setCardList] = useState<GameCard[]>([]);
  const [optionList, setOptionList] = useState<Array<{ id: number; content: string }>>([]);
  const [revealedCards, setRevealedCards] = useState<{ [key: number]: boolean }>({});
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [lockedCards, setLockedCards] = useState<{ [key: number]: boolean }>({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [matchedCount, setMatchedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [cardRevealTime, setCardRevealTime] = useState<number | null>(null);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [levelCompletionData, setLevelCompletionData] = useState({
    totalTime: '', accuracy: 0, hintsUsed: 0, isPersonalBest: false,
    achievements: [] as { title: string; description: string }[],
  });
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState({
    title: '', message: '', type: 'info' as 'success' | 'error' | 'info',
  });

  const STORAGE_KEY = "matchTheVerse_progress";

  // Load/Save game state
  const saveGameState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentVerses, cardList, optionList, revealedCards, selectedCard,
        lockedCards, score, streak, matchedCount, gameStartTime,
        lastPlayed: new Date().toISOString(),
      }));
    } catch (error) {}
  };

  const initializeGame = () => {
    if (!references?.length || !verses || !Object.keys(verses).length) return;
    
    const availableVerses = references.filter(ref => !gameData.matchedVerses.includes(ref) && verses[ref]);
    if (!availableVerses.length) return;
    
    const selectedRefs = availableVerses.sort(() => 0.5 - Math.random()).slice(0, Math.min(5, availableVerses.length));
    const gameVerses = selectedRefs.map(ref => verses[ref] ? { reference: ref, ...splitVerse(verses[ref]) } : null).filter(Boolean);
    if (!gameVerses.length) return;

    setCurrentVerses(gameVerses);
    setCardList(gameVerses.map((verse, index) => ({
      id: index, reference: verse.reference, content: verse.firstHalf, matched: false, incorrectAttempts: 0,
    })));
    setOptionList(gameVerses.map((verse, index) => ({ id: index, content: verse.secondHalf })).sort(() => 0.5 - Math.random()));
    
    // Reset all state
    setRevealedCards({});
    setSelectedCard(null);
    setLockedCards({});
    setMatchedCount(0);
    setScore(0);
    setStreak(gameData.streak || 0);
    setGameStartTime(Date.now());
    setShowResults(false);
  };

  // Load saved game or initialize
  useEffect(() => {
    const loadGame = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const state = JSON.parse(saved);
          setCurrentVerses(state.currentVerses || []);
          setCardList(state.cardList || []);
          setOptionList(state.optionList || []);
          setRevealedCards(state.revealedCards || {});
          setSelectedCard(state.selectedCard || null);
          setLockedCards(state.lockedCards || {});
          setScore(state.score || 0);
          setStreak(state.streak || gameData.streak || 0);
          setMatchedCount(state.matchedCount || 0);
          setGameStartTime(state.gameStartTime || Date.now());
          return;
        }
      } catch (error) {}
      if (!contextErrors.length) initializeGame();
    };
    loadGame();
  }, [contextErrors]);

  // Save when state changes
  useEffect(() => {
    if (currentVerses.length > 0) saveGameState();
  }, [currentVerses, cardList, revealedCards, selectedCard, lockedCards, score, streak, matchedCount]);

  // Timer effect
  useEffect(() => {
    if (!cardRevealTime) return;
    const interval = setInterval(() => setTimer(Date.now() - cardRevealTime), 100);
    return () => clearInterval(interval);
  }, [cardRevealTime]);

  const handleCardReveal = (cardId: number) => {
    if (isProcessingAnswer || lockedCards[cardId] || !cardList?.length || !cardList[cardId] || revealedCards[cardId] || cardList[cardId].matched) return;

    const newLockedCards: { [key: number]: boolean } = {};
    cardList.forEach((card, index) => {
      if (index !== cardId && !card.matched) newLockedCards[index] = true;
    });
    
    setLockedCards(newLockedCards);
    setRevealedCards(prev => ({ ...prev, [cardId]: true }));
    setSelectedCard(cardId);
    setCardRevealTime(Date.now());
    setTimer(0);
  };

  const handleOptionSelect = async (optionId: number) => {
    if (selectedCard === null || isProcessingAnswer) return;
    setIsProcessingAnswer(true);

    const isMatch = selectedCard === optionId;
    const timeTaken = timer / 1000;

    if (isMatch) {
      let pointsEarned = 100 + (timeTaken <= 5 ? 50 : 0);
      const newStreak = streak + 1;
      pointsEarned += newStreak * 25;

      setScore(prev => prev + pointsEarned);
      setStreak(newStreak);
      setFeedback(`Correct! +${pointsEarned} points`);
      setCardList(prev => prev.map(card => card.id === selectedCard ? { ...card, matched: true } : card));
      
      const newMatchedCount = matchedCount + 1;
      setMatchedCount(newMatchedCount);
      if (newMatchedCount === cardList.length) setTimeout(completeLevel, 1500);
    } else {
      setStreak(0);
      setFeedback('Incorrect! Try again later.');
      setCardList(prev => prev.map(card => 
        card.id === selectedCard ? { ...card, incorrectAttempts: card.incorrectAttempts + 1 } : card
      ));
      setTimeout(() => setRevealedCards(prev => ({ ...prev, [selectedCard]: false })), 1500);
    }

    setLockedCards({});
    setSelectedCard(null);
    setCardRevealTime(null);
    setTimeout(() => {
      setFeedback('');
      setIsProcessingAnswer(false);
    }, 2000);
  };

  const completeLevel = async () => {
    const totalGameTime = Date.now() - gameStartTime;
    const minutes = Math.floor(totalGameTime / 60000);
    const seconds = Math.floor((totalGameTime % 60000) / 1000);
    const totalTimeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const totalAttempts = cardList.reduce((sum, card) => sum + card.incorrectAttempts + 1, 0);
    const accuracyPercentage = Math.round((cardList.length / totalAttempts) * 100);
    
    const newAchievements: { title: string; description: string }[] = [];
    if (streak >= 5) newAchievements.push({ title: 'Streak Master', description: 'Achieved a streak of 5 or more!' });
    if (accuracyPercentage === 100) newAchievements.push({ title: 'Perfect Score', description: 'Completed level with 100% accuracy!' });
    if (totalGameTime < 60000) newAchievements.push({ title: 'Speed Runner', description: 'Completed level in under 1 minute!' });

    setLevelCompletionData({
      totalTime: totalTimeString, accuracy: accuracyPercentage, hintsUsed: 0,
      isPersonalBest: score > (gameData.totalScore / gameData.level), achievements: newAchievements,
    });

    const newMatchedVerses = [...gameData.matchedVerses, ...currentVerses.map(v => v.reference)];
    const allAchievements = [...gameData.achievements];
    newAchievements.forEach(achievement => {
      if (!allAchievements.includes(achievement.title)) allAchievements.push(achievement.title);
    });

    saveGameData({
      level: gameData.level + 1, totalScore: gameData.totalScore + score, streak,
      matchedVerses: newMatchedVerses, achievements: allAchievements,
    });

    try { await AsyncStorage.removeItem(STORAGE_KEY); } catch (error) {}
    setShowResults(true);
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    initializeGame();
  };

  const handleGoHome = () => router?.push?.('/');

  // Results screen
  if (showResults) {
    const currentReference = currentVerses[0]?.reference || '';
    return (
      <GameResults
        gameType="Bible Verse Puzzle" level={gameData.level} reference={currentReference}
        verseText={currentReference ? verses[currentReference] : ''} score={score}
        isPersonalBest={levelCompletionData.isPersonalBest} time={levelCompletionData.totalTime}
        accuracy={levelCompletionData.accuracy} hintsUsed={0} maxHints={3} shekelsEarned={0}
        achievements={levelCompletionData.achievements}
        levelProgress={{ current: gameData.level, next: gameData.level + 1, 
          percentage: Math.min(100, (gameData.matchedVerses.length / references.length) * 100) }}
        onPlayAgain={handlePlayAgain} onNextVerse={handlePlayAgain} onRetryLevel={handlePlayAgain}
        onHome={handleGoHome} inspirationalVerse={{ text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" }}
      />
    );
  }

  // Error screen
  if (contextErrors.length > 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ backgroundColor: isDark ? '#374151' : '#FFFFFF', borderRadius: 20, padding: 24, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 }}>
          <Text style={{ color: '#EF4444', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Context Error</Text>
          {contextErrors.map((error, index) => (
            <Text key={index} style={{ color: '#DC2626', marginBottom: 8, textAlign: 'center' }}>{error}</Text>
          ))}
          <Text style={{ color: '#DC2626', textAlign: 'center', marginBottom: 16 }}>Please check your app's navigation setup and context providers.</Text>
          <Pressable onPress={handleGoHome} style={{ backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Try Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Main game UI
  const cardStyle = (card: GameCard) => ({
    padding: 18, borderRadius: 16, borderWidth: 2, marginBottom: 12,
    backgroundColor: card.matched ? (isDark ? '#064E3B' : '#D1FAE5') 
      : revealedCards[card.id] ? (selectedCard === card.id ? (isDark ? '#312E81' : '#EDE9FE') : (isDark ? '#1E3A8A' : '#DBEAFE'))
      : lockedCards[card.id] ? (isDark ? '#1F2937' : '#F1F5F9') : (isDark ? '#374151' : '#FFFFFF'),
    borderColor: card.matched ? '#10B981' 
      : revealedCards[card.id] ? (selectedCard === card.id ? '#8B5CF6' : '#3B82F6')
      : card.incorrectAttempts > 0 ? '#EF4444' : (isDark ? '#4B5563' : '#E2E8F0'),
    opacity: card.matched ? 0.7 : lockedCards[card.id] ? 0.4 : 1,
  });

  const optionStyle = (option: any, isMatched: boolean) => ({
    padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 12,
    backgroundColor: isMatched ? (isDark ? '#064E3B' : '#D1FAE5')
      : selectedCard === null || isProcessingAnswer ? (isDark ? '#374151' : '#F8FAFC') : (isDark ? '#312E81' : '#EDE9FE'),
    borderColor: isMatched ? '#10B981' 
      : selectedCard === null || isProcessingAnswer ? (isDark ? '#4B5563' : '#E2E8F0') : (isDark ? '#6366F1' : '#8B5CF6'),
    opacity: isMatched ? 0.5 : (selectedCard === null || isProcessingAnswer) ? 0.6 : 1,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={handleGoHome} style={{ backgroundColor: isDark ? '#374151' : '#F1F5F9', padding: 12, borderRadius: 16 }}>
              <Ionicons name="home-outline" size={22} color={isDark ? '#D1D5DB' : '#64748B'} />
            </Pressable>
            <Text style={{ marginLeft: 16, fontSize: 22, fontWeight: 'bold', color: isDark ? '#F1F5F9' : '#1E293B' }}>Level {gameData.level}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20, backgroundColor: isDark ? '#374151' : '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
              <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
              <Text style={{ marginLeft: 6, fontWeight: 'bold', color: isDark ? '#F1F5F9' : '#92400E', fontSize: 16 }}>{gameData.totalScore + score}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#374151' : '#FEE2E2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
              <Ionicons name="flame-outline" size={20} color="#EF4444" />
              <Text style={{ marginLeft: 6, fontWeight: 'bold', color: isDark ? '#F1F5F9' : '#B91C1C', fontSize: 16 }}>{streak}</Text>
            </View>
          </View>
        </View>

        {/* Options */}
        <View style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: isDark ? '#F1F5F9' : '#1E293B' }}>Select the matching second half:</Text>
          {optionList?.length ? optionList.map(option => {
            const isMatched = cardList.find(card => card.id === option.id)?.matched || false;
            return (
              <Pressable key={option.id} onPress={() => handleOptionSelect(option.id)} disabled={selectedCard === null || isProcessingAnswer} style={optionStyle(option, isMatched)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isMatched && <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 8 }} />}
                  <Text style={{ fontSize: 15, lineHeight: 22, flex: 1, color: isMatched ? '#10B981' : selectedCard === null || isProcessingAnswer ? (isDark ? '#9CA3AF' : '#64748B') : (isDark ? '#E0E7FF' : '#3730A3'), textDecorationLine: isMatched ? 'line-through' : 'none' }}>
                    {option.content}
                  </Text>
                </View>
              </Pressable>
            );
          }) : <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', textAlign: 'center', padding: 20 }}>Loading options...</Text>}
        </View>

        {/* Cards */}
        <View style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: isDark ? '#F1F5F9' : '#1E293B' }}>Tap a card to reveal the verse:</Text>
          {cardList?.length ? cardList.map(card => (
            <Pressable key={card.id} onPress={() => handleCardReveal(card.id)} disabled={lockedCards[card.id] || isProcessingAnswer} style={cardStyle(card)}>
              {card.matched ? (
                <Text style={{ color: '#10B981', fontWeight: '600', textAlign: 'center', fontSize: 16 }}>✓ Matched!</Text>
              ) : revealedCards[card.id] ? (
                <>
                  <Text style={{ color: selectedCard === card.id ? '#8B5CF6' : '#3B82F6', fontWeight: '600', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>{card.reference}</Text>
                  <Text style={{ fontSize: 15, lineHeight: 22, color: isDark ? '#F1F5F9' : '#1E293B' }}>{card.content}</Text>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: card.incorrectAttempts > 0 ? '#EF4444' : '#8B5CF6', fontWeight: '600', fontSize: 14, marginBottom: 4 }}>{card.reference}</Text>
                  <Text style={{ fontSize: 14, color: lockedCards[card.id] ? (isDark ? '#6B7280' : '#9CA3AF') : card.incorrectAttempts > 0 ? '#EF4444' : (isDark ? '#9CA3AF' : '#64748B') }}>
                    {lockedCards[card.id] ? 'Locked' : card.incorrectAttempts > 0 ? 'Try Again' : 'Tap to Reveal'}
                  </Text>
                  {card.incorrectAttempts > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="warning-outline" size={12} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>{card.incorrectAttempts} incorrect attempt{card.incorrectAttempts > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          )) : <Text style={{ color: isDark ? '#9CA3AF' : '#64748B', textAlign: 'center', padding: 20 }}>Loading cards...</Text>}
        </View>
      </ScrollView>

      {/* Feedback Overlay */}
      {feedback && (
        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -120 }, { translateY: -60 }], backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12, borderWidth: 3, borderColor: '#8B5CF6', minWidth: 240, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#8B5CF6', textAlign: 'center', marginBottom: 8 }}>{feedback}</Text>
          {timer > 0 && selectedCard !== null && (
            <Text style={{ fontSize: 14, textAlign: 'center', color: isDark ? '#9CA3AF' : '#64748B' }}>Time: {(timer / 1000).toFixed(1)}s</Text>
          )}
        </View>
      )}

      <BottomSheet
        isVisible={bottomSheetVisible}
        onClose={() => { setBottomSheetVisible(false); handleGoHome(); }}
        title={bottomSheetContent.title}
        message={bottomSheetContent.message}
        type={bottomSheetContent.type}
        actions={[{ text: 'OK', onPress: () => { setBottomSheetVisible(false); handleGoHome(); }, primary: true }]}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
