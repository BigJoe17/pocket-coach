export const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY
export const VAPI_DEFAULT_ASSISTANT_ID =
  process.env.EXPO_PUBLIC_VAPI_ASSISTANT_ID

export const VAPI_WEBHOOK_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/vapi-webhook`
  : undefined