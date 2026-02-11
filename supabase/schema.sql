-- Core AI Experience Schema

-- Conversations: Tracks individual sessions with coaches
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    coach_id TEXT NOT NULL, -- Supports both DEFAULT_COACHES IDs and custom coach UUIDs
    summary TEXT, -- AI-generated periodic summary
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages: Persistent chat history
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards: Insights derived from conversations
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'review', 'mastered')),
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update Custom Coaches: Add advanced configuration fields
ALTER TABLE public.custom_coaches 
ADD COLUMN IF NOT EXISTS voice_id TEXT,
ADD COLUMN IF NOT EXISTS memory_settings JSONB DEFAULT '{"long_term": true, "session_based": false}'::jsonb,
ADD COLUMN IF NOT EXISTS tone_label TEXT,
ADD COLUMN IF NOT EXISTS color_accent TEXT;

-- RLS Policies (Basic examples, should be refined based on requirements)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations" 
ON public.conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in their conversations" 
ON public.messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their own flashcards" 
ON public.flashcards FOR ALL USING (auth.uid() = user_id);
