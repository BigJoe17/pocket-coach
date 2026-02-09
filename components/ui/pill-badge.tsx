import { View, Text } from 'react-native';

interface PillBadgeProps {
    children: string;
    variant?: 'neutral' | 'accent' | 'primary';
    className?: string;
}

export function PillBadge({ children, variant = 'neutral', className = '' }: PillBadgeProps) {
    const getStyles = () => {
        switch (variant) {
            case 'primary':
                return { container: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' };
            case 'accent':
                return { container: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300' };
            default:
                return { container: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' };
        }
    };

    const styles = getStyles();

    return (
        <View className={`rounded-full px-3 py-1 ${styles.container} ${className}`}>
            <Text className={`text-xs font-semibold ${styles.text}`}>{children}</Text>
        </View>
    );
}
