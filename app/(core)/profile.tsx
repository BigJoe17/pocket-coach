import { View, Text, Pressable, Alert } from 'react-native';
import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user) {
            supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
                setProfile(data);
            });
        }
    }, [user]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        }
        // Auth context handles redirection
    }; 
    return (
        <SafeAreaView className="flex-1 bg-zinc-50">
            <View className="flex-1 px-8 pt-12">
                <Text className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-12">
                    Profile
                </Text>

                <View className="mb-14">
                    <Text className="text-3xl font-light text-zinc-900 mb-2 tracking-tight">
                        {profile?.full_name || 'Coach User'}
                    </Text>
                    <Text className="text-base text-zinc-500 font-light">
                        {user?.email}
                    </Text>
                </View>

                <View className="space-y-8 mb-auto">
                    <View>
                        <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                            Current Goal
                        </Text>
                        <Text className="text-xl text-zinc-800 font-light">
                            Clarity & Focus
                        </Text>
                    </View>

                    <View>
                        <Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                            Sessions
                        </Text>
                        <Text className="text-xl text-zinc-800 font-light">
                            12
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={handleLogout}
                    className="w-full border border-zinc-200 h-14 rounded-full items-center justify-center active:bg-zinc-100 mb-8"
                >
                    <Text className="text-zinc-900 font-medium text-base">Log out</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
