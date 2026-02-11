import { StatusBar } from 'expo-status-bar';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    style?: ViewStyle | ViewStyle[];
    bg?: string;
}

/**
 * ScreenWrapper provides a consistent layout with safe area handling.
 * It uses both style and className for maximum compatibility with NativeWind.
 */
export function ScreenWrapper({
    children,
    className = '',
    style,
    bg = 'bg-background'
}: ScreenWrapperProps) {
    return (
        <SafeAreaView
            style={[{ flex: 1 }, style]}
            className={`flex-1 ${bg}`}
        >
            <StatusBar style="auto" />
            <View
                style={{ flex: 1 }}
                className={`px-6 pt-4 ${className}`}
            >
                {children}
            </View>
        </SafeAreaView>
    );
}
