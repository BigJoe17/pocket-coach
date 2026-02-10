import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { saveCustomCoach } from '@/lib/coaches';
import { useSubscription } from '@/ctx/SubscriptionContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function CreateCoachScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        subtitle: '',
        emoji: '',
        systemPrompt: ''
    });

    const { isPro } = useSubscription();

    const handleCreate = async () => {
        if (!isPro) {
            router.push('/paywall');
            return;
        }

        if (!form.name || !form.systemPrompt) {
            Alert.alert('Missing Incomplete', 'Every intelligence needs a name and a mind.');
            return;
        }

        setLoading(true);
        try {
            const newCoach = {
                id: `custom_${Date.now()}`,
                name: form.name,
                subtitle: form.subtitle || 'Custom Intelligence',
                tone: 'Unique',
                emoji: form.emoji || '✨',
                color: 'zinc',
                isCustom: true,
                systemPrompt: form.systemPrompt
            };

            await saveCustomCoach(newCoach);
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to materialize coach');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-zinc-50">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-50 -ml-2"
                    >
                        <Ionicons name="close" size={24} color="#18181b" />
                    </Pressable>
                    <Text className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-2">
                        Design Studio
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                    <Text className="text-3xl font-light text-zinc-900 leading-tight mb-2">
                        Create a new{"\n"}intelligence.
                    </Text>
                    <Text className="text-base text-zinc-400 font-light leading-relaxed mb-10">
                        Define the personality, expertise, and voice of your private coach.
                    </Text>

                    <View className="space-y-8">
                        {/* Identity Section */}
                        <View>
                            <Text className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4">Identity</Text>
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <View className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3">
                                        <Text className="text-[10px] uppercase text-zinc-400 font-semibold mb-1">Name</Text>
                                        <TextInput
                                            className="text-lg text-zinc-900 font-medium"
                                            placeholder="e.g. Strategist"
                                            placeholderTextColor="#d4d4d8"
                                            value={form.name}
                                            onChangeText={(t) => setForm({ ...form, name: t })}
                                        />
                                    </View>
                                </View>
                                <View className="w-24">
                                    <View className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 items-center">
                                        <Text className="text-[10px] uppercase text-zinc-400 font-semibold mb-1">Emoji</Text>
                                        <TextInput
                                            className="text-lg text-zinc-900 font-medium text-center"
                                            placeholder="✨"
                                            placeholderTextColor="#d4d4d8"
                                            value={form.emoji}
                                            onChangeText={(t) => setForm({ ...form, emoji: t })}
                                            maxLength={2}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Role Section */}
                        <View>
                            <Text className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4">Role</Text>
                            <View className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3">
                                <Text className="text-[10px] uppercase text-zinc-400 font-semibold mb-1">Short Description</Text>
                                <TextInput
                                    className="text-base text-zinc-900"
                                    placeholder="e.g. Helps me think from first principles"
                                    placeholderTextColor="#d4d4d8"
                                    value={form.subtitle}
                                    onChangeText={(t) => setForm({ ...form, subtitle: t })}
                                />
                            </View>
                        </View>

                        {/* Cognition Section */}
                        <View>
                            <Text className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4">Cognition</Text>
                            <View className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-4 min-h-[200px]">
                                <Text className="text-[10px] uppercase text-zinc-400 font-semibold mb-2">System Instructions</Text>
                                <TextInput
                                    multiline
                                    className="text-base text-zinc-900 leading-relaxed h-full"
                                    placeholder="You are a calm, highly intelligent coach. You speak in short, punchy sentences. You never give advice directly, but ask Socratic questions..."
                                    placeholderTextColor="#d4d4d8"
                                    textAlignVertical="top"
                                    value={form.systemPrompt}
                                    onChangeText={(t) => setForm({ ...form, systemPrompt: t })}
                                />
                            </View>
                            <Text className="text-xs text-zinc-400 mt-3 pl-1 leading-relaxed">
                                Tip: Be specific about how they should behave. Mention tone, length of response, and expertise.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Action */}
                <View className="absolute bottom-0 w-full bg-white/80 p-6 border-t border-zinc-50" style={{ paddingBottom: 40 }}>
                    <Pressable
                        onPress={handleCreate}
                        disabled={loading}
                        className={`w-full h-14 rounded-full items-center justify-center shadow-lg shadow-zinc-200 ${loading ? 'bg-zinc-100' : 'bg-zinc-900 active:bg-zinc-800'
                            }`}
                    >
                        <Text className={`text-base font-semibold tracking-wide ${loading ? 'text-zinc-400' : 'text-white'}`}>
                            {loading ? 'Designing...' : 'Initialize Intelligence'}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

