
import { IS_EXPO_GO, expoGoWarning } from '@/lib/env';

type VapiEvent =
  | 'call-start'
  | 'call-end'
  | 'speech-start'
  | 'speech-end'
  | 'message'
  | 'error'

export type VapiStartCallParams = {
  assistantId?: string
  assistant?: {
    name?: string
    model?: {
      provider?: string
      model?: string
      systemPrompt?: string
    }
    voice?: {
      provider?: string
      voiceId?: string
    }
  }
  metadata?: Record<string, string>
}

export class VapiService {
  private vapi: any = null
  private active = false

  constructor(publicKey: string) {
    if (IS_EXPO_GO) {
      expoGoWarning("Vapi Voice Service");
      return;
    }

    if (publicKey) {
      try {
        const Vapi = require('@vapi-ai/react-native').default;
        this.vapi = new Vapi(publicKey);
      } catch (e) {
        console.error("Failed to load Vapi native module", e);
      }
    }
  }

  isReady() {
    return !!this.vapi
  }

  isActive() {
    return this.active
  }

  async startCall(params: VapiStartCallParams) {
    if (IS_EXPO_GO) {
      expoGoWarning("Voice Calling");
      return;
    }

    if (!this.vapi) {
      throw new Error('Vapi not configured or failed to load');
    }

    this.active = true

    if (params.assistantId) {
      return this.vapi.start(params.assistantId)
    }

    return this.vapi.start({
      assistant: params.assistant,
      metadata: params.metadata,
    } as any)
  }

  stopCall() {
    if (!this.vapi) return
    this.active = false
    this.vapi.stop()
  }

  on(event: VapiEvent, handler: (...args: any[]) => void) {
    this.vapi?.on(event, handler)
  }

  off(event: VapiEvent, handler: (...args: any[]) => void) {
    this.vapi?.off(event, handler)
  }
}
