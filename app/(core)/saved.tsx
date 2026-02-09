
import { useEffect, useState } from 'react';
import { Pressable, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/ctx/AuthContext';
import { router } from 'expo-router';

export default function SavedScreen() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user]);

  async function fetchSavedItems() {
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-[#F4F6FB] px-6 pt-14">
      <Text className="text-xs font-semibold uppercase tracking-[3px] text-indigo-600">
        Library
      </Text>
      <Text className="mt-4 text-4xl font-semibold text-slate-900">Saved sessions</Text>
      <Text className="mt-3 text-base text-slate-600">
        Capture moments that you want to revisit. Highlights, plans, and recap notes show up here.
      </Text>

      {loading ? (
        <View className="mt-8">
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : savedItems.length === 0 ? (
        <View className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <Text className="text-base font-semibold text-slate-900">Nothing saved yet</Text>
          <Text className="mt-2 text-sm text-slate-600">
            Save a coach session to build a personal playbook.
          </Text>
          <Pressable
            className="mt-4 rounded-full bg-slate-900 px-5 py-3"
            onPress={() => router.push('/(core)/home')}
          >
            <Text className="text-center text-sm font-semibold text-white">Explore coaches</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="mt-8 flex-1" showsVerticalScrollIndicator={false}>
          {savedItems.map((item) => (
            <View key={item.id} className="mb-4 rounded-3xl bg-white p-5 shadow-sm shadow-slate-900/5">
              <Text className="text-sm font-semibold text-slate-900 capitalize">{item.type}</Text>
              <Text className="mt-2 text-base text-slate-700">{typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}</Text>
              <Text className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
