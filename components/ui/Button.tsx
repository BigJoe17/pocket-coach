import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    className?: string;
    disabled?: boolean;
}

export function Button({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    className,
    disabled = false
}: ButtonProps) {

    const baseStyles = "rounded-2xl items-center justify-center flex-row";

    const variants = {
        primary: "bg-primary active:bg-teal-700 shadow-lg shadow-teal-200/60",
        secondary: "bg-slate-200 active:bg-slate-300",
        outline: "border border-border bg-white active:bg-slate-50",
        ghost: "bg-transparent active:bg-slate-100",
    };

    const textVariants = {
        primary: "text-white font-semibold",
        secondary: "text-text-primary font-medium",
        outline: "text-text-primary font-medium",
        ghost: "text-primary font-medium",
    };

    const sizes = {
        sm: "px-4 py-2",
        md: "px-6 py-3.5",
        lg: "px-8 py-4",
    };

    const textSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                (disabled || loading) && "opacity-50",
                className
            )}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#0ea5a4'} size="small" />
            ) : (
                <Text className={cn(textVariants[variant], textSizes[size])}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}
