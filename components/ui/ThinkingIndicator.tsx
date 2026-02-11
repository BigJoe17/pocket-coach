import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

export function ThinkingIndicator() {
    const pulse = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        opacity.value = withRepeat(
            withTiming(0.6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: pulse.value }],
    }));

    return (
        <View className="flex-row items-center gap-3 py-4 px-6">
            <View className="relative items-center justify-center">
                <Animated.View
                    className="absolute h-4 w-4 rounded-full bg-brand-400/20"
                    style={animatedStyle}
                />
                <View className="h-2 w-2 rounded-full bg-brand-500" />
            </View>
            <Text className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                Thinking clearly...
            </Text>
        </View>
    );
}
