import { CallState } from '@/lib/voice/types';
import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

type Props = {
    state: CallState;
    onClose: () => void;
    durationSeconds?: number;
};

export function VoiceMode({ state, onClose, durationSeconds = 0 }: Props) {
    // Pulse animation for "Listening" state
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.3);

    // Waveform bars for "Speaking" state
    const bar1 = useSharedValue(10);
    const bar2 = useSharedValue(10);
    const bar3 = useSharedValue(10);
    const bar4 = useSharedValue(10);

    useEffect(() => {
        if (state === 'listening') {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1
            );
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.1, { duration: 1000 }),
                    withTiming(0.3, { duration: 1000 })
                ),
                -1
            );
        } else {
            pulseScale.value = withTiming(1);
            pulseOpacity.value = withTiming(0);
        }

        if (state === 'speaking') {
            const randomHeight = () => Math.random() * 20 + 10;
            const animateBar = (bar: any, delay: number) => {
                bar.value = withRepeat(
                    withSequence(
                        withTiming(randomHeight(), { duration: 200 + delay }),
                        withTiming(10, { duration: 200 + delay })
                    ),
                    -1,
                    true
                );
            };
            animateBar(bar1, 0);
            animateBar(bar2, 50);
            animateBar(bar3, 100);
            animateBar(bar4, 150);
        } else {
            bar1.value = withTiming(10);
            bar2.value = withTiming(10);
            bar3.value = withTiming(10);
            bar4.value = withTiming(10);
        }
    }, [state]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const Bar = ({ value }: { value: any }) => {
        const style = useAnimatedStyle(() => ({ height: value.value }));
        return <Animated.View className="w-1 bg-zinc-900 dark:bg-zinc-100 rounded-full mx-[2px]" style={style} />;
    };

    const getStatusText = () => {
        switch (state) {
            case 'connecting': return 'Connecting...';
            case 'listening': return 'Listening...';
            case 'thinking': return 'Thinking...';
            case 'speaking': return 'Speaking';
            case 'error': return 'Connection Issue';
            default: return 'Voice Mode';
        }
    };

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="flex-1 flex-row items-center justify-between pl-4 pr-1 py-1"
        >
            {/* Status & Visuals */}
            <View className="flex-row items-center flex-1">
                {/* Visual Indicator Container */}
                <View className="h-10 w-10 items-center justify-center mr-3">
                    {state === 'listening' && (
                        <Animated.View
                            className="absolute w-full h-full rounded-full bg-brand-500"
                            style={pulseStyle}
                        />
                    )}

                    {state === 'speaking' ? (
                        <View className="flex-row items-center h-8">
                            <Bar value={bar1} />
                            <Bar value={bar2} />
                            <Bar value={bar3} />
                            <Bar value={bar4} />
                        </View>
                    ) : (
                        <View className={`h-3 w-3 rounded-full ${state === 'error' ? 'bg-red-500' : 'bg-brand-500'}`} />
                    )}
                </View>

                {/* Text Info */}
                <View>
                    <Text className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                        {getStatusText()}
                    </Text>
                    {durationSeconds > 0 && (
                        <Text className="text-zinc-500 text-xs font-medium">
                            {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}
                        </Text>
                    )}
                </View>
            </View>

            {/* Close / Switch to Text */}
            <Pressable
                onPress={onClose}
                className="h-11 w-11 rounded-full items-center justify-center bg-zinc-100 dark:bg-zinc-800"
            >
                <Feather name="type" size={20} color={Platform.OS === 'ios' ? '#000' : '#888'} />
            </Pressable>
        </Animated.View>
    );
}
