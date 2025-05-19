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

export default function GameSelectionScreen({ onStartGame }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

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

  const fetchBooks = async () => {
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
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchChapters = async (bookId) => {
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
        (chapter) => chapter.id !== `${bookId}.intro`
      );
      setChapters(filteredChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setError(error.message);
    }
  };

  const handleStartGame = () => {
    onStartGame({
      bookId: selectedBook.id,
      bookName: selectedBook.name,
      chapterId: selectedChapter?.id,
      chapterNumber: selectedChapter?.number,
    });
  };

  const renderBookItem = ({ item }) => (
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

  const renderChapterItem = ({ item }) => (
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
