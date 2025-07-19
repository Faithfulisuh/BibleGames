import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createUser } from '../../lib/appwrite'; // Adjust the import path as necessary

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    // Add validation and submission logic here
    if (!formData.userName || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure your password and confirm password are the same.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUser(formData.email, formData.password, formData.userName);
      router.replace('/'); // Navigates to the root (index) route
    } catch (error) {
      setIsSubmitting(false); // Stop submitting if error
      if (error instanceof Error) {
        Alert.alert('Error creating account', error.message);
      } else {
        Alert.alert('Error creating account', 'An unknown error occurred.');
      }
      return; // Do not proceed if error
    }
    setIsSubmitting(false);
  };

  const handleSignIn = (): void => {
    router.push('/(auth)/sign-in');
  };


  return (
    <View className="flex-1 bg-[#A259FF]">
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <Text className="text-2xl font-pbold text-darkGray mb-1 text-center">Create Account</Text>
          <Text className="text-xs font-pregular text-mediumGray mb-5 text-center">Join the Word Bits community</Text>

          {/* user name */}
          <Text className="mb-1 text-xs font-psemibold text-darkGray">Username</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-16 mb-3">
            <Ionicons name="person-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-sm text-darkGray font-pregular"
              placeholder="Enter your username"
              placeholderTextColor="#BDBDBD"
              value={formData.userName}
              onChangeText={text => handleInputChange('userName', text)}
            />
          </View>

          {/* Email */}
          <Text className="mb-1 text-xs font-psemibold text-darkGray">Email</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-16 mb-3">
            <Ionicons name="mail-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-sm text-darkGray font-pregular"
              placeholder="Enter your email"
              placeholderTextColor="#BDBDBD"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text className="mb-1 text-xs font-psemibold text-darkGray">Password</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-16 mb-3">
            <Ionicons name="lock-closed-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-sm text-darkGray font-pregular"
              placeholder="Create a password"
              placeholderTextColor="#BDBDBD"
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
              secureTextEntry={true}
            />
          </View>

          {/* Confirm Password */}
          <Text className="mb-1 text-xs font-psemibold text-darkGray">Confirm Password</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-16 mb-4">
            <Ionicons name="lock-closed-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-sm text-darkGray font-pregular"
              placeholder="Confirm your password"
              placeholderTextColor="#BDBDBD"
              value={formData.confirmPassword}
              onChangeText={text => handleInputChange('confirmPassword', text)}
              secureTextEntry={true}
            />
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            className="flex-row items-center mb-4"
          >
            <View className={`mr-2 h-5 w-5 rounded border border-light justify-center items-center ${agreeToTerms ? 'bg-[#A259FF]' : 'bg-white'}`}>
              {agreeToTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text className="text-xs font-pregular text-darkGray">
              I agree to the <Text className="font-pbold text-[#A259FF]">Terms of Service</Text> and <Text className="font-pbold text-[#A259FF]">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleCreateAccount}
            className="w-full h-16 rounded-lg justify-center items-center mb-4 bg-[#A259FF]"
          >
            <Text className="text-white font-psemibold text-base">Create Account</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <View className="flex-row justify-center items-center">
            <Text className="text-sm font-pregular text-darkGray">Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text className="ml-1 font-pbold text-[#A259FF] text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
export default Signup;
