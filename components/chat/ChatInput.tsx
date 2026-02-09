import { View, TextInput, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { VoiceInputButton } from '@/components/voice/VoiceInputButton';
import { useVoicePreferences } from '@/hooks/voice/useVoicePreferences';

type PROPS = {
    onSend: (text: string) => void;
    input: string;
    setInput: (text: string) => void;
    onVoiceRecording?: (uri: string) => void;
};

export function ChatInput({ onSend, input, setInput, onVoiceRecording }: PROPS) {
    const { voiceInputEnabled } = useVoicePreferences();
    const handleSend = () => {
        if (!input.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSend(input);
    };

    return (
        <View className="px-6 py-4 bg-transparent absolute bottom-8 w-full">
            <View className="flex-row items-end bg-white border border-border rounded-[32px] pl-6 pr-2 py-2 shadow-xl shadow-slate-200/60">
                <TextInput
                    className="flex-1 text-[16px] text-text-primary max-h-32 min-h-[48px] pt-3 pb-3"
                    placeholder="Reflect here..."
                    placeholderTextColor="#94a3b8"
                    value={input}
                    onChangeText={setInput}
                    multiline
                    returnKeyType="default"
                    blurOnSubmit={false}
                />
                <View className="pb-1">
                    {input.trim() ? (
                        <Pressable
                            onPress={handleSend}
                            className="h-11 w-11 rounded-full items-center justify-center transition-all bg-slate-900 active:bg-slate-800"
                        >
                            <Ionicons name="arrow-up" size={24} color="white" />
                        </Pressable>
                    ) : voiceInputEnabled ? (
                        <VoiceInputButton onRecordingComplete={onVoiceRecording} />
                    ) : (
                        <Pressable
                            onPress={handleSend}
                            className="h-11 w-11 rounded-full items-center justify-center transition-all bg-slate-50"
                        >
                            <Ionicons name="mic-outline" size={22} color="#94a3b8" />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

