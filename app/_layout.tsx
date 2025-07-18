import { GameProgressProvider } from "@/lib/GameProgressContext";
import { ReviewsProvider } from "@/lib/ReviewsContext";
import { ThemeProvider, useTheme } from "@/lib/ThemeContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Keep splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

// Main content component that uses the theme
function MainContent({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  
  return (
    <View className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
}

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
    async function prepare() {
      if (error) throw error; // Handle font loading error

      if (fontsLoaded) {
        // Hide splash screen when fonts are loaded
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null; // Render nothing while fonts are loading

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GameProgressProvider>
          <ReviewsProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <MainContent>
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
              </MainContent>
            </GestureHandlerRootView>
          </ReviewsProvider>
        </GameProgressProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
