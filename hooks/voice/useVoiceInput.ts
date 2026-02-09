import { useCallback, useEffect, useState } from 'react'
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { VoiceInputState } from '@/lib/voice/types'

type UseVoiceInputOptions = {
  onError?: (message: string) => void
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [state, setState] = useState<VoiceInputState>('idle')
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(recorder)

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    }).catch(() => {})
  }, [])

  const start = useCallback(async () => {
    setState('requesting-permission')
    const perms = await AudioModule.requestRecordingPermissionsAsync()

    if (!perms.granted) {
      const message = 'Microphone permission is required.'
      setError(message)
      setState('error')
      options.onError?.(message)
      return
    }

    setError(null)
    setAudioUri(null)
    setState('recording')

    await recorder.prepareToRecordAsync()
    recorder.record()
  }, [options, recorder])

  const stop = useCallback(async () => {
    if (!recorderState.isRecording) return
    setState('processing')
    await recorder.stop()
    const uri = (recorderState as any).url || null
    setAudioUri(uri)
    setState('idle')
  }, [recorder, recorderState.isRecording])

  const reset = useCallback(() => {
    setAudioUri(null)
    setError(null)
    setState('idle')
  }, [])

  return {
    state,
    audioUri,
    error,
    start,
    stop,
    reset,
    isRecording: recorderState.isRecording,
  }
}
