import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const PACES = [
    { id: 'daily', title: 'Daily Pulse', desc: 'Short morning check-ins every day.', icon: 'clock' },
    { id: 'deep', title: 'Strategic Weekly', desc: 'One long deep-dive session per week.', icon: 'calendar' },
    { id: 'reactive', title: 'Reactive Only', desc: 'Only when you reach out or need help.', icon: 'bell' },
    { id: 'gentle_reminder', title: 'Gentle Nudges', desc: 'Subtle prompts throughout the day.', icon: 'wind' },
];

export default function OnboardingPace() {
    const [selected, setSelected] = useState('');

    const next = () => {
        if (selected) {
            router.push('/(onboarding)/avatar');
        }
    };

    return (
        <View className="flex-1 px-8 pt-12">
            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                <Text className="text-brand-500 font-semibold tracking-widest text-xs uppercase mb-2">
                    Step 4 / 5
                </Text>
                <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                    What is your{"\n"}ideal pace?
                </Text>
            </Animated.View>

            <ScrollView className="mt-10" showsVerticalScrollIndicator={false}>
                <View className="gap-4 pb-10">
                    {PACES.map((pace, index) => (
                        <Animated.View
                            key={pace.id}
                            entering={FadeInDown.duration(600).delay(400 + index * 100)}
                        >
                            <Pressable
                                onPress={() => setSelected(pace.id)}
                                className={`flex-row items-center p-5 rounded-3xl border-2 transition-all ${selected === pace.id
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                                    }`}
                            >
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${selected === pace.id ? 'bg-brand-500' : 'bg-slate-50 dark:bg-zinc-800'
                                    }`}>
                                    <Feather name={pace.icon as any} size={24} color={selected === pace.id ? 'white' : '#64748b'} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className={`text-lg font-semibold ${selected === pace.id ? 'text-brand-900' : 'text-slate-900 dark:text-slate-50'
                                        }`}>
                                        {pace.title}
                                    </Text>
                                    <Text className="text-slate-500 text-sm">{pace.desc}</Text>
                                </View>
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <View className="mt-auto mb-10 pt-4">
                <Pressable
                    onPress={next}
                    disabled={!selected}
                    className={`rounded-full py-5 items-center justify-center ${selected ? 'bg-brand-500' : 'bg-slate-200 dark:bg-zinc-800'}`}
                >
                    <Text className={`text-lg font-semibold ${selected ? 'text-white' : 'text-slate-400'}`}>
                        Continue
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
