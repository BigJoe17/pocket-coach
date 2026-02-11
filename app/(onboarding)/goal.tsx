import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const GOALS = [
    { id: 'focus', title: 'Deep Focus', desc: 'Eliminate distractions and get work done.', icon: 'target' },
    { id: 'routine', title: 'Daily Routine', desc: 'Build lasting habits that stick.', icon: 'zap' },
    { id: 'growth', title: 'Personal Growth', desc: 'Level up your mindset and skills.', icon: 'trending-up' },
    { id: 'balance', title: 'Life Balance', desc: 'Find more time for what matters.', icon: 'sun' },
];

export default function OnboardingGoal() {
    const [selected, setSelected] = useState('');

    const next = () => {
        if (selected) {
            router.push('/(onboarding)/style');
        }
    };

    return (
        <View className="flex-1 px-8 pt-12">
            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                <Text className="text-brand-500 font-semibold tracking-widest text-xs uppercase mb-2">
                    Step 2 / 5
                </Text>
                <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                    What is your{"\n"}main goal?
                </Text>
            </Animated.View>

            <ScrollView className="mt-10" showsVerticalScrollIndicator={false}>
                <View className="gap-4 pb-10">
                    {GOALS.map((goal, index) => (
                        <Animated.View
                            key={goal.id}
                            entering={FadeInDown.duration(600).delay(400 + index * 100)}
                        >
                            <Pressable
                                onPress={() => setSelected(goal.id)}
                                className={`flex-row items-center p-5 rounded-3xl border-2 transition-all ${selected === goal.id
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                                    }`}
                            >
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${selected === goal.id ? 'bg-brand-500' : 'bg-slate-50 dark:bg-zinc-800'
                                    }`}>
                                    <Feather name={goal.icon as any} size={24} color={selected === goal.id ? 'white' : '#64748b'} />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className={`text-lg font-semibold ${selected === goal.id ? 'text-brand-900' : 'text-slate-900 dark:text-slate-50'
                                        }`}>
                                        {goal.title}
                                    </Text>
                                    <Text className="text-slate-500 text-sm">{goal.desc}</Text>
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
