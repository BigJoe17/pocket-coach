import { View } from 'react-native';

export function BackgroundCircles() {
    return (
        <>
            <View className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-teal-200/70" />
            <View className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-sky-200/60" />
            <View className="absolute -bottom-28 right-6 h-72 w-72 rounded-full bg-amber-200/60" />
        </>
    );
}
