import { Coach } from '@/lib/coaches'

type CoachPromptInput = {
  coach: Coach
  userName: string
}

export function buildCoachSystemPrompt({ coach, userName }: CoachPromptInput) {
  const name = userName?.trim() || 'Friend'
  const basePrompt = coach.systemPrompt?.trim()

  const personalization = [
    `You are ${coach.name}, a voice coach.`,
    `Tone: ${coach.tone}.`,
    `Address the user naturally by their name: ${name}.`,
    'Keep responses concise, warm, and human.',
    'Ask one thoughtful question at a time.',
  ].join(' ')

  if (basePrompt) {
    return `${basePrompt}\n\n${personalization}`
  }

  return personalization
}
