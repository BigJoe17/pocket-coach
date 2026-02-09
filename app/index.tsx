import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { BackgroundCircles } from '@/components/ui/background-circles';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper className="bg-background justify-between">
      <View className="absolute inset-0">
        <BackgroundCircles />
      </View>

      <View className="flex-1 justify-center">
        <View className="rounded-[32px] bg-white/85 border border-white/80 p-6 shadow-xl shadow-slate-200/60">
          <Text className="text-[11px] font-semibold tracking-[0.35em] text-primary uppercase">
            Pocket Coach
          </Text>
          <Text className="text-4xl font-semibold text-text-primary mt-4 leading-[44px]">
            Make space for clear decisions.
          </Text>
          <Text className="text-base text-text-secondary mt-3 leading-relaxed">
            A calm, private place to capture thoughts, clarify goals, and move forward with intent.
          </Text>

          <View className="flex-row flex-wrap gap-2 mt-6">
            <View className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100">
              <Text className="text-xs font-semibold text-teal-700">Focus</Text>
            </View>
            <View className="px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100">
              <Text className="text-xs font-semibold text-sky-700">Clarity</Text>
            </View>
            <View className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
              <Text className="text-xs font-semibold text-amber-700">Momentum</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="w-full gap-3 mb-8">
        <Button
          title="Create an account"
          onPress={() => router.push('/(auth)/signup')}
          className="w-full rounded-full"
          size="lg"
        />
        <Button
          title="Log in"
          variant="outline"
          onPress={() => router.push('/(auth)/login')}
          className="w-full rounded-full"
        />
        <Text className="text-center text-xs text-text-tertiary">
          Private by default • Designed for calm focus
        </Text>
      </View>
    </ScreenWrapper>
  );
}
