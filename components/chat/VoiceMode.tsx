import { CallState } from '@/lib/voice/types';
import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, Pressable, Text, useColorScheme, View } from 'react-native';
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

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
        return (
            <Animated.View
                style={[
                    { width: 4, borderRadius: 2, marginHorizontal: 2, backgroundColor: isDark ? '#f4f4f5' : '#18181b' },
                    style
                ]}
            />
        );
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
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 4, paddingVertical: 4 }}
        >
            {/* Status & Visuals */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {/* Visual Indicator Container */}
                <View style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    {state === 'listening' && (
                        <Animated.View
                            style={[
                                { position: 'absolute', width: '100%', height: '100%', borderRadius: 20, backgroundColor: '#3b82f6' },
                                pulseStyle
                            ]}
                        />
                    )}

                    {state === 'speaking' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 32 }}>
                            <Bar value={bar1} />
                            <Bar value={bar2} />
                            <Bar value={bar3} />
                            <Bar value={bar4} />
                        </View>
                    ) : (
                        <View
                            style={{
                                height: 12,
                                width: 12,
                                borderRadius: 6,
                                backgroundColor: state === 'error' ? '#ef4444' : '#3b82f6'
                            }}
                        />
                    )}
                </View>

                {/* Text Info */}
                <View>
                    <Text style={{ color: isDark ? '#f4f4f5' : '#18181b', fontWeight: '600', fontSize: 16 }}>
                        {getStatusText()}
                    </Text>
                    {durationSeconds > 0 && (
                        <Text style={{ color: '#71717a', fontSize: 12, fontWeight: '500' }}>
                            {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}
                        </Text>
                    )}
                </View>
            </View>

            {/* Close / Switch to Text */}
            <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                    height: 44,
                    width: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                    opacity: pressed ? 0.7 : 1
                })}
            >
                <Feather name="type" size={20} color={Platform.OS === 'ios' ? (isDark ? '#fff' : '#000') : '#888'} />
            </Pressable>
        </Animated.View>
    );
}
