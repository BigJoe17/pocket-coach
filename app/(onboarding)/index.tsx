
import { useState } from 'react';
import { Pressable, Text, View, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/ctx/AuthContext';

export default function Onboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    style: 'direct',
    window: 'morning',
    accountability: 'gentle',
  });

  async function finishSetup() {
    if (!user) {
      Alert.alert('Error', 'No user found');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ preferences })
      .eq('id', user.id); // Check Update Policy if this fails

    // Allow insert if profile doesn't exist? Trigger handles creation.
    // We assume policy allows update.

    if (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save preferences');
      setLoading(false);
    } else {
      setLoading(false);
      router.replace('/(core)/home');
    }
  }

  return (
    <View className="flex-1 bg-[#F7F3EE]">
      <View className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-rose-200/80" />
      <View className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-amber-200/70" />

      <View className="flex-1 px-6 pt-14">
        <Text className="text-xs font-semibold uppercase tracking-[3px] text-rose-700">
          Onboarding
        </Text>
        <Text className="mt-4 text-4xl font-semibold text-slate-900">Shape your coach</Text>
        <Text className="mt-3 text-base text-slate-600">
          Quick preferences to tune tone, energy, and focus. Takes less than a minute.
        </Text>

        <View className="mt-8">
          {/* Static for now, but state is ready */}
          <Pressable onPress={() => setPreferences({ ...preferences, style: 'direct' })} className={`rounded-3xl bg-white/90 p-5 shadow-lg shadow-slate-900/10 ${preferences.style === 'direct' ? 'border-2 border-rose-400' : ''}`}>
            <Text className="text-sm font-semibold text-slate-900">Coaching style</Text>
            <Text className="mt-2 text-sm text-slate-600">Direct, encouraging, and practical.</Text>
          </Pressable>
          <View className="mt-3 rounded-3xl bg-white/90 p-5 shadow-lg shadow-slate-900/10">
            <Text className="text-sm font-semibold text-slate-900">Focus window</Text>
            <Text className="mt-2 text-sm text-slate-600">Morning deep work, 9:00 - 11:00.</Text>
          </View>
          <View className="mt-3 rounded-3xl bg-white/90 p-5 shadow-lg shadow-slate-900/10">
            <Text className="text-sm font-semibold text-slate-900">Accountability</Text>
            <Text className="mt-2 text-sm text-slate-600">Gentle check-ins with streaks.</Text>
          </View>
        </View>

        <Pressable
          className="mt-8 rounded-full bg-slate-900 px-6 py-4 flex-row justify-center"
          onPress={finishSetup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-base font-semibold text-white">Finish setup</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
