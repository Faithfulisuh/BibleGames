
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleBackToSignIn() {
    router.replace('/sign-in');
  }

  async function handleSendResetLink() {
    setLoading(true);
    try {
      // TODO: Implement your password reset logic here, e.g., call an API
      // await sendResetLink(email);
      // Optionally show a success message or navigate
    } catch (error) {
      // Optionally handle error, e.g., show an error message
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#A259FF]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-4 py-8">
          <View className="flex-1 items-center justify-center">
            <View className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg items-center">
              <TouchableOpacity onPress={handleBackToSignIn} className="self-start mb-4 flex-row items-center">
                <Ionicons name="arrow-back-outline" size={20} color="#A259FF" />
              </TouchableOpacity>
              <Text className="mb-2 font-bold text-2xl text-darkGray text-center">Reset Password</Text>
              <Text className="mb-6 text-center text-xs text-mediumGray">We'll send you a reset link</Text>
              <View className="w-full mb-2">
                <Text className="mb-1 text-xs font-semibold text-darkGray">Email Address</Text>
                <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-11">
                  <Ionicons name="mail-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1 text-base text-darkGray font-regular"
                    placeholder="Enter your email address"
                    placeholderTextColor="#BDBDBD"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <Text className="mb-4 text-xs text-mediumGray">Enter the email address associated with your account and we'll send you a link to reset your password.</Text>
                <TouchableOpacity
                  onPress={handleSendResetLink}
                  disabled={loading}
                  className={`w-full h-11 rounded-lg justify-center items-center mb-2 ${loading ? 'bg-gray-300' : 'bg-[#A259FF]'}`}
                >
                  <Text className="text-white font-semibold text-base">{loading ? 'Sending...' : 'Send Reset Link'}</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center mt-2">
                <Text className="text-sm text-mediumGray">Remember your password?</Text>
                <TouchableOpacity onPress={handleBackToSignIn}>
                  <Text className="ml-1 font-bold text-[#A259FF] text-sm">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
