import { Pressable, Text, View } from 'react-native';

export default function PaywallScreen() {
  return (
    <View className="flex-1 bg-slate-950 px-6 pt-14">
      <Text className="text-xs font-semibold uppercase tracking-[3px] text-amber-200">
        Premium
      </Text>
      <Text className="mt-4 text-4xl font-semibold text-white">Unlock deeper focus</Text>
      <Text className="mt-3 text-base text-slate-300">
        Personalized plans, weekly insights, and a dedicated coach for your highest leverage goals.
      </Text>

      <View className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-base font-semibold text-white">Pro access</Text>
        <Text className="mt-2 text-sm text-slate-300">Unlimited sessions · Advanced streaks</Text>
        <Text className="mt-2 text-sm text-slate-300">Priority check-ins · Smart recaps</Text>
        <View className="mt-5 rounded-2xl bg-amber-300 px-4 py-3">
          <Text className="text-center text-lg font-semibold text-slate-900">$8 / month</Text>
        </View>
      </View>

      <Pressable className="mt-8 rounded-full bg-white px-6 py-4">
        <Text className="text-center text-base font-semibold text-slate-900">Start free trial</Text>
      </Pressable>
      <Pressable className="mt-3 rounded-full border border-white/20 px-6 py-4">
        <Text className="text-center text-base font-semibold text-white">Maybe later</Text>
      </Pressable>
    </View>
  );
}
