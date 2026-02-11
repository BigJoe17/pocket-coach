import { supabase } from '@/lib/supabase';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    } else {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(core)/home');
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: Linking.createURL('/'),
      },
    });
    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-8 justify-center"
      >
        <Animated.View
          entering={FadeInDown.duration(800)}
          className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-slate-100 dark:border-zinc-800"
        >
          <View className="items-start mb-6">
            <View className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-3xl items-center justify-center mb-6">
              <Feather name="mail" size={32} color="#6366f1" />
            </View>

            <Text className="text-3xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
              Welcome to{"\n"}Pocket Coach
            </Text>
            <Text className="text-slate-500 mt-2 text-base">
              Sign in to your account to continue.
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center border-b-2 border-slate-100 dark:border-zinc-800 pb-2 mb-4">
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#94a3b8"
                className="flex-1 text-lg text-slate-900 dark:text-slate-50 py-2"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="flex-row items-center border-b-2 border-slate-100 dark:border-zinc-800 pb-2 mb-2">
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                className="flex-1 text-lg text-slate-900 dark:text-slate-50 py-2"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              onPress={handleSignIn}
              disabled={loading || !email || !password}
              className={`mt-4 rounded-full py-5 flex-row items-center justify-center ${loading || !email || !password ? 'bg-slate-200 dark:bg-zinc-800' : 'bg-brand-500'
                }`}
            >
              <Text className={`text-lg font-semibold mr-2 ${loading || !email || !password ? 'text-slate-400' : 'text-white'
                }`}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
              {!loading && <Feather name="arrow-right" size={20} color={email && password ? 'white' : '#94a3b8'} />}
            </Pressable>

            <View className="flex-row items-center py-6">
              <View className="flex-1 h-[1px] bg-slate-100 dark:bg-zinc-800" />
              <Text className="px-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</Text>
              <View className="flex-1 h-[1px] bg-slate-100 dark:bg-zinc-800" />
            </View>

            <Pressable
              onPress={handleGoogleLogin}
              disabled={loading}
              className="rounded-full py-4 flex-row items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
            >
              <MaterialCommunityIcons name="google" size={20} color={Platform.OS === 'ios' ? '#64748b' : '#64748b'} />
              <Text className="ml-3 text-slate-900 dark:text-slate-50 font-semibold">Google</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Text className="mt-8 text-center text-slate-400 text-sm px-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
