import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Review interface
export interface Review {
  id: string;
  userName: string;
  gameType: 'Bible Verse Puzzle' | 'Guess the Character' | 'Other';
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
  likes: number;
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  likeReview: (id: string) => Promise<void>;
  getReviewsByGame: (gameType: Review['gameType']) => Review[];
  getUserReviews: (userName: string) => Review[];
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load reviews from AsyncStorage on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const storedReviews = await AsyncStorage.getItem('reviews');
        if (storedReviews) {
          setReviews(JSON.parse(storedReviews));
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    loadReviews();
  }, []);

  // Save reviews to AsyncStorage whenever they change
  useEffect(() => {
    const saveReviews = async () => {
      try {
        await AsyncStorage.setItem('reviews', JSON.stringify(reviews));
      } catch (error) {
        console.error('Error saving reviews:', error);
      }
    };

    if (reviews.length > 0) {
      saveReviews();
    }
  }, [reviews]);

  // Add a new review
  const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'likes'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setReviews(prevReviews => [...prevReviews, newReview]);
  };

  // Like a review
  const likeReview = async (id: string) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === id ? { ...review, likes: review.likes + 1 } : review
      )
    );
  };

  // Get reviews by game type
  const getReviewsByGame = (gameType: Review['gameType']) => {
    return reviews.filter(review => review.gameType === gameType);
  };

  // Get reviews by user
  const getUserReviews = (userName: string) => {
    return reviews.filter(review => review.userName === userName);
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        likeReview,
        getReviewsByGame,
        getUserReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};
