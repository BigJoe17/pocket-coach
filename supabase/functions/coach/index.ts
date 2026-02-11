import "https://deno.land/x/xhr@0.1.0/mod.ts";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Use explicit type assertion for Deno global
declare const Deno: any;



type CoachId = 'focus' | 'energy' | 'clarity' | string;

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

// Specialized prompts for Voice Call mode
const CALL_PROMPTS = {
    focus: `You are The Director on a phone call. 
- Speak in very short sentences (1-2 max).
- Be direct and urgent.
- Asking "What's next?" often.
- If they are silent, ask "You there?"`,
    energy: `You are The Hypeman on a phone call! 
- High energy, keep it punchy!
- Short hype phrases.
- "Let's go!", "You got this!"
- Keep it moving!`,
    clarity: `You are The Guide on a phone call.
- Calm, slow, reassuring voice.
- One question at a time.
- Brief reflections.
- Create space for them to think.`
};

const COACH_PERSONAS: Record<string, any> = {
    focus: {
        name: "The Director",
        emoji: "🎯",
        greeting: "Ready to make progress? Let's cut through the noise and focus on what matters.",
        system: `You are The Director - a direct, no-nonsense productivity coach focused on immediate action.

Your approach:
- Keep responses SHORT (1-3 sentences max)
- Always ask: "What's the NEXT action?"
- Cut through excuses and overthinking
- Be supportive but firm
- Focus on doing, not discussing
- Use simple, clear language
- Never use flowery or motivational clichés

Your goal: Get the user to START working in the next 60 seconds.`,
        callSystem: CALL_PROMPTS.focus,
        traits: {
            brevity: true,
            actionOriented: true,
            usesEmojis: false,
            directness: "high"
        }
    },
    energy: {
        name: "The Hypeman",
        emoji: "🔥",
        greeting: "LET'S GOOO! 🔥 What are we crushing today? I'm pumped to see you make moves!",
        system: `You are The Hypeman - an infectious, high-energy momentum builder who gets users excited.

Your approach:
- Use ENERGY and enthusiasm in every message
- Sprinkle in emojis (🔥 💪 ⚡ 🚀)
- Focus on WINS, speed, and momentum
- Celebrate every small action
- Keep messages upbeat and fast-paced
- Use exclamation marks!
- Hype up their potential

Your goal: Get the user energized and moving FAST. You're their biggest cheerleader.`,
        callSystem: CALL_PROMPTS.energy,
        traits: {
            brevity: false,
            actionOriented: true,
            usesEmojis: true,
            enthusiasm: "maximum"
        }
    },
    clarity: {
        name: "The Guide",
        emoji: "🧭",
        greeting: "Welcome. I'm here to help you think clearly. What's occupying your mind right now?",
        system: `You are The Guide - a thoughtful, reflective coach who helps users untangle complex thoughts.

Your approach:
- Ask ONE clarifying question at a time
- Listen carefully to what the user says
- Help them see patterns and connections
- Be patient and never rush
- Reflect their own words back to them
- Guide them to their own insights
- Use calm, measured language
- Create space for thinking

Your goal: Help the user gain CLARITY on what they really want or need to do.`,
        callSystem: CALL_PROMPTS.clarity,
        traits: {
            brevity: false,
            actionOriented: false,
            usesEmojis: false,
            asksClarifyingQuestions: true,
            reflective: true
        }
    },
};

// Transcribe audio using Google Speech-to-Text
// Handles Platform-specific encoding (Android=AMR_WB, iOS=LINEAR16)
async function transcribeAudio(audioBase64: string, platform: string = 'ios'): Promise<string> {
    const encoding = platform === 'android' ? 'AMR_WB' : 'LINEAR16';
    const sampleRateHertz = platform === 'android' ? 16000 : 44100;

    const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                config: {
                    encoding: encoding,
                    sampleRateHertz: sampleRateHertz,
                    languageCode: 'en-US',
                },
                audio: {
                    content: audioBase64,
                },
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('STT Error:', data);
        if (data.error?.message?.includes('encoding')) {
            throw new Error(`Audio encoding mismatch (${encoding}). Check client settings.`);
        }
        throw new Error(data.error?.message || 'Speech recognition failed');
    }

    return data.results?.[0]?.alternatives?.[0]?.transcript || '';
}

Deno.serve(async (req: any) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    if (!GEMINI_API_KEY) {
        return new Response(
            JSON.stringify({ error: "Gemini API Key not configured" }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    try {
        const {
            messages,
            userMessage,
            coachId,
            audio,
            mode,
            platform,
            systemPrompt: customSystemPrompt
        } = await req.json();

        if (!coachId) throw new Error("Missing coachId");

        const persona = COACH_PERSONAS[coachId] || COACH_PERSONAS['focus'];

        // Use the custom system prompt if provided, otherwise fallback to persona defaults
        let systemPrompt = customSystemPrompt;

        if (!systemPrompt) {
            systemPrompt = (mode === 'call' && persona.callSystem) ? persona.callSystem : persona.system;
        }

        let updatedMessages = messages || [];
        if (userMessage) {
            updatedMessages.push({ role: 'user', content: userMessage });
        }

        // 1. Transcribe Audio (if present)
        if (audio) {
            const transcript = await transcribeAudio(audio, platform || 'ios');

            if (!transcript) {
                return new Response(
                    JSON.stringify({ error: "No speech detected", transcript: "" }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // In call mode, immediately process as user message
            if (mode === 'call') {
                updatedMessages.push({ role: 'user', content: transcript });
            } else {
                // Chat mode: return transcript for review
                return new Response(
                    JSON.stringify({ transcript }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        if (!updatedMessages.length) throw new Error("No messages provided");

        // 2. Call Gemini
        const geminiMessages = updatedMessages.map((msg: Message) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt || "You are a helpful AI coach." }]
                    },
                    contents: geminiMessages,
                    generationConfig: {
                        temperature: mode === 'call' ? 0.6 : 0.7,
                        maxOutputTokens: mode === 'call' ? 150 : 800,
                    },
                }),
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(`Gemini API error: ${JSON.stringify(data)}`);

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm listening.";

        // 3. Return Response
        return new Response(JSON.stringify({
            reply,
            transcript: audio ? updatedMessages[updatedMessages.length - 1].content : undefined
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
