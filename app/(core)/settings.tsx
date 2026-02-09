import { View, Text, Switch } from 'react-native'
import { ScreenWrapper } from '@/components/ui/ScreenWrapper'
import { useVoicePreferences } from '@/hooks/voice/useVoicePreferences'

export default function SettingsScreen() {
  const {
    voiceInputEnabled,
    callEnabled,
    setVoiceInputEnabled,
    setCallEnabled,
  } = useVoicePreferences()

  return (
    <ScreenWrapper className="bg-background">
      <View className="mt-4">
        <Text className="text-2xl font-semibold text-text-primary">Settings</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Control how you interact with your coach.
        </Text>
      </View>

      <View className="mt-8 gap-4">
        <View className="rounded-2xl bg-white border border-border p-5 flex-row items-center justify-between">
          <View className="pr-6">
            <Text className="text-base font-semibold text-text-primary">
              Voice input
            </Text>
            <Text className="text-xs text-text-tertiary mt-1">
              Hold to record and convert to text.
            </Text>
          </View>
          <Switch
            value={voiceInputEnabled}
            onValueChange={setVoiceInputEnabled}
          />
        </View>

        <View className="rounded-2xl bg-white border border-border p-5 flex-row items-center justify-between">
          <View className="pr-6">
            <Text className="text-base font-semibold text-text-primary">
              Coach calls
            </Text>
            <Text className="text-xs text-text-tertiary mt-1">
              Enable voice-to-voice calls with your coach.
            </Text>
          </View>
          <Switch value={callEnabled} onValueChange={setCallEnabled} />
        </View>
      </View>
    </ScreenWrapper>
  )
}
