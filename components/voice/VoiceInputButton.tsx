
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVoiceInput } from '@/hooks/voice/useVoiceInput'
import { IS_EXPO_GO } from '@/lib/env'

type Props = {
  onRecordingComplete?: (uri: string) => void
  disabled?: boolean
}

export function VoiceInputButton({ onRecordingComplete, disabled }: Props) {
  const { state, audioUri, start, stop, reset } = useVoiceInput({
    onError: () => { },
  })

  useEffect(() => {
    if (state === 'idle' && audioUri) {
      onRecordingComplete?.(audioUri)
      reset()
    }
  }, [audioUri, onRecordingComplete, reset, state])

  const isRecording = state === 'recording'

  // Override disabled for Expo Go
  const isDisabled = disabled || IS_EXPO_GO

  return (
    <Pressable
      onPressIn={start}
      onPressOut={stop}
      disabled={isDisabled}
      className={`h-11 w-11 rounded-full items-center justify-center transition-all ${isRecording ? 'bg-teal-600' : 'bg-slate-50'
        } ${isDisabled ? 'opacity-50' : ''}`}
    >
      {isRecording ? (
        <View className="h-3 w-3 rounded-sm bg-white" />
      ) : (
        <Ionicons
          name={IS_EXPO_GO ? "mic-off-outline" : "mic-outline"}
          size={22}
          color="#0f172a"
        />
      )}
    </Pressable>
  )
}
