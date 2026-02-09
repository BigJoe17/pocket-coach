import { View, Text, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Coach } from '@/lib/coaches';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { useVoicePreferences } from '@/hooks/voice/useVoicePreferences';

type Props = {
    coach: Coach | null;
    logout: () => void;
    onCallPress?: () => void;
};

export function ChatHeader({ coach, logout, onCallPress }: Props) {
    const router = useRouter();
    const { callEnabled } = useVoicePreferences();
    const callScale = useRef(new Animated.Value(1)).current;

    const pressIn = () => {
        Animated.spring(callScale, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const pressOut = () => {
        Animated.spring(callScale, { toValue: 1, useNativeDriver: true }).start();
    };

    if (!coach) return null;

    return (
        <View className="px-6 py-5 flex-row justify-between items-center bg-white border-b border-border">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-50 dark:active:bg-zinc-900">
                <Ionicons name="chevron-back" size={24} color="#18181b" />
            </Pressable>

            <View className="items-center">
                <View className="flex-row items-center gap-2 mb-0.5">
                    <Text className="text-xl">{coach.emoji}</Text>
                    <Text className="text-base font-semibold text-text-primary tracking-tight">
                        {coach.name}
                    </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                        Online for you
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-2">
                {onCallPress && callEnabled ? (
                    <Animated.View style={{ transform: [{ scale: callScale }] }}>
                        <Pressable
                            onPressIn={pressIn}
                            onPressOut={pressOut}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onCallPress();
                            }}
                            className="h-10 w-10 items-center justify-center rounded-full bg-teal-50 border border-teal-100"
                        >
                            <Ionicons name="call" size={18} color="#0f172a" />
                        </Pressable>
                    </Animated.View>
                ) : null}
                <Pressable onPress={logout} className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-50">
                    <Ionicons name="exit-outline" size={22} color="#94a3b8" />
                </Pressable>
            </View>
        </View>
    );
}
