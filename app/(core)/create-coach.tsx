import { useSubscription } from '@/ctx/SubscriptionContext';
import { saveCustomCoach } from '@/lib/coaches';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = ['Soul', 'Voice', 'Mind'];

const VOICES = [
    { id: 'onyx', name: 'Onyx', type: 'Male', tone: 'Deep, calm' },
    { id: 'nova', name: 'Nova', type: 'Female', tone: 'Bright, energetic' },
    { id: 'echo', name: 'Echo', type: 'Neutral', tone: 'Balanced, clear' },
];

const TONES = [
    { label: 'Reflective', color: '#6366f1' },
    { label: 'Direct', color: '#10b981' },
    { label: 'Hypeman', color: '#f59e0b' },
    { label: 'Gentle', color: '#ec4899' },
];

export default function CreateCoachScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [step, setStep] = useState(0);

    const [form, setForm] = useState({
        name: '',
        purpose: '',
        emoji: '✨',
        toneLabel: 'Reflective',
        voiceId: 'echo',
        systemPrompt: '',
        memory: { longTerm: true, sessionBased: false }
    });

    const { isPro } = useSubscription();

    const handleGenerate = async () => {
        if (!form.purpose) {
            Alert.alert('Purpose Needed', 'Tell me what this coach is for first.');
            return;
        }
        setGenerating(true);
        try {
            // Mocking AI suggestion logic - in production, call your edge function
            const { data, error } = await supabase.functions.invoke('coach', {
                body: {
                    messages: [{ role: 'user', content: `Suggest a name, single emoji, and tone (one word) for a coach that: ${form.purpose}. Return as JSON: {name, emoji, tone}` }],
                    mode: 'suggest'
                }
            });

            if (data) {
                setForm(prev => ({
                    ...prev,
                    name: data.suggestion?.name || prev.name,
                    emoji: data.suggestion?.emoji || prev.emoji,
                    toneLabel: data.suggestion?.tone || prev.toneLabel
                }));
            } else {
                // Fallback mock behaviors
                setTimeout(() => {
                    setForm(prev => ({ ...prev, name: 'The Architect', emoji: '📐', toneLabel: 'Direct' }));
                    setGenerating(false);
                }, 1000);
                return;
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    const handleCreate = async () => {
        if (!isPro) {
            router.push('/paywall');
            return;
        }

        if (!form.name || !form.systemPrompt) {
            Alert.alert('Incomplete', 'Every intelligence needs a name and a mind.');
            return;
        }

        setLoading(true);
        try {
            const newCoach = {
                id: `custom_${Date.now()}`,
                name: form.name,
                subtitle: form.purpose,
                tone: form.toneLabel,
                emoji: form.emoji,
                color: 'zinc',
                isCustom: true,
                systemPrompt: form.systemPrompt,
                voiceId: form.voiceId,
                memorySettings: form.memory,
                toneLabel: form.toneLabel
            };

            await saveCustomCoach(newCoach);
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to materialize coach');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 0 && !form.name) {
            Alert.alert('Name Needed', 'Please give your coach a name.');
            return;
        }
        if (step < STEPS.length - 1) setStep(step + 1);
        else handleCreate();
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
            <StatusBar style="auto" />
            <View className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    {/* Header */}
                    <View className="px-6 py-4 flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-900">
                        <Pressable
                            onPress={() => step > 0 ? setStep(step - 1) : router.back()}
                            className="h-10 w-10 items-center justify-center rounded-full active:bg-zinc-50 dark:active:bg-zinc-900 -ml-2"
                        >
                            <Feather name={step > 0 ? "chevron-left" : "x"} size={24} color="#64748b" />
                        </Pressable>

                        <View className="flex-row gap-1.5">
                            {STEPS.map((_, i) => (
                                <View
                                    key={i}
                                    className={`h-1.5 w-6 rounded-full ${i === step ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                                />
                            ))}
                        </View>

                        <View className="w-10" />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
                    >
                        {step === 0 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 leading-tight mb-2">
                                    The Soul.
                                </Text>
                                <Text className="text-base text-zinc-400 font-medium mb-10">
                                    What is the core purpose of this intelligence?
                                </Text>

                                <View className="space-y-6">
                                    <View>
                                        <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-3 tracking-widest pl-1">Purpose</Text>
                                        <View className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px] px-5 py-5">
                                            <TextInput
                                                multiline
                                                numberOfLines={3}
                                                className="text-base text-zinc-900 dark:text-zinc-50 leading-relaxed"
                                                placeholder="e.g. A Stoic advisor who helps me stay calm and focused during high-stress work weeks."
                                                placeholderTextColor="#94a3b8"
                                                textAlignVertical="top"
                                                value={form.purpose}
                                                onChangeText={(t) => setForm({ ...form, purpose: t })}
                                            />
                                        </View>
                                        <Pressable
                                            onPress={handleGenerate}
                                            disabled={generating}
                                            className="mt-4 self-end flex-row items-center bg-brand-50 dark:bg-brand-900/10 px-4 py-2 rounded-full"
                                        >
                                            {generating ? (
                                                <ActivityIndicator size="small" color="#6366f1" />
                                            ) : (
                                                <>
                                                    <Feather name="zap" size={14} color="#6366f1" />
                                                    <Text className="text-[#6366f1] text-xs font-bold ml-2">Suggest Persona</Text>
                                                </>
                                            )}
                                        </Pressable>
                                    </View>

                                    <View className="flex-row gap-4 mt-4">
                                        <View className="flex-1">
                                            <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-3 tracking-widest pl-1">Name</Text>
                                            <View className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[20px] px-5 py-4">
                                                <TextInput
                                                    className="text-lg text-zinc-900 dark:text-zinc-50 font-semibold"
                                                    placeholder="Name"
                                                    placeholderTextColor="#94a3b8"
                                                    value={form.name}
                                                    onChangeText={(t) => setForm({ ...form, name: t })}
                                                />
                                            </View>
                                        </View>
                                        <View className="w-24">
                                            <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-3 tracking-widest text-center">Icon</Text>
                                            <View className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[20px] px-5 py-4 items-center">
                                                <TextInput
                                                    className="text-xl text-zinc-900 dark:text-zinc-50"
                                                    placeholder="✨"
                                                    value={form.emoji}
                                                    onChangeText={(t) => setForm({ ...form, emoji: t })}
                                                    maxLength={2}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        )}

                        {step === 1 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 leading-tight mb-2">
                                    Voice & Tone.
                                </Text>
                                <Text className="text-base text-zinc-400 font-medium mb-10">
                                    How should they sound and speak?
                                </Text>

                                <View className="space-y-8">
                                    <View>
                                        <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-4 tracking-widest pl-1">Personality Tone</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {TONES.map((t) => (
                                                <Pressable
                                                    key={t.label}
                                                    onPress={() => setForm({ ...form, toneLabel: t.label })}
                                                    className={`px-6 py-3 rounded-full border-2 ${form.toneLabel === t.label ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white' : 'bg-transparent border-zinc-100 dark:border-zinc-800'}`}
                                                >
                                                    <Text className={`text-sm font-semibold ${form.toneLabel === t.label ? 'text-white dark:text-zinc-900' : 'text-zinc-400'}`}>
                                                        {t.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-4 tracking-widest pl-1">Acoustic Voice</Text>
                                        {VOICES.map((v) => (
                                            <Pressable
                                                key={v.id}
                                                onPress={() => setForm({ ...form, voiceId: v.id })}
                                                className={`flex-row items-center p-4 rounded-[24px] mb-3 border-2 ${form.voiceId === v.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-zinc-50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900'}`}
                                            >
                                                <View className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 items-center justify-center">
                                                    <Feather name="volume-2" size={20} color={form.voiceId === v.id ? "#6366f1" : "#94a3b8"} />
                                                </View>
                                                <View className="ml-4 flex-1">
                                                    <Text className={`text-base font-semibold ${form.voiceId === v.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>{v.name}</Text>
                                                    <Text className="text-xs text-zinc-400 mt-0.5">{v.type} • {v.tone}</Text>
                                                </View>
                                                {form.voiceId === v.id && (
                                                    <Feather name="check-circle" size={20} color="#6366f1" />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </Animated.View>
                        )}

                        {step === 2 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 leading-tight mb-2">
                                    The Mind.
                                </Text>
                                <Text className="text-base text-zinc-400 font-medium mb-10">
                                    Configure their memory and constraints.
                                </Text>

                                <View className="space-y-8">
                                    <View>
                                        <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-4 tracking-widest pl-1">System Instructions</Text>
                                        <View className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px] px-5 py-5 min-h-[160px]">
                                            <TextInput
                                                multiline
                                                className="text-base text-zinc-900 dark:text-zinc-50 leading-relaxed"
                                                placeholder="You are a calm, stoic coach..."
                                                placeholderTextColor="#94a3b8"
                                                textAlignVertical="top"
                                                value={form.systemPrompt}
                                                onChangeText={(t) => setForm({ ...form, systemPrompt: t })}
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-[10px] uppercase text-zinc-400 font-bold mb-4 tracking-widest pl-1">Memory Behavior</Text>
                                        <View className="bg-zinc-50 dark:bg-zinc-900 rounded-[28px] overflow-hidden">
                                            <Pressable
                                                onPress={() => setForm({ ...form, memory: { ...form.memory, longTerm: !form.memory.longTerm } })}
                                                className="flex-row items-center p-5 border-b border-zinc-100 dark:border-zinc-800"
                                            >
                                                <View className="flex-1">
                                                    <Text className="text-base font-semibold text-zinc-900 dark:text-white">Long-term Continuity</Text>
                                                    <Text className="text-xs text-zinc-400 mt-1">Remember context across different days.</Text>
                                                </View>
                                                <View className={`w-12 h-6 rounded-full px-1 justify-center ${form.memory.longTerm ? 'bg-brand-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                                    <View className={`w-4 h-4 rounded-full bg-white ${form.memory.longTerm ? 'self-end' : 'self-start'}`} />
                                                </View>
                                            </Pressable>

                                            <Pressable
                                                onPress={() => setForm({ ...form, memory: { ...form.memory, sessionBased: !form.memory.sessionBased } })}
                                                className="flex-row items-center p-5"
                                            >
                                                <View className="flex-1">
                                                    <Text className="text-base font-semibold text-zinc-900 dark:text-white">Ephemeral Sessions</Text>
                                                    <Text className="text-xs text-zinc-400 mt-1">Wipe memory after each conversation.</Text>
                                                </View>
                                                <View className={`w-12 h-6 rounded-full px-1 justify-center ${form.memory.sessionBased ? 'bg-brand-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                                    <View className={`w-4 h-4 rounded-full bg-white ${form.memory.sessionBased ? 'self-end' : 'self-start'}`} />
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        )}
                    </ScrollView>

                    {/* Footer Action */}
                    <View className="absolute bottom-0 w-full bg-white/90 dark:bg-zinc-950/90 py-6 px-8 border-t border-zinc-50 dark:border-zinc-900" style={{ paddingBottom: 40 }}>
                        <Pressable
                            onPress={nextStep}
                            disabled={loading}
                            className={`w-full h-16 rounded-full items-center justify-center shadow-xl shadow-zinc-200 dark:shadow-black/50 ${loading ? 'bg-zinc-100' : 'bg-zinc-900 dark:bg-slate-50 active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text className="text-base font-bold tracking-widest text-white dark:text-zinc-900 uppercase">
                                    {step === STEPS.length - 1 ? 'Initialize Intelligence' : 'Continue'}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

