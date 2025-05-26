import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeContext';
import BookSelector from '../../components/BookSelector';
import ChapterSelector from '../../components/ChapterSelector';
import VersePuzzleGame from '../../components/VersePuzzleGame';
import GameResults from '../../components/GameResults';
import { REACT_APP_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the game states
enum GameState {
  BOOK_SELECTION = 'book_selection',
  CHAPTER_SELECTION = 'chapter_selection',
  VERSE_SELECTION = 'verse_selection',
  PLAYING = 'playing',
  RESULTS = 'results',
  LOADING = 'loading',
  ERROR = 'error',
}

// Define the Book interface
interface Book {
  id: string;
  name: string;
  chapters: number;
  testament: 'old' | 'new';
  isPopular?: boolean;
}

// Define interfaces for API responses
interface ApiBook {
  id: string;
  name: string;
  abbreviation: string;
  bibleId: string;
}

interface ApiChapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
}

interface ApiVerse {
  id: string;
  reference: string;
  content: string;
  fragments?: string[];
}

// Bible API constants
const API_KEY = REACT_APP_API_KEY;
const BIBLE_ID = "de4e12af7f28f599-01"; // KJV Bible ID

export default function BibleVersePuzzleScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  // Game state management
  const [gameState, setGameState] = useState<GameState>(GameState.BOOK_SELECTION);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<ApiVerse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [gameResults, setGameResults] = useState<{
    completed: boolean;
    timeRemaining: number;
    hintsUsed: number;
    score: number;
  } | null>(null);
  
  // API data
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [chapters, setChapters] = useState<ApiChapter[]>([]);
  const [verses, setVerses] = useState<ApiVerse[]>([]);
  
  // Load books from the API when component mounts
  useEffect(() => {
    fetchBooks();
    loadFavoriteBooks();
  }, []);
  
  // Load favorite books from AsyncStorage
  const loadFavoriteBooks = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteBooks');
      if (storedFavorites) {
        setFavoriteBooks(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorite books:', error);
    }
  };
  
  // Toggle favorite status for a book
  const handleToggleFavorite = async (bookId: string) => {
    const newFavorites = favoriteBooks.includes(bookId)
      ? favoriteBooks.filter(id => id !== bookId)
      : [...favoriteBooks, bookId];
    
    setFavoriteBooks(newFavorites);
    
    try {
      await AsyncStorage.setItem('favoriteBooks', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorite books:', error);
    }
  };
  
  // Fetch books from the Bible API
  const fetchBooks = async (): Promise<void> => {
    setGameState(GameState.LOADING);
    try {
      const response = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books`,
        {
          headers: { "api-key": API_KEY },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch Bible books");
      }

      const data = await response.json();
      setBooks(data.data);
      setGameState(GameState.BOOK_SELECTION);
    } catch (error) {
      console.error("Error fetching books:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setGameState(GameState.ERROR);
    }
  };
  
  // Fetch chapters for a specific book
  const fetchChapters = async (bookId: string): Promise<void> => {
    setGameState(GameState.LOADING);
    try {
      const response = await fetch(
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/books/${bookId}/chapters`,
        {
          headers: { "api-key": API_KEY },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch chapters");
      }

      const data = await response.json();
      // Filter out intro chapters
      const filteredChapters = data.data.filter(
        (chapter: ApiChapter) => chapter.id !== `${bookId}.intro`
      );
      setChapters(filteredChapters);
      setGameState(GameState.CHAPTER_SELECTION);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setGameState(GameState.ERROR);
    }
  };
  
  // Fetch verses for a specific chapter
  const fetchVerses = async (chapterId: string): Promise<void> => {
    setGameState(GameState.LOADING);
    try {
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
      const versesData = data.data;
      setVerses(versesData);
      
      // Select a random verse from the chapter
      if (versesData && versesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * versesData.length);
        const randomVerse = versesData[randomIndex];
        // Fetch the content of the random verse
        await fetchVerseContent(randomVerse.id);
      } else {
        throw new Error("No verses found in this chapter");
      }
    } catch (error) {
      console.error("Error fetching verses:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setGameState(GameState.ERROR);
    }
  };
  
  // Fetch verse content for a specific verse
  const fetchVerseContent = async (verseId: string): Promise<void> => {
    setGameState(GameState.LOADING);
    try {
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
      const verseData = data.data;
      
      // Create fragments from the verse content
      const content = verseData.content.replace(/<[^>]*>/g, "").trim();
      const fragments = createVerseFragments(content);
      
      setSelectedVerse({
        id: verseData.id,
        reference: verseData.reference,
        content: content,
        fragments: fragments
      } as ApiVerse & { fragments: string[] });
      
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Error fetching verse content:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setGameState(GameState.ERROR);
    }
  };
  
  // Create fragments from verse content for the puzzle
  const createVerseFragments = (content: string): string[] => {
    // Split the verse into logical fragments
    // This is a simple implementation - could be improved with NLP
    const words = content.split(/\s+/);
    const fragments: string[] = [];
    
    // Group words into fragments of 2-4 words each
    let currentFragment: string[] = [];
    
    words.forEach((word, index) => {
      currentFragment.push(word);
      
      // Create a fragment after 2-4 words or at the end
      if (
        currentFragment.length >= 2 && 
        (Math.random() < 0.4 || currentFragment.length >= 4 || index === words.length - 1)
      ) {
        fragments.push(currentFragment.join(" "));
        currentFragment = [];
      }
    });
    
    // Add any remaining words
    if (currentFragment.length > 0) {
      fragments.push(currentFragment.join(" "));
    }
    
    return fragments;
  };
  
  // Handle book selection
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    // Find the corresponding API book
    const apiBook = books.find(b => b.name === book.name);
    if (apiBook) {
      fetchChapters(apiBook.id);
    }
  };
  
  // Handle chapter selection
  const handleSelectChapter = (chapterNumber: number) => {
    setSelectedChapter(chapterNumber);
    setGameState(GameState.LOADING);
    
    // Find the corresponding chapter in the API data
    const chapter = chapters.find(c => c.number === chapterNumber.toString());
    if (chapter) {
      setSelectedChapterId(chapter.id);
      // Fetch verses and then select a random one
      fetchVerses(chapter.id);
    }
  };
  
  // Handle verse selection
  const handleVerseSelect = (verse: ApiVerse) => {
    fetchVerseContent(verse.id);
  };
  
  // Handle game completion
  const handleGameComplete = (result: {
    completed: boolean;
    timeRemaining: number;
    hintsUsed: number;
  }) => {
    // Calculate score based on time remaining and hints used
    const timeBonus = result.timeRemaining * 10;
    const hintPenalty = result.hintsUsed * 50;
    const baseScore = result.completed ? 1000 : 0;
    const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);
    
    setGameResults({
      ...result,
      score: finalScore,
    });
    
    setGameState(GameState.RESULTS);
  };
  
  // Handle play again
  const handlePlayAgain = () => {
    // Reset all state and go back to book selection
    setGameState(GameState.BOOK_SELECTION);
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedChapterId(null);
    setSelectedVerse(null);
    setGameResults(null);
    setVerses([]);
  };
  
  // Handle going back
  const handleBack = () => {
    switch (gameState) {
      case GameState.CHAPTER_SELECTION:
        // Go back to book selection
        setGameState(GameState.BOOK_SELECTION);
        setSelectedBook(null);
        break;
        
      case GameState.VERSE_SELECTION:
        // Go back to chapter selection
        setGameState(GameState.CHAPTER_SELECTION);
        setSelectedChapter(null);
        setSelectedChapterId(null);
        setVerses([]);
        break;
        
      case GameState.PLAYING:
        // Show confirmation dialog before exiting the game
        Alert.alert(
          "Exit Game?",
          "Are you sure you want to exit? Your progress will be lost.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Exit", 
              onPress: () => {
                // Go back to verse selection
                setGameState(GameState.VERSE_SELECTION);
                setSelectedVerse(null);
              }
            }
          ]
        );
        break;
        
      case GameState.RESULTS:
        // Go back to verse selection
        setGameState(GameState.VERSE_SELECTION);
        setSelectedVerse(null);
        setGameResults(null);
        break;
        
      case GameState.ERROR:
        // Try to fetch books again
        fetchBooks();
        break;
        
      default:
        // Return to the home screen
        router.back();
        break;
    }
  };
  
  // Render the current game state
  const renderGameState = () => {
    switch (gameState) {
      case GameState.LOADING:
        return (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#8B5CF6' : '#7C3AED'} />
            <Text className={`mt-4 ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
              Loading...
            </Text>
          </View>
        );
        
      case GameState.ERROR:
        return (
          <View className="flex-1 items-center justify-center p-4">
            <Ionicons 
              name="alert-circle" 
              size={48} 
              color={isDark ? '#F87171' : '#EF4444'} 
            />
            <Text 
              className={`text-xl font-pbold mt-4 text-center ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}
            >
              Error
            </Text>
            <Text 
              className={`text-base mt-2 text-center ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}
            >
              {errorMessage || "An unexpected error occurred."}
            </Text>
            <Pressable
              className="mt-6 bg-purpleGradientStart px-6 py-3 rounded-xl"
              onPress={fetchBooks}
            >
              <Text className="text-white font-pbold">Try Again</Text>
            </Pressable>
          </View>
        );
        
      case GameState.BOOK_SELECTION:
        // Convert API books to the format expected by BookSelector
        const formattedBooks: Book[] = books.map(book => {
          // Extract chapter count from the book ID (assuming format like GEN.1)
          const bookId = book.id.split('.')[0].toLowerCase();
          
          // Determine if it's Old or New Testament (simplified approach)
          const isOldTestament = [
            'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa',
            '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro',
            'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo',
            'oba', 'jon', 'mic', 'nam', 'hab', 'zep', 'hag', 'zec', 'mal'
          ].includes(bookId);
          
          // Determine if it's a popular book
          const isPopular = ['gen', 'psa', 'pro', 'jhn', 'rom', 'rev'].includes(bookId);
          
          return {
            id: book.id,
            name: book.name,
            chapters: 50, // This is a placeholder - we'll get actual chapters from API
            testament: isOldTestament ? 'old' : 'new',
            isPopular
          };
        });
        
        return (
          <ScrollView className="flex-1">
            <BookSelector 
              onSelectBook={handleSelectBook} 
              favorites={favoriteBooks}
              onToggleFavorite={handleToggleFavorite}
            />
          </ScrollView>
        );
        
      case GameState.CHAPTER_SELECTION:
        if (!selectedBook) return null;
        return (
          <ChapterSelector
            bookName={selectedBook.name}
            totalChapters={chapters.length}
            onSelectChapter={handleSelectChapter}
            onBack={() => handleBack()}
          />
        );
        
      case GameState.VERSE_SELECTION:
        return (
          <View className="flex-1 bg-white">
            {/* Header */}
            <View className="p-4 flex-row items-center border-b border-lightGray border-opacity-10">
              <Pressable onPress={() => handleBack()} className="mr-3">
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </Pressable>
              <View>
                <Text className="text-xl font-pbold text-textPrimary">
                  {selectedBook?.name} {selectedChapter}
                </Text>
                <Text className="text-textSecondary">
                  Select a verse to play
                </Text>
              </View>
            </View>
            
            {/* Verse list */}
            <ScrollView className="flex-1 p-4">
              {verses.map((verse) => (
                <Pressable
                  key={verse.id}
                  className="p-4 border-b border-lightGray border-opacity-10"
                  onPress={() => handleVerseSelect(verse)}
                >
                  <Text className="text-textPrimary font-pmedium">
                    {verse.reference}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );
        
      case GameState.PLAYING:
        if (!selectedVerse || !selectedVerse.fragments) return null;
        return (
          <VersePuzzleGame
            reference={selectedVerse.reference}
            fragments={selectedVerse.fragments}
            onComplete={handleGameComplete}
            onBack={() => handleBack()}
            maxTime={180} // 3 minutes
            maxHints={3}
          />
        );
        
      case GameState.RESULTS:
        if (!selectedVerse || !gameResults) return null;
        return (
          <GameResults
            gameType="Bible Verse Puzzle"
            reference={selectedVerse.reference}
            verseText={selectedVerse.content}
            score={gameResults.score}
            isPersonalBest={gameResults.score > 900}
            time={`${Math.floor(gameResults.timeRemaining / 60)}:${(gameResults.timeRemaining % 60).toString().padStart(2, '0')}`}
            hintsUsed={gameResults.hintsUsed}
            maxHints={3}
            shekelsEarned={Math.floor(gameResults.score / 100)}
            achievements={[
              { 
                title: "Verse Master", 
                description: "Complete a verse with more than 900 points" 
              }
            ]}
            levelProgress={{
              current: 5,
              next: 6,
              percentage: 75
            }}
            onPlayAgain={handlePlayAgain}
            onNextVerse={() => {
              // For demo purposes, just go back to book selection
              handlePlayAgain();
            }}
            onHome={() => router.back()}
            inspirationalVerse={{
              text: "Your word is a lamp for my feet, a light on my path.",
              reference: "Psalm 119:105"
            }}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <View className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      {/* Only show the header for book selection state */}
      {gameState === GameState.BOOK_SELECTION && (
        <View className="flex-row items-center pt-12 pb-4 px-4">
          <Pressable 
            onPress={() => router.back()}
            className="mr-4 p-2"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? '#D1D5DB' : '#4B5563'} 
            />
          </Pressable>
          <Text className={`text-2xl font-pbold ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
            Bible Verse Puzzle
          </Text>
        </View>
      )}
      
      {/* Game content */}
      {renderGameState()}
    </View>
  );
}
