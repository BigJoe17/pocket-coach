import { useCallback, useEffect, useMemo, useState } from 'react'
import { Coach } from '@/lib/coaches'
import { buildCoachSystemPrompt } from '@/lib/voice/coachPrompt'
import { CallState } from '@/lib/voice/types'
import {
  VAPI_DEFAULT_ASSISTANT_ID,
  VAPI_DEFAULT_VOICE_ID,
  VAPI_DEFAULT_VOICE_PROVIDER,
  VAPI_PUBLIC_KEY,
  VAPI_WEBHOOK_URL,
} from '@/lib/vapi/config'
import { VapiService } from '@/lib/vapi/VapiService'

type UseVoiceCallOptions = {
  coach: Coach
  userName: string
  userId?: string
  onError?: (message: string) => void
}

export function useVoiceCall({ coach, userName, userId, onError }: UseVoiceCallOptions) {
  const [state, setState] = useState<CallState>('idle')
  const [error, setError] = useState<string | null>(null)

  const service = useMemo(() => new VapiService(VAPI_PUBLIC_KEY), [])

  useEffect(() => {
    const handleCallStart = () => setState('listening')
    const handleCallEnd = () => setState('ended')
    const handleSpeechStart = () => setState('speaking')
    const handleSpeechEnd = () => setState('listening')
    const handleError = (err: any) => {
      const message = err?.message || 'Call failed'
      setError(message)
      setState('error')
      onError?.(message)
    }

    service.on('call-start', handleCallStart)
    service.on('call-end', handleCallEnd)
    service.on('speech-start', handleSpeechStart)
    service.on('speech-end', handleSpeechEnd)
    service.on('error', handleError)

    return () => {
      service.off('call-start', handleCallStart)
      service.off('call-end', handleCallEnd)
      service.off('speech-start', handleSpeechStart)
      service.off('speech-end', handleSpeechEnd)
      service.off('error', handleError)
    }
  }, [onError, service])

  const startCall = useCallback(async () => {
    if (!service.isReady()) {
      const message = 'Vapi is not configured.'
      setError(message)
      setState('error')
      onError?.(message)
      return
    }

    try {
      setError(null)
      setState('connecting')

      const systemPrompt = buildCoachSystemPrompt({ coach, userName })

      await service.startCall({
        assistantId: VAPI_DEFAULT_ASSISTANT_ID || undefined,
        assistant: VAPI_DEFAULT_ASSISTANT_ID
          ? undefined
          : {
            name: coach.name,
            model: {
              provider: 'openai',
              model: 'gpt-4o-mini',
              systemPrompt,
            },
            voice: VAPI_DEFAULT_VOICE_ID
              ? {
                provider: VAPI_DEFAULT_VOICE_PROVIDER || '11labs',
                voiceId: VAPI_DEFAULT_VOICE_ID,
              }
              : undefined,
          },
        metadata: {
          coachId: coach.id,
          userName,
          userId,
        },
        serverUrl: VAPI_WEBHOOK_URL,
      })
    } catch (err: any) {
      const message = err?.message || 'Call failed'
      setError(message)
      setState('error')
      onError?.(message)
    }
  }, [coach, onError, service, userName, userId])

  const endCall = useCallback(() => {
    service.stopCall()
    setState('ended')
  }, [service])

  return {
    state,
    error,
    startCall,
    endCall,
  }
}
