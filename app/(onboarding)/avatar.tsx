import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/lib/supabase';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const COLORS = [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#a855f7', // Purple
];

export default function OnboardingAvatar() {
    const { user } = useAuth();
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [loading, setLoading] = useState(false);

    const finish = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // In a real app, we'd batch these or pass them through param state
            // For this implementation, we'll just save the theme color as a proxy for the profile completion
            const { error } = await supabase
                .from('profiles')
                .update({
                    avatar_url: null, // Placeholder for future avatar selection
                    theme_color: selectedColor,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (error) throw error;

            router.replace('/(core)/home');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 px-8 pt-12">
            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                <Text className="text-brand-500 font-semibold tracking-widest text-xs uppercase mb-2">
                    Step 5 / 5
                </Text>
                <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                    One last touch.
                </Text>
                <Text className="text-slate-500 mt-4 text-base leading-relaxed">
                    Pick a color that resonates with your energy today.
                </Text>
            </Animated.View>

            <View className="mt-16 items-center">
                <View
                    className="w-32 h-32 rounded-full items-center justify-center border-4 border-white dark:border-zinc-800 shadow-2xl"
                    style={{ backgroundColor: selectedColor }}
                >
                    <Feather name="user" size={64} color="white" />
                </View>
            </View>

            <View className="mt-12 flex-row flex-wrap justify-center gap-4">
                {COLORS.map((color, index) => (
                    <Animated.View
                        key={color}
                        entering={FadeInDown.duration(600).delay(400 + index * 50)}
                    >
                        <Pressable
                            onPress={() => setSelectedColor(color)}
                            className={`w-12 h-12 rounded-full border-2 ${selectedColor === color ? 'border-brand-500 scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    </Animated.View>
                ))}
            </View>

            <View className="mt-auto mb-10 pt-4">
                <Pressable
                    onPress={finish}
                    disabled={loading}
                    className="rounded-full py-5 items-center justify-center bg-zinc-900 dark:bg-slate-50"
                >
                    {loading ? (
                        <ActivityIndicator color={selectedColor} />
                    ) : (
                        <Text className="text-lg font-semibold text-white dark:text-zinc-900">
                            Complete Profile
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}
