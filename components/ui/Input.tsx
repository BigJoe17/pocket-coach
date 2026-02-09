import { TextInput, View, Text, TextInputProps } from 'react-native';
// 
interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
    return (
        <View className={`w-full gap-1.5 ${containerClassName || ''}`}>
            {label && (
                <Text className="text-sm font-medium text-text-secondary ml-1">
                    {label}
                </Text>
            )}
            <TextInput
                className={`w-full bg-surface border border-border rounded-2xl px-4 py-3.5 text-text-primary text-base focus:border-primary focus:bg-white placeholder:text-text-tertiary ${error ? 'border-danger bg-red-50/10' : ''} ${className || ''}`}
                placeholderTextColor="#94a3b8"
                {...props}
            />
            {error && (
                <Text className="text-xs text-danger ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
}
