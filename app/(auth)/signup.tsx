import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BackgroundCircles } from '@/components/ui/background-circles';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'pocketcoach://auth/callback',
        data: {
          username: username,
          full_name: username,
        },
      },
    });

    if (error) {
      Alert.alert('Signup Failed', error.message);
      setLoading(false);
    } else {
      setLoading(false);
      Alert.alert('Success', 'Account created! Please check your email.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
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
          <Text className="text-3xl font-semibold text-text-primary mt-3">Start fresh</Text>
          <Text className="text-sm text-text-secondary mt-2">
            Build a space that keeps you focused.
          </Text>

          <View className="mt-6 gap-4">
            <Input
              label="Username"
              placeholder="Your handle"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
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
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View className="mt-6 gap-3">
            <Button
              title="Create account"
              onPress={signUp}
              loading={loading}
              disabled={loading}
              className="w-full rounded-full"
              size="lg"
            />
            <Pressable
              className="py-2"
              onPress={() => router.back()}
            >
              <Text className="text-center text-sm text-text-secondary">
                Already have an account? <Text className="text-text-primary font-semibold">Log in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
