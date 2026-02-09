import { Text, TextProps } from 'react-native';

interface SectionHeaderProps extends TextProps {
    children: string;
    className?: string;
}

export function SectionHeader({ children, className = '', ...props }: SectionHeaderProps) {
    return (
        <Text
            className={`text-xs font-semibold uppercase tracking-[3px] text-emerald-700 dark:text-emerald-400 ${className}`}
            {...props}
        >
            {children}
        </Text>
    );
}
