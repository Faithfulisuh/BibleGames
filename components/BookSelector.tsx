import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Book {
  id: string;
  name: string;
  chapters: number;
  testament: 'old' | 'new';
  isPopular?: boolean;
}

interface BookSelectorProps {
  onSelectBook: (book: Book) => void;
  favorites?: string[];
  onToggleFavorite?: (bookId: string) => void;
}

/**
 * BookSelector component for selecting Bible books
 * Matches the design shown in the book selection screen
 */
export default function BookSelector({
  onSelectBook,
  favorites = [],
  onToggleFavorite,
}: BookSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'old' | 'new'>('all');

  // Complete Bible books data
  const books: Book[] = [
    // Old Testament
    { id: 'genesis', name: 'Genesis', chapters: 50, testament: 'old', isPopular: true },
    { id: 'exodus', name: 'Exodus', chapters: 40, testament: 'old', isPopular: true },
    { id: 'leviticus', name: 'Leviticus', chapters: 27, testament: 'old' },
    { id: 'numbers', name: 'Numbers', chapters: 36, testament: 'old' },
    { id: 'deuteronomy', name: 'Deuteronomy', chapters: 34, testament: 'old' },
    { id: 'joshua', name: 'Joshua', chapters: 24, testament: 'old' },
    { id: 'judges', name: 'Judges', chapters: 21, testament: 'old' },
    { id: 'ruth', name: 'Ruth', chapters: 4, testament: 'old', isPopular: true },
    { id: '1samuel', name: '1 Samuel', chapters: 31, testament: 'old' },
    { id: '2samuel', name: '2 Samuel', chapters: 24, testament: 'old' },
    { id: '1kings', name: '1 Kings', chapters: 22, testament: 'old' },
    { id: '2kings', name: '2 Kings', chapters: 25, testament: 'old' },
    { id: '1chronicles', name: '1 Chronicles', chapters: 29, testament: 'old' },
    { id: '2chronicles', name: '2 Chronicles', chapters: 36, testament: 'old' },
    { id: 'ezra', name: 'Ezra', chapters: 10, testament: 'old' },
    { id: 'nehemiah', name: 'Nehemiah', chapters: 13, testament: 'old' },
    { id: 'esther', name: 'Esther', chapters: 10, testament: 'old', isPopular: true },
    { id: 'job', name: 'Job', chapters: 42, testament: 'old', isPopular: true },
    { id: 'psalms', name: 'Psalms', chapters: 150, testament: 'old', isPopular: true },
    { id: 'proverbs', name: 'Proverbs', chapters: 31, testament: 'old', isPopular: true },
    { id: 'ecclesiastes', name: 'Ecclesiastes', chapters: 12, testament: 'old' },
    { id: 'songofsolomon', name: 'Song of Solomon', chapters: 8, testament: 'old' },
    { id: 'isaiah', name: 'Isaiah', chapters: 66, testament: 'old' },
    { id: 'jeremiah', name: 'Jeremiah', chapters: 52, testament: 'old' },
    { id: 'lamentations', name: 'Lamentations', chapters: 5, testament: 'old' },
    { id: 'ezekiel', name: 'Ezekiel', chapters: 48, testament: 'old' },
    { id: 'daniel', name: 'Daniel', chapters: 12, testament: 'old', isPopular: true },
    { id: 'hosea', name: 'Hosea', chapters: 14, testament: 'old' },
    { id: 'joel', name: 'Joel', chapters: 3, testament: 'old' },
    { id: 'amos', name: 'Amos', chapters: 9, testament: 'old' },
    { id: 'obadiah', name: 'Obadiah', chapters: 1, testament: 'old' },
    { id: 'jonah', name: 'Jonah', chapters: 4, testament: 'old', isPopular: true },
    { id: 'micah', name: 'Micah', chapters: 7, testament: 'old' },
    { id: 'nahum', name: 'Nahum', chapters: 3, testament: 'old' },
    { id: 'habakkuk', name: 'Habakkuk', chapters: 3, testament: 'old' },
    { id: 'zephaniah', name: 'Zephaniah', chapters: 3, testament: 'old' },
    { id: 'haggai', name: 'Haggai', chapters: 2, testament: 'old' },
    { id: 'zechariah', name: 'Zechariah', chapters: 14, testament: 'old' },
    { id: 'malachi', name: 'Malachi', chapters: 4, testament: 'old' },
    
    // New Testament
    { id: 'matthew', name: 'Matthew', chapters: 28, testament: 'new', isPopular: true },
    { id: 'mark', name: 'Mark', chapters: 16, testament: 'new', isPopular: true },
    { id: 'luke', name: 'Luke', chapters: 24, testament: 'new', isPopular: true },
    { id: 'john', name: 'John', chapters: 21, testament: 'new', isPopular: true },
    { id: 'acts', name: 'Acts', chapters: 28, testament: 'new' },
    { id: 'romans', name: 'Romans', chapters: 16, testament: 'new' },
    { id: '1corinthians', name: '1 Corinthians', chapters: 16, testament: 'new' },
    { id: '2corinthians', name: '2 Corinthians', chapters: 13, testament: 'new' },
    { id: 'galatians', name: 'Galatians', chapters: 6, testament: 'new' },
    { id: 'ephesians', name: 'Ephesians', chapters: 6, testament: 'new' },
    { id: 'philippians', name: 'Philippians', chapters: 4, testament: 'new' },
    { id: 'colossians', name: 'Colossians', chapters: 4, testament: 'new' },
    { id: '1thessalonians', name: '1 Thessalonians', chapters: 5, testament: 'new' },
    { id: '2thessalonians', name: '2 Thessalonians', chapters: 3, testament: 'new' },
    { id: '1timothy', name: '1 Timothy', chapters: 6, testament: 'new' },
    { id: '2timothy', name: '2 Timothy', chapters: 4, testament: 'new' },
    { id: 'titus', name: 'Titus', chapters: 3, testament: 'new' },
    { id: 'philemon', name: 'Philemon', chapters: 1, testament: 'new' },
    { id: 'hebrews', name: 'Hebrews', chapters: 13, testament: 'new' },
    { id: 'james', name: 'James', chapters: 5, testament: 'new' },
    { id: '1peter', name: '1 Peter', chapters: 5, testament: 'new' },
    { id: '2peter', name: '2 Peter', chapters: 3, testament: 'new' },
    { id: '1john', name: '1 John', chapters: 5, testament: 'new' },
    { id: '2john', name: '2 John', chapters: 1, testament: 'new' },
    { id: '3john', name: '3 John', chapters: 1, testament: 'new' },
    { id: 'jude', name: 'Jude', chapters: 1, testament: 'new' },
    { id: 'revelation', name: 'Revelation', chapters: 22, testament: 'new', isPopular: true },
  ];

  // Filter books based on search query and active tab
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || book.testament === activeTab;
    return matchesSearch && matchesTab;
  });

  // Get popular books
  const popularBooks = books.filter((book) => book.isPopular);

  // Check if a book is favorited
  const isFavorite = (bookId: string) => favorites.includes(bookId);

  // Render a book item in the list
  const renderBookItem = (book: Book) => (
    <Pressable
      key={book.id}
      className="flex-row items-center justify-between p-4 border-b border-lightGray border-opacity-10"
      onPress={() => onSelectBook(book)}
    >
      <View className="flex-row items-center">
        <Pressable
          onPress={() => onToggleFavorite && onToggleFavorite(book.id)}
          className="mr-3"
        >
          <Ionicons
            name={isFavorite(book.id) ? 'star' : 'star-outline'}
            size={18}
            color={isFavorite(book.id) ? '#F59E0B' : '#6B7280'}
          />
        </Pressable>
        <Text className="text-textPrimary font-pmedium">{book.name}</Text>
      </View>
      <Text className="text-textSecondary">{book.chapters} chapters</Text>
    </Pressable>
  );

  // Render a popular book card
  const renderPopularBookCard = (book: Book) => (
    <Pressable
      key={book.id}
      className="bg-orangeGradientStart rounded-lg p-4 flex-1 min-w-[150px] mr-3"
      onPress={() => onSelectBook(book)}
    >
      <Text className="text-white font-pbold text-lg">{book.name}</Text>
      <Text className="text-white text-opacity-80 text-sm">{book.chapters} chapters</Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-lightGray bg-opacity-10">
        <View className="flex-row items-center mb-4">
          <View className="h-10 w-10 bg-purpleGradientStart rounded-full items-center justify-center mr-3">
            <Ionicons name="book" size={20} color="white" />
          </View>
          <View>
            <Text className="text-xl font-pbold text-textPrimary">Select Book</Text>
            <Text className="text-textSecondary">Choose a Bible book for your puzzle</Text>
          </View>
        </View>

        {/* Search input */}
        <View className="bg-white rounded-lg flex-row items-center px-3 mb-4">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 py-2 px-2 text-textPrimary"
            placeholder="Search books..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-lightGray bg-opacity-20 rounded-lg p-1 mb-4">
          <Pressable
            className={`flex-1 py-2 rounded-md ${
              activeTab === 'all' ? 'bg-white' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('all')}
          >
            <Text
              className={`text-center font-pmedium ${
                activeTab === 'all' ? 'text-textPrimary' : 'text-textSecondary'
              }`}
            >
              All Books
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-md ${
              activeTab === 'old' ? 'bg-white' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('old')}
          >
            <Text
              className={`text-center font-pmedium ${
                activeTab === 'old' ? 'text-textPrimary' : 'text-textSecondary'
              }`}
            >
              Old Testament
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-md ${
              activeTab === 'new' ? 'bg-white' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('new')}
          >
            <Text
              className={`text-center font-pmedium ${
                activeTab === 'new' ? 'text-textPrimary' : 'text-textSecondary'
              }`}
            >
              New Testament
            </Text>
          </Pressable>
        </View>

        {/* Popular books section (only show if not searching) */}
        {!searchQuery && (
          <>
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={18} color="#F59E0B" className="mr-1" />
              <Text className="text-textPrimary font-pbold">Popular Books</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {popularBooks.map(renderPopularBookCard)}
            </ScrollView>
          </>
        )}

        {/* All books section */}
        <Text className="text-textPrimary font-pbold mb-2">All Books</Text>
      </View>

      {/* Book list */}
      <ScrollView className="flex-1">
        {filteredBooks.map(renderBookItem)}
      </ScrollView>
    </View>
  );
}
