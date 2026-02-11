import { useVoicePreferences } from '@/hooks/voice/useVoicePreferences';
import { Coach } from '@/lib/coaches';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type Props = {
    coach: Coach | null;
    logout: () => void;
    onCallPress?: () => void;
};

export function ChatHeader({ coach, logout, onCallPress }: Props) {
    const router = useRouter();
    const { callEnabled } = useVoicePreferences();

    if (!coach) return null;

    return (
        <View className="px-6 py-6 flex-row justify-between items-center bg-white dark:bg-zinc-950 border-b border-zinc-50 dark:border-zinc-900">
            <Pressable
                onPress={() => router.back()}
                className="h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 active:bg-zinc-100"
            >
                <Feather name="chevron-left" size={22} color="#64748b" />
            </Pressable>

            <View className="items-center">
                <View className="flex-row items-center gap-3 mb-1">
                    <View className="bg-zinc-50 dark:bg-zinc-900 h-10 w-10 rounded-full items-center justify-center border border-zinc-100 dark:border-zinc-800">
                        <Text className="text-xl">{coach.emoji}</Text>
                    </View>
                    <Text className="text-[18px] font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        {coach.name}
                    </Text>
                </View>
                <View className="flex-row items-center gap-1.5 opacity-60">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <Text className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Cognitive Companion
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-3">
                {onCallPress && callEnabled ? (
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onCallPress();
                        }}
                        className="h-12 w-12 items-center justify-center rounded-full bg-brand-500 shadow-lg shadow-brand-500/20"
                    >
                        <Feather name="phone" size={20} color="white" />
                    </Pressable>
                ) : null}
                <Pressable onPress={logout} className="h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <Feather name="more-horizontal" size={20} color="#94a3b8" />
                </Pressable>
            </View>
        </View>
    );
}
