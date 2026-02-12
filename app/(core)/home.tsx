import { FlashcardReview } from '@/components/FlashcardReview';
import { useAuth } from '@/ctx/AuthContext';
import { useSubscription } from '@/ctx/SubscriptionContext';
import { Coach, getCoaches } from '@/lib/coaches';
import { supabase } from '@/lib/supabase';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { isPro } = useSubscription();
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

  const firstName = profile?.full_name?.split(' ')[0] || profile?.display_name || 'there';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
      <StatusBar style="auto" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header Section */}
        <View className="px-8 pt-8 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 text-sm font-medium">
              Good morning,
            </Text>
            <Text className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {firstName}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(core)/profile')}
            className="w-12 h-12 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm overflow-hidden"
            style={{ backgroundColor: profile?.theme_color || '#6366f1' }}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Feather name="user" size={24} color="white" />
              </View>
            )}
            {isPro && (
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-zinc-800 items-center justify-center">
                <Feather name="star" size={8} color="white" />
              </View>
            )}
          </Pressable>
        </View>

        {/* AI Status Indicator */}
        <View className="px-8 mb-4 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            AI is ready to coach
          </Text>
        </View>

        {/* Flashcards Section */}
        <FlashcardReview
          insight="You mentioned feeling overwhelmed by social media. Try setting a 15-min timer today."
          source="Coach Aura"
        />

        {/* Featured Card / Insight */}
        <View className="px-6 mb-10">
          <Animated.View
            entering={FadeInDown.duration(800).delay(200)}
            style={{
              backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
              padding: 32,
              borderRadius: 32,
              borderWidth: 1,
              borderColor: colorScheme === 'dark' ? '#27272a' : '#f1f5f9',
              shadowColor: '#64748b',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.1,
              shadowRadius: 30,
              elevation: 10,
            }}
          >
            <Text className="text-brand-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Daily Intention
            </Text>
            <Text className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
              "Focus on the process, not the outcome. Clarity follows action."
            </Text>
            <View className="h-[2px] bg-slate-50 dark:bg-zinc-800 w-12 my-6" />
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-slate-400">Monday, Feb 10</Text>
              <Pressable className="bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Save</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {/* Coaches Grid */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-6 px-2">
            <Text className="text-slate-900 dark:text-slate-50 text-xl font-bold">Your Coaches</Text>
            <Pressable
              onPress={() => isPro ? router.push('/(core)/create-coach') : router.push('/paywall')}
              className="w-8 h-8 rounded-full bg-brand-500 items-center justify-center"
            >
              <Feather name="plus" size={20} color="white" />
            </Pressable>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {coaches.map((coach, index) => (
              <Animated.View
                key={coach.id}
                entering={FadeInDown.duration(600).delay(400 + index * 100)}
                className="w-[48%]"
              >
                <Pressable
                  onPress={() => router.push({ pathname: '/(core)/chat/[coach]', params: { coach: coach.id } })}
                  className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 shadow-lg shadow-slate-100 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                  <View className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800 items-center justify-center mb-4">
                    <Text className="text-3xl">{coach.emoji}</Text>
                  </View>
                  <Text className="text-slate-900 dark:text-slate-50 font-bold text-base" numberOfLines={1}>
                    {coach.name}
                  </Text>
                  <Text className="text-slate-400 text-xs mt-1" numberOfLines={2}>
                    {coach.subtitle}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        <View className="items-center mt-12 mb-8">
          <Text className="text-[10px] font-medium text-slate-300 dark:text-zinc-600 tracking-widest uppercase">
            Private • Focused • Human
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

