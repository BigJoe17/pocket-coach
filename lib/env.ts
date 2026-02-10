
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Detects if the app is running in the Expo Go client.
 */
export const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Helper to log warnings when a feature is disabled in Expo Go.
 */
export const expoGoWarning = (feature: string) => {
    if (IS_EXPO_GO) {
        console.warn(`[Expo Go] ${feature} is disabled. Use a development build to test this feature.`);
    }
};
