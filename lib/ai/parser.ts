import { CoachResponse } from '@/types/coach';

/**
 * Safely parses the raw string output from the AI coach assistant.
 * Expects a structured JSON format.
 */
export function parseCoachResponse(raw: string): CoachResponse | null {
    if (!raw) return null;

    try {
        // Attempt to parse the raw string as JSON
        const parsed = JSON.parse(raw);

        // Basic validation to ensure required fields exist
        if (
            typeof parsed.response_text === 'string' &&
            typeof parsed.mood_detected === 'string' &&
            Array.isArray(parsed.action_items) &&
            Array.isArray(parsed.reflection_questions) &&
            typeof parsed.suggested_next_step === 'string'
        ) {
            return parsed as CoachResponse;
        }

        console.warn('[Parser] Parsed JSON missing required coach response fields:', parsed);
        return null;
    } catch (error) {
        console.error('[Parser] Failed to parse coach response JSON:', error);
        console.debug('[Parser] Raw output was:', raw);
        return null;
    }
}
