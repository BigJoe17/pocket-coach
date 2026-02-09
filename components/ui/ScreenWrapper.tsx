import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    style?: any;
}

export function ScreenWrapper({ children, className, style }: ScreenWrapperProps) {
    return (
        <SafeAreaView className={`flex-1 bg-background ${className || ''}`} style={style}>
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 px-6 pt-4">
                {children}
            </View>
        </SafeAreaView>
    );
}
