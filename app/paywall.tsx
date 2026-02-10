import React, { useEffect, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/ctx/SubscriptionContext';

export default function PaywallScreen() {
  const router = useRouter();
  const {
    offerings,
    purchasePackage,
    restorePurchases,
    isLoading,
    isPro,
  } = useSubscription();

  const [isPurchasing, setIsPurchasing] = useState(false);

  // 🚫 If user already Pro, leave paywall immediately
  useEffect(() => {
    if (!isLoading && isPro) {
      router.back();
    }
  }, [isLoading, isPro]);

  const handlePurchase = async (pkg: any) => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    const success = await purchasePackage(pkg);
    setIsPurchasing(false);

    if (success) {
      Alert.alert(
        'Welcome to Pro 🎉',
        'You now have full access to all premium features.'
      );
      router.back();
    }
  };

  const handleRestore = async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    const success = await restorePurchases();
    setIsPurchasing(false);

    if (success) {
      Alert.alert('Restored', 'Your Pro access has been restored.');
      router.back();
    } else {
      Alert.alert(
        'No Purchases Found',
        'We could not find an active subscription for this account.'
      );
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  const availablePackages = offerings?.availablePackages ?? [];

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10 mb-6"
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>

          <View className="mb-3 self-start rounded-full border border-amber-400/30 bg-amber-400/20 px-3 py-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Premium Access
            </Text>
          </View>

          <Text className="text-4xl font-bold text-white leading-tight">
            Unlock Your Full{'\n'}Potential
          </Text>

          <Text className="mt-4 text-slate-400 text-lg">
            Get unlimited access to your AI coach and advanced productivity tools.
          </Text>
        </View>

        {/* Features */}
        <View className="px-6 mb-10">
          <FeatureItem icon="mic" title="Voice Mode" desc="Talk naturally, hands-free." />
          <FeatureItem icon="call" title="Direct AI Calls" desc="Instant guidance anytime." />
          <FeatureItem icon="hammer" title="Custom Coaches" desc="Unlimited specialized coaches." />
          <FeatureItem icon="infinite" title="Unlimited History" desc="Never lose context." />
        </View>

        {/* Plans */}
        <View className="px-6">
          {availablePackages.length > 0 ? (
            availablePackages.map((pkg) => {
              const isAnnual = pkg.packageType === 'ANNUAL';

              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => handlePurchase(pkg)}
                  disabled={isPurchasing}
                  className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-xl font-semibold text-white">
                        {isAnnual ? 'Yearly' : 'Monthly'}
                      </Text>
                      <Text className="mt-1 text-slate-400">
                        {pkg.product.priceString}
                        {isAnnual ? ' / year' : ' / month'}
                      </Text>
                    </View>

                    {isAnnual && (
                      <View className="rounded-full bg-amber-400 px-3 py-1">
                        <Text className="text-[10px] font-bold uppercase text-slate-900">
                          Best Value
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View className="rounded-3xl border border-white/10 bg-white/5 p-6 items-center">
              <Text className="text-slate-400 text-center">
                No plans available right now. Please try again later.
              </Text>
            </View>
          )}

          {/* Restore */}
          <Pressable onPress={handleRestore} className="mt-6 py-2">
            <Text className="text-center font-medium text-slate-500">
              Restore Purchases
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isPurchasing && (
        <View className="absolute inset-0 bg-slate-950/80 items-center justify-center">
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      )}
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <View className="mb-6 flex-row items-start">
      <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
        <Ionicons name={icon} size={20} color="#fbbf24" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="mt-0.5 text-sm text-slate-500">{desc}</Text>
      </View>
    </View>
  );
}
