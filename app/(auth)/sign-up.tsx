import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = () => {
    // Add validation and submission logic here
  };

  const handleSignIn = () => {
    // Add navigation logic here
  };

  return (
    <View className="flex-1 bg-[#A259FF]">
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <Text className="text-2xl font-bold text-darkGray mb-1 text-center">Create Account</Text>
          <Text className="text-xs text-mediumGray mb-5 text-center">Join the Bible Games community</Text>

          {/* Full Name */}
          <Text className="mb-1 text-xs font-semibold text-darkGray">Full Name</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-11 mb-3">
            <Ionicons name="person-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-darkGray font-regular"
              placeholder="Enter your full name"
              placeholderTextColor="#BDBDBD"
              value={formData.fullName}
              onChangeText={text => handleInputChange('fullName', text)}
            />
          </View>

          {/* Email */}
          <Text className="mb-1 text-xs font-semibold text-darkGray">Email</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-11 mb-3">
            <Ionicons name="mail-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-darkGray font-regular"
              placeholder="Enter your email"
              placeholderTextColor="#BDBDBD"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text className="mb-1 text-xs font-semibold text-darkGray">Password</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-11 mb-3">
            <Ionicons name="lock-closed-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-darkGray font-regular"
              placeholder="Create a password"
              placeholderTextColor="#BDBDBD"
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
              secureTextEntry={true}
            />
          </View>

          {/* Confirm Password */}
          <Text className="mb-1 text-xs font-semibold text-darkGray">Confirm Password</Text>
          <View className="flex-row items-center bg-lightGray rounded-lg border border-light border-solid px-3 h-11 mb-4">
            <Ionicons name="lock-closed-outline" size={18} color="#A259FF" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-darkGray font-regular"
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
            <Text className="text-xs text-darkGray">
              I agree to the <Text className="font-bold text-[#A259FF]">Terms of Service</Text> and <Text className="font-bold text-[#A259FF]">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleCreateAccount}
            className="w-full h-11 rounded-lg justify-center items-center mb-4 bg-[#A259FF]"
          >
            <Text className="text-white font-semibold text-base">Create Account</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-darkGray">Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text className="ml-1 font-bold text-[#A259FF] text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
export default Signup;
