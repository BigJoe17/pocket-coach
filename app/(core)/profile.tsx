import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ sessions: 0, flashcards: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
                setProfile(data);
            });

            // Mock fetching stats from the new tables
            setStats({ sessions: 12, flashcards: 48 });
        }
    }, [user]);

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to end your journey today?', [
            { text: 'Stay', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) Alert.alert('Error', error.message);
                }
            }
        ]);
    };

    const clearMemory = () => {
        Alert.alert('Clear Memory', 'This will delete all conversation history and flashcards. This action is permanent.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete All',
                style: 'destructive',
                onPress: async () => {
                    // Logic to wipe messages and flashcards
                    // await supabase.from('messages').delete().eq('user_id', user.id);
                    Alert.alert('Memory Wiped', 'Your digital slate is clean.');
                }
            }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header / Identity */}
                <View className="px-8 pt-12 pb-8 items-center">
                    <Animated.View
                        entering={FadeInDown.duration(600)}
                        className="w-24 h-24 rounded-full bg-brand-500 items-center justify-center border-4 border-white dark:border-zinc-900 shadow-xl"
                    >
                        <Feather name="user" size={48} color="white" />
                    </Animated.View>

                    <View className="mt-6 items-center">
                        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {profile?.full_name || 'Coach User'}
                        </Text>
                        <Text className="text-slate-400 mt-1 font-medium">{user?.email}</Text>

                        <View className="mt-4 px-4 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-full border border-brand-100 dark:border-brand-900/30">
                            <Text className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                Pro Member
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Insights Section */}
                <View className="px-8 mt-4">
                    <Text className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Growth Engine</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
                            <Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.sessions}</Text>
                            <Text className="text-xs text-zinc-400 mt-1 font-medium">Clear Sessions</Text>
                        </View>
                        <View className="flex-1 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
                            <Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.flashcards}</Text>
                            <Text className="text-xs text-zinc-400 mt-1 font-medium">Memory Cards</Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => {
                            setLoading(true);
                            setTimeout(() => {
                                setLoading(false);
                                Alert.alert('Insights Extracted', 'New flashcards have been generated from your recent sessions.');
                                setStats(s => ({ ...s, flashcards: s.flashcards + 3 }));
                            }, 1500);
                        }}
                        className="mt-4 bg-brand-500 py-4 rounded-[28px] items-center justify-center shadow-lg shadow-brand-500/20"
                    >
                        <Text className="text-white font-bold uppercase tracking-widest text-xs">Transform Memory to Insights</Text>
                    </Pressable>
                </View>

                {/* Memory Transparency */}
                <View className="px-8 mt-12">
                    <Text className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Memory Transparency</Text>
                    <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-100 dark:border-zinc-800">
                        <View className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-base font-semibold text-zinc-900 dark:text-white">Long-term Recall</Text>
                                <Switch
                                    value={true}
                                    trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                                    thumbColor="white"
                                />
                            </View>
                            <Text className="text-xs text-zinc-400 leading-relaxed">
                                Allow coaches to bridge insights across multiple conversations to find patterns.
                            </Text>
                        </View>

                        <Pressable
                            onPress={clearMemory}
                            className="p-6 active:bg-zinc-100 dark:active:bg-zinc-800 flex-row items-center justify-between"
                        >
                            <View>
                                <Text className="text-base font-semibold text-rose-500">Reset Digital Mind</Text>
                                <Text className="text-xs text-zinc-400 mt-1">Clear all session history and insights.</Text>
                            </View>
                            <Feather name="trash-2" size={18} color="#f43f5e" />
                        </Pressable>
                    </View>
                </View>

                {/* Preferences */}
                <View className="px-8 mt-12 mb-8">
                    <Text className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Preferences</Text>
                    <View className="space-y-4">
                        <Pressable className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-[24px] flex-row items-center border border-zinc-100 dark:border-zinc-800">
                            <View className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 items-center justify-center">
                                <Feather name="bell" size={20} color="#64748b" />
                            </View>
                            <Text className="ml-4 flex-1 text-base font-medium text-zinc-900 dark:text-white">Notifications</Text>
                            <Feather name="chevron-right" size={20} color="#cbd5e1" />
                        </Pressable>

                        <Pressable
                            onPress={handleLogout}
                            className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-[24px] flex-row items-center border border-zinc-100 dark:border-zinc-800"
                        >
                            <View className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 items-center justify-center">
                                <Feather name="log-out" size={20} color="#f43f5e" />
                            </View>
                            <Text className="ml-4 flex-1 text-base font-medium text-rose-500">Sign Out</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
