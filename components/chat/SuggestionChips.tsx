import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutRight } from 'react-native-reanimated';

type PROMPT_CATEGORY = 'plan' | 'vent' | 'goal' | 'accountability';

const PROMPTS: { id: string; category: PROMPT_CATEGORY; text: string; label: string }[] = [
    { id: '1', category: 'plan', text: 'Help me plan my day for maximum productivity.', label: '🗓️ Plan my day' },
    { id: '2', category: 'vent', text: 'I feel overwhelmed right now.', label: '🧠 I feel overwhelmed' },
    { id: '3', category: 'goal', text: 'Let’s set realistic goals for today.', label: '🎯 Set today’s goals' },
    { id: '4', category: 'accountability', text: 'Keep me accountable on my main priority.', label: '⚡ Hold me accountable' },
];

type Props = {
    onSelect: (text: string) => void;
};

export function SuggestionChips({ onSelect }: Props) {
    return (
        <View className="flex-row flex-wrap gap-2 px-6 pb-2">
            {PROMPTS.map((prompt, index) => (
                <Animated.View
                    key={prompt.id}
                    entering={FadeInUp.delay(index * 100).springify().damping(12)}
                    exiting={FadeOutRight}
                >
                    <Pressable
                        onPress={() => onSelect(prompt.text)}
                        className="bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-sm active:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 active:scale-[0.98] transition-all"
                    >
                        <Text className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                            {prompt.label}
                        </Text>
                    </Pressable>
                </Animated.View>
            ))}
        </View>
    );
}
