import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackgroundCircles } from '@/components/ui/background-circles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
    } else {
      setLoading(false);
      router.replace('/(core)/home');
    }
  }

  return (
    <ScreenWrapper className="bg-background">
      <View className="absolute inset-0">
        <BackgroundCircles />
      </View>

      <View className="flex-1 justify-center">
        <View className="rounded-[32px] bg-white/85 border border-white/80 p-6 shadow-xl shadow-slate-200/60">
          <Text className="text-[11px] font-semibold tracking-[0.3em] text-primary uppercase">
            Pocket Coach
          </Text>
          <Text className="text-3xl font-semibold text-text-primary mt-3">Welcome back</Text>
          <Text className="text-sm text-text-secondary mt-2">
            Pick up where you left off.
          </Text>

          <View className="mt-6 gap-4">
            <Input
              label="Email"
              placeholder="you@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View className="mt-6 gap-3">
            <Button
              title="Log in"
              onPress={signIn}
              loading={loading}
              disabled={loading}
              className="w-full rounded-full"
              size="lg"
            />
            <Pressable
              className="py-2"
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text className="text-center text-sm text-text-secondary">
                New here? <Text className="text-text-primary font-semibold">Create an account</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
