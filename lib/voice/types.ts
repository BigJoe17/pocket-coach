export type InteractionMode = 'chat' | 'voice-input' | 'call'

export type CallState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'ended'
  | 'error'

export type VoiceInputState =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'processing'
  | 'error'
