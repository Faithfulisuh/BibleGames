import { signIn } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onClose: () => {},
    actions: [{ text: 'OK', onPress: () => setShowAlert(false) }]
  });

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

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlertMessage('Missing Information', 'Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      router.replace('/'); // Navigates to the root (index) route
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred while signing in.';
      
      if (error.code === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlertMessage('Sign In Failed', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#A259FF]">
      <BottomSheet
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        actions={alertConfig.actions}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-4 py-8">
          <View className="flex-1 items-center justify-center">
            <View className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg items-center">
              <View className="mb-4 items-center">
                <View className="mb-2 rounded-full bg-gradient-to-r from-[#A259FF] to-[#3A5BFF] p-3">
                  <Image source={require('../../assets/images/icon.png')} style={{ width: 60, height: 60 }} />
                </View>
                <Text className="mb-1 font-pbold text-2xl text-darkGray">Word Bits</Text>
                <Text className="text-center font-pregular text-xs text-mediumGray">Learn • Play • Grow</Text>
              </View>
              {/* Email Input */}
              <Text className="mb-1 text-xs font-psemibold text-darkGray w-full">Email</Text>
              <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-16 mb-3 w-full">
                <Ionicons name="mail-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
                <TextInput
                  className="flex-1 text-sm text-darkGray font-pregular"
                  placeholder="Enter your email"
                  placeholderTextColor="#BDBDBD"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {/* Password Input */}
              <Text className="mb-1 text-xs font-psemibold text-darkGray w-full">Password</Text>
              <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-16 mb-3 w-full">
                <Ionicons name="lock-closed-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
                <TextInput
                  className="flex-1 text-sm text-darkGray font-pregular"
                  placeholder="Enter your password"
                  placeholderTextColor="#BDBDBD"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
              </View>
              {/* Remember Me & Forgot Password */}
              <View className="mb-4 flex-row items-center justify-between w-full">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  className="flex-row items-center"
                >
                  <View className={`mr-2 h-4 w-4 items-center justify-center rounded border border-light ${rememberMe ? 'bg-[#A259FF]' : 'bg-white'}`}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text className="text-xs font-pregular text-mediumGray">Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text className="text-xs font-psemibold text-[#A259FF]">Forgot password?</Text>
                </TouchableOpacity>
              </View>
              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={loading}
                className={`w-full h-16 rounded-lg justify-center items-center mb-4 ${loading ? 'bg-gray-300' : 'bg-[#A259FF]'}`}
              >
                <Text className="text-white font-psemibold text-base">{loading ? 'Signing In...' : 'Sign In'}</Text>
              </TouchableOpacity>
              {/* Sign Up Link */}
              <View className="flex-row items-center justify-center">
                <Text className="text-sm font-pregular text-darkGray">Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text className="ml-1 font-pbold text-[#A259FF] text-sm">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default SignIn;
