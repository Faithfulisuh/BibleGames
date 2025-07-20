import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import { createUser } from '../../lib/appwrite';

interface FormData {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {},
    actions: [{ text: 'OK', onPress: () => setShowAlert(false) }]
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showAlertMessage = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', onClose?: () => void, actions?: any[]) => {
    setAlertConfig({
      title,
      message,
      type,
      onClose: onClose || (() => setShowAlert(false)),
      actions: actions || [{ text: 'OK', onPress: () => setShowAlert(false) }]
    });
    setShowAlert(true);
  };

  const handleCreateAccount = async () => {
    // Validate all fields are filled
    if (!formData.userName || !formData.email || !formData.password || !formData.confirmPassword) {
      showAlertMessage('Missing Information', 'Please fill in all fields', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlertMessage('Invalid Email', 'Please enter a valid email address', 'error');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      showAlertMessage('Password Mismatch', 'Please make sure your passwords match', 'error');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      showAlertMessage('Weak Password', 'Password must be at least 8 characters long', 'error');
      return;
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      showAlertMessage('Terms Not Accepted', 'You must agree to the Terms of Service and Privacy Policy', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the user account and sign them in
      const result = await createUser(formData.email, formData.password, formData.userName);
      
      // If we get here, account creation and sign-in were successful
      showAlertMessage(
        'Account Created', 
        'Your account has been created successfully!', 
        'success',
        () => router.replace('/'),
        [{ 
          text: 'Continue', 
          onPress: () => {
            setShowAlert(false);
            router.replace('/');
          },
          primary: true
        }]
      );
      
    } catch (error: any) {
      // Handle specific error cases
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.code === 409) {
        errorMessage = 'An account with this email already exists. Please use a different email or sign in.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlertMessage('Signup Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    if (!isSubmitting) {
      router.replace('/(auth)/sign-in');
    }
  };


  return (
    <>
      <BottomSheet
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        actions={alertConfig.actions}
      />
      <KeyboardAvoidingView 
        className="flex-1 bg-[#A259FF]"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 p-6">
            {/* Header */}
            <View className="items-center mb-8 mt-4">
              <Text className="text-white text-3xl font-pbold mb-2">Create Account</Text>
              <Text className="text-white text-center opacity-80">Join us and start your Bible journey</Text>
            </View>

            {/* Form */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              {/* Username */}
              <View className="mb-4">
                <Text className="text-textPrimary font-pmedium mb-2">Username</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 font-pregular text-textPrimary"
                    placeholder="Choose a username"
                    placeholderTextColor="#9CA3AF"
                    value={formData.userName}
                    onChangeText={(text) => handleInputChange('userName', text)}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-textPrimary font-pmedium mb-2">Email</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 font-pregular text-textPrimary"
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-textPrimary font-pmedium mb-2">Password</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 font-pregular text-textPrimary"
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-6">
                <Text className="text-textPrimary font-pmedium mb-2">Confirm Password</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 font-pregular text-textPrimary"
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    editable={!isSubmitting}
                    onSubmitEditing={handleCreateAccount}
                  />
                </View>
              </View>

              {/* Terms and Conditions */}
              <View className="flex-row items-start mb-6">
                <TouchableOpacity 
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  className="mt-1 mr-3"
                  disabled={isSubmitting}
                >
                  <View className={`w-5 h-5 rounded-md border-2 ${agreeToTerms ? 'bg-primary border-primary' : 'border-gray-300'} items-center justify-center`}>
                    {agreeToTerms && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                </TouchableOpacity>
                <Text className="flex-1 text-textSecondary text-sm">
                  I agree to the{' '}
                  <Text className="text-primary font-psemibold">Terms of Service</Text> and{' '}
                  <Text className="text-primary font-psemibold">Privacy Policy</Text>
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleCreateAccount}
                disabled={isSubmitting}
                className={`py-4 rounded-xl items-center ${isSubmitting ? 'bg-primary/70' : 'bg-primary'}`}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-psemibold">
                      Creating your account and setting up your game data...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-psemibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sign In */}
              <View className="mt-4 flex-row justify-center">
                <Text className="text-textSecondary text-sm">Already have an account? </Text>
                <TouchableOpacity onPress={handleSignIn} disabled={isSubmitting}>
                  <Text className={`text-primary text-sm font-psemibold ${isSubmitting ? 'opacity-50' : ''}`}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
              
              {isSubmitting && (
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="text-blue-800 text-sm text-center">
                    Creating your account and setting up your game data...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};
export default Signup;