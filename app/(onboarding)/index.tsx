import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OnboardingName() {
  const [name, setName] = useState('');

  const next = () => {
    if (name.trim()) {
      router.push('/(onboarding)/goal');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 px-8 pt-12">
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Text className="text-brand-500 font-semibold tracking-widest text-xs uppercase mb-2">
            Step 1 / 5
          </Text>
          <Text className="text-4xl font-semibold text-slate-900 dark:text-slate-50 leading-tight">
            What should I{"\n"}call you?
          </Text>
          <Text className="text-slate-500 mt-4 text-base leading-relaxed">
            I'll use this to personalize our coaching sessions and build a profile just for you.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          className="mt-12"
        >
          <TextInput
            autoFocus
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            className="text-2xl font-medium text-slate-900 dark:text-slate-50 border-b-2 border-slate-200 dark:border-zinc-800 pb-2"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </Animated.View>

        <View className="mt-auto mb-10">
          <Pressable
            onPress={next}
            disabled={!name.trim()}
            className={`rounded-full py-5 items-center justify-center ${name.trim() ? 'bg-brand-500' : 'bg-slate-200 dark:bg-zinc-800'}`}
          >
            <Text className={`text-lg font-semibold ${name.trim() ? 'text-white' : 'text-slate-400'}`}>
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
