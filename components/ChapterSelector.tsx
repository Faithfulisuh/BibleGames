import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChapterSelectorProps {
  bookName: string;
  totalChapters: number;
  onSelectChapter: (chapterNumber: number) => void;
  onBack: () => void;
}

/**
 * ChapterSelector component for selecting Bible chapters
 * Matches the design shown in the chapter selection screen
 */
export default function ChapterSelector({
  bookName,
  totalChapters,
  onSelectChapter,
  onBack,
}: ChapterSelectorProps) {
  // Create an array of chapter numbers from 1 to totalChapters
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="mt-7 p-4 flex-row items-center border-b border-lightGray border-opacity-10">
        <Pressable onPress={onBack} className="mr-3">
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </Pressable>
        <View>
          <Text className="text-xl font-pbold text-textPrimary">{bookName}</Text>
          <Text className="text-textSecondary">{totalChapters} chapters available</Text>
        </View>
      </View>

      {/* Chapter grid */}
      <ScrollView className="flex-1 p-4">
        <View className="flex-row flex-wrap justify-between">
          {chapters.map((chapter) => (
            <Pressable
              key={chapter}
              className="bg-blueGradientStart w-[16%] aspect-square rounded-lg items-center justify-center mb-3"
              onPress={() => onSelectChapter(chapter)}
            >
              <Text className="text-white font-pbold text-lg">{chapter}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
