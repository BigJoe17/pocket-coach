import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type FlashcardProps = {
    insight: string;
    source: string;
    onRefresh?: () => void;
};

export function FlashcardReview({ insight, source, onRefresh }: FlashcardProps) {
    const [flipped, setFlipped] = useState(false);
    const spin = useSharedValue(0);

    const flip = () => {
        setFlipped(!flipped);
        spin.value = withSpring(flipped ? 0 : 180, { damping: 15 });
    };

    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(spin.value, [0, 180], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            backfaceVisibility: 'hidden',
        };
    });

    const backStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(spin.value, [0, 180], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
        };
    });

    return (
        <View className="px-6 mb-8 mt-4">
            <View className="flex-row items-center justify-between mb-4 px-2">
                <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="brain" size={16} color="#6366f1" />
                    <Text className="text-slate-900 dark:text-slate-50 font-bold text-sm uppercase tracking-widest">
                        From your memory
                    </Text>
                </View>
                <Pressable onPress={onRefresh} className="p-2">
                    <Feather name="refresh-cw" size={14} color="#94a3b8" />
                </Pressable>
            </View>

            <Pressable onPress={flip} className="h-48 w-full">
                {/* Front Side */}
                <Animated.View
                    className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-slate-100 dark:border-zinc-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 justify-center"
                    style={frontStyle}
                >
                    <MaterialCommunityIcons name="format-quote-open" size={24} color="#e2e8f0" />
                    <Text className="text-lg font-medium text-slate-800 dark:text-slate-200 mt-2 leading-relaxed" numberOfLines={3}>
                        {insight}
                    </Text>
                </Animated.View>

                {/* Back Side */}
                <Animated.View
                    className="bg-brand-500 rounded-[32px] p-8 shadow-xl shadow-brand-500/30 justify-center items-center"
                    style={backStyle}
                >
                    <Text className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-4">
                        Insight Source
                    </Text>
                    <Text className="text-white text-center font-medium text-base">
                        Discussed with {source}
                    </Text>
                    <Text className="text-brand-200 text-[10px] mt-8 uppercase tracking-widest">
                        Tap to flip back
                    </Text>
                </Animated.View>
            </Pressable>
        </View>
    );
}
