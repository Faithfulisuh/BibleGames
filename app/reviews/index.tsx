import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/ThemeContext';
import { useReviews, Review } from '../../lib/ReviewsContext';

// Filter options for reviews
type FilterOption = 'all' | 'Match the Verse' | 'Guess the Character';

// Star Rating component
const StarRating: React.FC<{ rating: number; setRating?: (rating: number) => void; size?: number; interactive?: boolean }> = ({ 
  rating, 
  setRating, 
  size = 24, 
  interactive = false 
}) => {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => interactive && setRating && setRating(star)}
          className="mr-1"
        >
          <Ionicons
            name={rating >= star ? "star" : "star-outline"}
            size={size}
            color="#F59E0B"
          />
        </Pressable>
      ))}
    </View>
  );
};

// Review Card component
const ReviewCard: React.FC<{ review: Review; onLike: () => void }> = ({ review, onLike }) => {
  const { isDark } = useTheme();
  const date = new Date(review.createdAt).toLocaleDateString();
  
  return (
    <View className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-dark-cardBackground' : 'bg-white'} shadow-sm`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`font-pbold text-lg ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
          {review.userName}
        </Text>
        <Text className={`text-xs ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
          {date}
        </Text>
      </View>
      
      <View className="flex-row items-center mb-1">
        <StarRating rating={review.rating} />
        <Text className={`ml-2 text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
          {review.gameType}
        </Text>
      </View>
      
      <Text className={`my-2 ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
        {review.comment}
      </Text>
      
      <View className="flex-row justify-end items-center mt-2">
        <Pressable 
          onPress={onLike}
          className="flex-row items-center"
        >
          <Ionicons name="heart-outline" size={18} color={isDark ? '#D1D5DB' : '#6B7280'} />
          <Text className={`ml-1 ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
            {review.likes}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

// Filter Button component
const FilterButton: React.FC<{ 
  title: string; 
  isActive: boolean; 
  onPress: () => void 
}> = ({ title, isActive, onPress }) => {
  const { isDark } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${isActive 
        ? isDark 
          ? 'bg-greenGradientStart' 
          : 'bg-greenGradientStart' 
        : isDark 
          ? 'bg-dark-cardBackground' 
          : 'bg-lightGray'}`}
    >
      <Text className={`${isActive ? 'text-white font-pbold' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}>
        {title}
      </Text>
    </Pressable>
  );
};

export default function ReviewsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { reviews, addReview, likeReview, getReviewsByGame } = useReviews();
  
  // State for the review form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [gameType, setGameType] = useState<Review['gameType']>('Match the Verse');
  
  // State for filtering reviews
  const [filter, setFilter] = useState<FilterOption>('all');
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  
  // Apply filters to reviews
  useEffect(() => {
    if (filter === 'all') {
      setFilteredReviews([...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } else {
      setFilteredReviews(
        [...getReviewsByGame(filter as Review['gameType'])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    }
  }, [reviews, filter, getReviewsByGame]);
  
  // Handle submitting a new review
  const handleSubmitReview = async () => {
    if (!userName.trim() || !comment.trim()) {
      return; // Don't submit empty reviews
    }
    
    await addReview({
      userName: userName.trim(),
      gameType,
      rating,
      comment: comment.trim(),
    });
    
    // Reset form and close modal
    setUserName('');
    setRating(5);
    setComment('');
    setGameType('Match the Verse');
    setIsModalVisible(false);
  };
  
  // Handle liking a review
  const handleLikeReview = async (id: string) => {
    await likeReview(id);
  };
  
  return (
    <View className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      {/* Header with back button */}
      <View className="flex-row items-center justify-between pt-12 pb-4 px-4">
        <View className="flex-row items-center">
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
            Community Reviews
          </Text>
        </View>
        
        <Pressable 
          onPress={() => setIsModalVisible(true)}
          className="bg-greenGradientStart p-2 rounded-full"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
      
      {/* Filters */}
      <View className="px-4 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
          <FilterButton 
            title="All Reviews" 
            isActive={filter === 'all'} 
            onPress={() => setFilter('all')} 
          />
          <FilterButton 
            title="Match the Verse" 
            isActive={filter === 'Match the Verse'} 
            onPress={() => setFilter('Match the Verse')} 
          />
          <FilterButton 
            title="Guess the Character" 
            isActive={filter === 'Guess the Character'} 
            onPress={() => setFilter('Guess the Character')} 
          />
        </ScrollView>
      </View>
      
      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4">
              <ReviewCard 
                review={item} 
                onLike={() => handleLikeReview(item.id)} 
              />
            </View>
          )}
          className="flex-1"
        />
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons 
            name="chatbubble-ellipses-outline" 
            size={64} 
            color={isDark ? '#10B981' : '#059669'} 
          />
          <Text 
            className={`text-xl font-pbold mt-4 text-center ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}
          >
            No Reviews Yet
          </Text>
          <Text 
            className={`text-base mt-2 text-center ${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}`}
          >
            Be the first to share your experience with the community!
          </Text>
          <Pressable
            onPress={() => setIsModalVisible(true)}
            className="mt-6 bg-greenGradientStart px-6 py-3 rounded-full"
          >
            <Text className="text-white font-pbold">Write a Review</Text>
          </Pressable>
        </View>
      )}
      
      {/* Add Review Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className={`p-6 rounded-t-3xl ${isDark ? 'bg-dark-cardBackground' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-pbold ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
                Write a Review
              </Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </Pressable>
            </View>
            
            {/* Name Input */}
            <Text className={`font-pbold mb-1 ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
              Your Name
            </Text>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-dark-background text-dark-textPrimary' : 'bg-lightGray text-light-textPrimary'}`}
            />
            
            {/* Game Type Selection */}
            <Text className={`font-pbold mb-2 ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
              Select Game
            </Text>
            <View className="flex-row mb-4">
              <Pressable
                onPress={() => setGameType('Match the Verse')}
                className={`flex-1 p-3 rounded-lg mr-2 ${gameType === 'Match the Verse' 
                  ? 'bg-purpleGradientStart' 
                  : isDark 
                    ? 'bg-dark-background' 
                    : 'bg-lightGray'}`}
              >
                <Text className={`text-center ${gameType === 'Match the Verse' ? 'text-white font-pbold' : isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
                  Match the Verse
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setGameType('Guess the Character')}
                className={`flex-1 p-3 rounded-lg ${gameType === 'Guess the Character' 
                  ? 'bg-blueGradientStart' 
                  : isDark 
                    ? 'bg-dark-background' 
                    : 'bg-lightGray'}`}
              >
                <Text className={`text-center ${gameType === 'Guess the Character' ? 'text-white font-pbold' : isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
                  Guess the Character
                </Text>
              </Pressable>
            </View>
            
            {/* Rating */}
            <Text className={`font-pbold mb-2 ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
              Your Rating
            </Text>
            <View className="mb-4 items-center">
              <StarRating rating={rating} setRating={setRating} interactive size={36} />
            </View>
            
            {/* Comment */}
            <Text className={`font-pbold mb-1 ${isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}`}>
              Your Review
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with the game..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className={`p-3 rounded-lg mb-6 min-h-[100px] ${isDark ? 'bg-dark-background text-dark-textPrimary' : 'bg-lightGray text-light-textPrimary'}`}
            />
            
            {/* Submit Button */}
            <Pressable
              onPress={handleSubmitReview}
              disabled={!userName.trim() || !comment.trim()}
              className={`p-4 rounded-lg ${!userName.trim() || !comment.trim() 
                ? 'bg-gray-300' 
                : 'bg-greenGradientStart'}`}
            >
              <Text className="text-white text-center font-pbold">
                Submit Review
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
