import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        handleAuthCallback();
    }, []);

    async function handleAuthCallback() {
        try {
            // Get the token from the URL params
            const { access_token, refresh_token } = params as { access_token?: string; refresh_token?: string };

            if (access_token && refresh_token) {
                // Set the session with the tokens from the email link
                const { error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (error) throw error;

                // Successfully verified - redirect to main app
                router.replace('/(core)/home');
            } else {
                // No tokens found, redirect to login
                router.replace('/(auth)/login');
            }
        } catch (error) {
            console.error('Auth callback error:', error);
            router.replace('/(auth)/login');
        }
    }

    return (
        <View className="flex-1 bg-slate-950 justify-center items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-4 text-white text-base">Verifying your email...</Text>
        </View>
    );
}
