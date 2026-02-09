
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/ctx/AuthContext';
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCoaches, Coach } from '@/lib/coaches';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCoaches().then(setCoaches);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
          setProfile(data);
        });
      }
    }, [user])
  );

  const firstName = profile?.full_name?.split(' ')[0] || 'Joshua'; // Fallback to Joshua for demo if needed

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View className="px-8 pt-6 pb-10">
          <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
            Pocket Coach
          </Text>
          <Text className="text-4xl font-light text-zinc-900 tracking-tight leading-[44px]">
            How are you feeling,{"\n"}
            <Text className="font-medium">{firstName}?</Text>
          </Text>
        </View>

        {/* Quick Insights / Daily Card */}
        <View className="px-6 mb-12">
          <View className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100">
            <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Daily Intention</Text>
            <Text className="text-xl font-light text-zinc-800 leading-relaxed italic">
              “Focus on the process, not the outcome. Clarity follows action.”
            </Text>
            <View className="h-[1px] bg-zinc-200 w-12 my-6" />
            <Text className="text-xs text-zinc-500 font-medium">Monday, Feb 9</Text>
          </View>
        </View>

        {/* Coaches Section */}
        <View className="px-6 mb-12">
          <View className="flex-row items-center justify-between mb-8 px-2">
            <Text className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Select a Coach</Text>
            <Pressable onPress={() => router.push('/(core)/create-coach')}>
              <Text className="text-xs font-semibold text-zinc-400">Manage</Text>
            </Pressable>
          </View>

          <View className="space-y-4">
            {coaches.map((coach) => (
              <Pressable
                key={coach.id}
                className="bg-white rounded-[24px] p-6 border border-zinc-100 flex-row items-center active:scale-[0.98] transition-all"
                onPress={() => router.push({ pathname: '/(core)/chat/[coach]', params: { coach: coach.id } })}
              >
                <View className="h-16 w-16 rounded-2xl bg-zinc-50 items-center justify-center mr-5">
                  <Text className="text-3xl">{coach.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-medium text-zinc-900 mb-0.5">{coach.name}</Text>
                  <Text className="text-sm text-zinc-400 font-light" numberOfLines={1}>{coach.subtitle}</Text>
                </View>
                <View className="ml-2">
                  <Text className="text-zinc-300 transform scale-150">→</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Create Custom Action */}
        <View className="px-6">
          <Pressable
            onPress={() => router.push('/(core)/create-coach')}
            className="bg-zinc-900 py-6 rounded-full items-center justify-center"
          >
            <Text className="text-white font-medium text-base tracking-wide">Design your own coach</Text>
          </Pressable>
        </View>

        <View className="items-center mt-12 mb-8">
          <Text className="text-[10px] font-medium text-zinc-300 tracking-widest uppercase">Safe • Private • Minimal</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

