import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { Suspense, useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

// RootLayout component serves as the main layout for the application
const RootLayout: React.FC = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error; // Handle font loading error

    if (fontsLoaded) SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null; // Render nothing while fonts are loading

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Suspense
        fallback={
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={"large"} />
            <Text>Loading Database...</Text>
          </View>
        }
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          {/* <Stack.Screen name="BibleVersePuzzle" /> */}
        </Stack>
      </Suspense>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
