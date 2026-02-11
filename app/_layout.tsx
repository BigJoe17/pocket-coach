
import { AuthProvider } from '@/ctx/AuthContext';
import { SubscriptionProvider } from '@/ctx/SubscriptionContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, useColorScheme, View } from 'react-native';
import 'react-native-get-random-values';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Animation values
  const logoScale = useSharedValue(1);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    // Breathing animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    // Simulate loading/initialization
    const timer = setTimeout(() => {
      setIsAppReady(true);
      SplashScreen.hideAsync();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const bgStyle = {
    backgroundColor: colorScheme === 'dark' ? '#020617' : '#f8fafc',
  };

  if (!isAppReady && showSplash) {
    return (
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, bgStyle]}>
        <Animated.View style={animatedLogoStyle}>
          <Image
            source={require('../assets/images/icon.png')}
            style={{ width: 120, height: 120, borderRadius: 30 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={[{ flex: 1 }, bgStyle]}>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={[{ flex: 1 }, bgStyle]}>
              <Stack screenOptions={{
                headerShown: false,
                contentStyle: bgStyle
              }} />
            </View>
            <StatusBar style="auto" />
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
