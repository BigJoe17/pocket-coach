import Feather from '@expo/vector-icons/Feather';
import { Stack, router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = [
    '/(onboarding)',
    '/(onboarding)/goal',
    '/(onboarding)/style',
    '/(onboarding)/pace',
    '/(onboarding)/avatar',
];

export default function OnboardingLayout() {
    const pathname = usePathname();
    const currentStep = STEPS.indexOf(pathname as any);
    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-zinc-950">
            <View className="px-6 py-4 flex-row items-center justify-between">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                    style={{ opacity: currentStep === 0 ? 0 : 1 }}
                    disabled={currentStep === 0}
                >
                    <Feather name="chevron-left" size={20} color="#64748b" />
                </Pressable>

                <View className="flex-1 h-1 bg-slate-200 dark:bg-zinc-800 mx-4 rounded-full overflow-hidden">
                    <Animated.View
                        className="h-full bg-brand-500"
                        style={{ width: `${progress}%` }}
                    />
                </View>

                <Pressable onPress={() => router.replace('/(core)/home')}>
                    <Text className="text-sm font-medium text-slate-500">Skip</Text>
                </Pressable>
            </View>

            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
        </SafeAreaView>
    );
}
