import { useVoicePreferences } from '@/hooks/voice/useVoicePreferences';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, TextInput, useColorScheme, View } from 'react-native';
import { VoiceMode } from './VoiceMode';

type PROPS = {
    onSend: (text: string) => void;
    input: string;
    setInput: (text: string) => void;
    onVoiceRecording?: (uri: string) => void;
};

export function ChatInput({ onSend, input, setInput, onVoiceRecording }: PROPS) {
    const { voiceInputEnabled } = useVoicePreferences();
    const colorScheme = useColorScheme();
    const [isVoiceMode, setIsVoiceMode] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSend(input);
    };

    const toggleVoiceMode = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsVoiceMode(!isVoiceMode);
    };

    const isDark = colorScheme === 'dark';

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 40,
                left: 24,
                right: 24,
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.15,
                        shadowRadius: 30,
                    },
                    android: {
                        elevation: 10,
                    }
                })
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    backgroundColor: isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    borderWidth: 1,
                    borderColor: isDark ? '#27272a' : '#f4f4f5',
                    borderRadius: 36,
                    paddingHorizontal: isVoiceMode ? 4 : 8,
                    paddingVertical: isVoiceMode ? 4 : 8,
                }}
            >
                {isVoiceMode ? (
                    <VoiceMode
                        state="listening"
                        onClose={() => setIsVoiceMode(false)}
                    />
                ) : (
                    <>
                        <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center' }}>
                            <Pressable
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                style={({ pressed }) => ({
                                    height: 40,
                                    width: 40,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 20,
                                    backgroundColor: isDark ? '#27272a' : '#fafafa',
                                    opacity: pressed ? 0.7 : 1
                                })}
                            >
                                <Feather name="plus" size={20} color="#64748b" />
                            </Pressable>
                        </View>

                        <TextInput
                            style={{
                                flex: 1,
                                fontSize: 17,
                                color: isDark ? '#fafafa' : '#18181b',
                                maxHeight: 128,
                                minHeight: 48,
                                paddingHorizontal: 12,
                                paddingTop: 12,
                                paddingBottom: 12,
                            }}
                            placeholder="Deep work thoughts..."
                            placeholderTextColor="#94a3b8"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            returnKeyType="default"
                            blurOnSubmit={false}
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 4, paddingBottom: 4 }}>
                            {input.trim() ? (
                                <Pressable
                                    onPress={handleSend}
                                    style={({ pressed }) => ({
                                        height: 44,
                                        width: 44,
                                        borderRadius: 22,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isDark ? '#fafafa' : '#18181b',
                                        opacity: pressed ? 0.8 : 1,
                                        ...Platform.select({
                                            ios: {
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 8,
                                            },
                                            android: {
                                                elevation: 4,
                                            }
                                        })
                                    })}
                                >
                                    <Feather name="arrow-up" size={22} color={isDark ? '#18181b' : 'white'} />
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={toggleVoiceMode}
                                    style={({ pressed }) => ({
                                        height: 44,
                                        width: 44,
                                        borderRadius: 22,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isDark ? '#27272a' : '#fafafa',
                                        opacity: pressed ? 0.7 : 1
                                    })}
                                >
                                    <Feather name="mic" size={20} color="#94a3b8" />
                                </Pressable>
                            )}
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}
