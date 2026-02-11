import { useVoicePreferences } from '@/hooks/voice/useVoicePreferences';
import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { VoiceMode } from './VoiceMode';

type PROPS = {
    onSend: (text: string) => void;
    input: string;
    setInput: (text: string) => void;
    onVoiceRecording?: (uri: string) => void;
};

export function ChatInput({ onSend, input, setInput, onVoiceRecording }: PROPS) {
    const { voiceInputEnabled } = useVoicePreferences();
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

    return (
        <View className="absolute bottom-10 left-6 right-6 shadow-2xl shadow-slate-200/50 dark:shadow-black/40">
            <View className={`flex-row items-end bg-white/95 dark:bg-zinc-900/95 border border-zinc-100 dark:border-zinc-800 rounded-[36px] ${isVoiceMode ? 'px-1 py-1' : 'px-2 py-2'}`}>

                {isVoiceMode ? (
                    <VoiceMode
                        state="listening" // placeholder state for now
                        onClose={() => setIsVoiceMode(false)}
                    />
                ) : (
                    <>
                        <View className="h-12 w-12 items-center justify-center">
                            <Pressable
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                className="h-10 w-10 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 active:bg-zinc-100"
                            >
                                <Feather name="plus" size={20} color="#64748b" />
                            </Pressable>
                        </View>

                        <TextInput
                            className="flex-1 text-[17px] text-zinc-900 dark:text-zinc-50 max-h-32 min-h-[48px] px-3 pt-3 pb-3"
                            placeholder="Deep work thoughts..."
                            placeholderTextColor="#94a3b8"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            returnKeyType="default"
                            blurOnSubmit={false}
                        />

                        <View className="flex-row items-center gap-1 pr-1 pb-1">
                            {input.trim() ? (
                                <Pressable
                                    onPress={handleSend}
                                    className="h-11 w-11 rounded-full items-center justify-center bg-zinc-900 dark:bg-zinc-50 active:bg-zinc-800 shadow-lg shadow-zinc-200/50"
                                >
                                    <Feather name="arrow-up" size={22} color={Platform.OS === 'ios' ? 'white' : (input.trim() ? 'white' : '#18181b')} />
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={toggleVoiceMode}
                                    className="h-11 w-11 rounded-full items-center justify-center bg-zinc-50 dark:bg-zinc-800 active:bg-zinc-100"
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

