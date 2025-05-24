import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '../components/BottomSheet';

// Review interface
interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load reviews on component mount
  useEffect(() => {
    loadReviews();
  }, []);

  // Load reviews from AsyncStorage
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const savedReviews = await AsyncStorage.getItem('app_reviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setBottomSheetConfig({
        title: 'Error',
        message: 'Failed to load reviews. Please try again later.',
        type: 'error',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Save reviews to AsyncStorage
  const saveReviews = async (updatedReviews: Review[]) => {
    try {
      await AsyncStorage.setItem('app_reviews', JSON.stringify(updatedReviews));
    } catch (error) {
      console.error('Error saving reviews:', error);
      setBottomSheetConfig({
        title: 'Error',
        message: 'Failed to save your review. Please try again later.',
        type: 'error',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
    }
  };

  // Submit a new review
  const submitReview = async () => {
    if (!username.trim()) {
      setBottomSheetConfig({
        title: 'Error',
        message: 'Please enter your name.',
        type: 'error',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
      return;
    }

    if (!comment.trim()) {
      setBottomSheetConfig({
        title: 'Error',
        message: 'Please enter your review.',
        type: 'error',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
      return;
    }
    
    // Rating is mandatory - this is a fallback check
    if (rating < 1 || rating > 5) {
      setBottomSheetConfig({
        title: 'Error',
        message: 'Please rate the app before submitting.',
        type: 'error',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create new review
      const newReview: Review = {
        id: Date.now().toString(),
        username: username.trim(),
        rating,
        comment: comment.trim(),
        date: new Date().toISOString(),
      };

      // Update reviews list
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      
      // Save to AsyncStorage
      await saveReviews(updatedReviews);
      
      // Reset form
      setUsername('');
      setRating(5);
      setComment('');
      
      setBottomSheetConfig({
        title: 'Success',
        message: 'Your review has been submitted. Thank you!',
        type: 'success',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      setBottomSheetConfig({
        title: 'Error',
        message: 'Failed to submit your review. Please try again later.',
        type: 'error',
        actions: [{ text: 'OK', onPress: () => setBottomSheetVisible(false), primary: true }]
      });
      setBottomSheetVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star rating
  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} className={`text-2xl ${i <= count ? 'text-yellow-400' : 'text-gray-300'}`}>
          {i <= count ? '★' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
      <View className="flex-1 p-4">
        <Text className="text-2xl font-pbold text-textDark mb-4 text-center">Reviews</Text>
        
        {/* Review form */}
        <View className="bg-cardBg rounded-xl p-4 mb-5 border-l-4 border-primary">
          <Text className="text-lg font-pbold text-textDark mb-1">Write a Review</Text>
          <Text className="text-xs text-textMedium italic mb-3">* Required fields</Text>
          
          <TextInput
            className="bg-inputBg rounded-lg p-3 mb-3 text-base border border-gray-300"
            placeholder="Your Name *"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999"
          />
          
          <View className="flex-row items-center mb-3">
            <Text className="text-base mr-2 text-textDark">Rating: <Text className="text-error font-pbold">*</Text></Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  className="p-1"
                  accessibilityLabel={`Rate ${star} stars`}
                >
                  <Text className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <TextInput
            className="bg-inputBg rounded-lg p-3 mb-3 text-base border border-gray-300 h-24"
            placeholder="Write your review here... *"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
            textAlignVertical="top"
          />
          
          <Pressable
            className={`bg-primary rounded-lg p-3 items-center mt-2 ${isSubmitting ? 'opacity-70' : ''}`}
            onPress={submitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-pbold text-base">Submit Review</Text>
            )}
          </Pressable>
        </View>
        
        {/* Reviews list */}
        <View className="flex-1">
          <Text className="text-lg font-pbold text-textDark mb-3">User Reviews</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#3e38af" className="mt-5" />
          ) : reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-cardBg rounded-xl p-4 mb-3 border-l-3 border-secondary">
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-pbold text-base text-textDark">{item.username}</Text>
                    <Text className="text-textMedium text-sm">{formatDate(item.date)}</Text>
                  </View>
                  <View className="flex-row mb-2">
                    {renderStars(item.rating)}
                  </View>
                  <Text className="text-textMedium text-base leading-5">{item.comment}</Text>
                </View>
              )}
            />
          ) : (
            <Text className="text-center text-textMedium mt-5 text-base">
              No reviews yet. Be the first to share your thoughts!
            </Text>
          )}
        </View>
      </View>
      
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
    </SafeAreaView>
  );
};

// No StyleSheet needed as we're using Tailwind CSS

export default Reviews;