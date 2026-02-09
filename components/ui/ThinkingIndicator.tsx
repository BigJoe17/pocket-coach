import { View, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSequence
} from 'react-native-reanimated';
import { useEffect } from 'react';

export function ThinkingIndicator() {
    const opacity = useSharedValue(0.3);
    const scale = useSharedValue(0.95);

    useEffect(() => {
        // "Breathing" animation
        // Slow, calm pulse
        opacity.value = withRepeat(
            withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        scale.value = withRepeat(
            withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <View className="flex-row items-center gap-3 py-2 px-1">
            <Animated.View
                className="h-2 w-2 rounded-full bg-text-tertiary"
                style={animatedStyle}
            />
            <Text className="text-xs font-medium text-text-tertiary">
                Reflecting...
            </Text>
        </View>
    );
}
