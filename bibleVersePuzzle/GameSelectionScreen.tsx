import { REACT_APP_API_KEY } from "@env";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const API_KEY = REACT_APP_API_KEY;
const BIBLE_ID = "de4e12af7f28f599-02"; // ESV Bible ID

// Interfaces for API responses
interface Book {
  id: string;
  name: string;
  abbreviation: string;
  bibleId: string;
}

interface Chapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
}

// Props interface
interface GameSelectionScreenProps {
  onStartGame: (config: {
    bookId: string;
    bookName: string;
    chapterId?: string;
    chapterNumber?: string;
  }) => void;
}

export default function GameSelectionScreen({ onStartGame }: GameSelectionScreenProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters(selectedBook.id);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (books.length > 0) {
      setFilteredBooks(
        books.filter((book) =>
          book.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, books]);

  const fetchBooks = async (): Promise<void> => {
    setLoading(true);
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
      setFilteredBooks(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setLoading(false);
    }
  };

  const fetchChapters = async (bookId: string): Promise<void> => {
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
        (chapter: Chapter) => chapter.id !== `${bookId}.intro`
      );
      setChapters(filteredChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  const handleStartGame = (): void => {
    if (selectedBook) {
      onStartGame({
        bookId: selectedBook.id,
        bookName: selectedBook.name,
        chapterId: selectedChapter?.id,
        chapterNumber: selectedChapter?.number,
      });
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <Pressable
      className={`p-3 m-1 rounded-lg ${
        selectedBook?.id === item.id ? "bg-secondary" : "bg-inputBg"
      }`}
      onPress={() => {
        setSelectedBook(item);
        setSelectedChapter(null);
      }}
    >
      <Text
        className={`font-pmedium text-base ${
          selectedBook?.id === item.id ? "text-white" : "text-primary"
        }`}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  const renderChapterItem = ({ item }: { item: Chapter }) => (
    <Pressable
      className={`p-5 m-1 rounded-lg ${
        selectedChapter?.id === item.id ? "bg-secondary" : "bg-inputBg"
      }`}
      onPress={() => setSelectedChapter(item)}
    >
      <Text
        className={`font-pmedium text-base ${
          selectedChapter?.id === item.id ? "text-white" : "text-primary"
        }`}
      >
        {item.number}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#574bdb" />
        <Text className="mt-4 text-textMedium">Loading Bible books...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-error text-center mb-4">{error}</Text>
        <Pressable
          className="bg-secondary rounded-xl py-3 px-6"
          onPress={fetchBooks}
        >
          <Text className="text-white font-pmedium">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-5">
      <Text className="text-lg font-pmedium text-primary mb-2">
        Select a Book
      </Text>

      <TextInput
        className="bg-cardBg border border-accent rounded-lg p-3 mb-4"
        placeholder="Search books..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View className="h-1/3 mb-4">
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {selectedBook && (
        <>
          <Text className="text-lg font-pmedium text-primary mb-2">
            Select a Chapter (Optional)
          </Text>

          <View className="h-1/5 mb-4">
            <FlatList
              data={chapters}
              renderItem={renderChapterItem}
              keyExtractor={(item) => item.id}
              numColumns={5}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </>
      )}

      <View className="mt-auto">
        <Pressable
          className={`rounded-xl py-4 ${
            selectedBook ? "bg-secondary" : "bg-gray-400"
          }`}
          onPress={handleStartGame}
          disabled={!selectedBook}
        >
          <Text className="text-white text-center text-lg font-pbold">
            Start Game (10 Verses)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
