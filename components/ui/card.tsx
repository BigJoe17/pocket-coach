import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
    variant?: 'elevated' | 'flat' | 'outlined';
}

export function Card({ children, className, variant = 'elevated', ...props }: CardProps) {
    const variants = {
        elevated: "bg-surface shadow-lg shadow-slate-200/60",
        flat: "bg-background",
        outlined: "bg-transparent border border-border",
    };

    return (
        <View
            className={cn("rounded-3xl p-5", variants[variant], className)}
            {...props}
        >
            {children}
        </View>
    );
}
