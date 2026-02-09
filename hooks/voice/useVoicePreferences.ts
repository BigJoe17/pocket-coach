import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const VOICE_INPUT_KEY = 'voice_input_enabled'
const VOICE_CALL_KEY = 'voice_call_enabled'

export function useVoicePreferences() {
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true)
  const [callEnabled, setCallEnabled] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(VOICE_INPUT_KEY).then(value => {
      if (value === null) return
      setVoiceInputEnabled(value === 'true')
    })
    AsyncStorage.getItem(VOICE_CALL_KEY).then(value => {
      if (value === null) return
      setCallEnabled(value === 'true')
    })
  }, [])

  const updateVoiceInput = useCallback(async (enabled: boolean) => {
    setVoiceInputEnabled(enabled)
    await AsyncStorage.setItem(VOICE_INPUT_KEY, String(enabled))
  }, [])

  const updateCall = useCallback(async (enabled: boolean) => {
    setCallEnabled(enabled)
    await AsyncStorage.setItem(VOICE_CALL_KEY, String(enabled))
  }, [])

  return {
    voiceInputEnabled,
    callEnabled,
    setVoiceInputEnabled: updateVoiceInput,
    setCallEnabled: updateCall,
  }
}
