import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function OnboardingLayout() {
    return (
        <View className="flex-1 bg-[#F7F3EE] dark:bg-slate-950">
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        </View>
    );
}
