import { supabase } from '@/lib/supabase';

export type Coach = {
    id: string;
    name: string;
    subtitle: string;
    tone: string;
    emoji: string;
    color: string;
    isCustom?: boolean;
    systemPrompt?: string;
    voiceId?: string;
    memorySettings?: {
        longTerm: boolean;
        sessionBased: boolean;
    };
    toneLabel?: string;
    colorAccent?: string;
};

export const DEFAULT_COACHES: Coach[] = [
    {
        id: 'focus',
        name: 'The Director',
        subtitle: 'Cut through the noise',
        tone: 'Direct, action-focused',
        emoji: '🎯',
        color: 'indigo',
        memorySettings: { longTerm: true, sessionBased: false }
    },
    {
        id: 'energy',
        name: 'The Hypeman',
        subtitle: 'Bring the energy',
        tone: 'High-energy, motivating',
        emoji: '🔥',
        color: 'orange',
        memorySettings: { longTerm: true, sessionBased: false }
    },
    {
        id: 'clarity',
        name: 'The Guide',
        subtitle: 'Find your clarity',
        tone: 'Thoughtful, reflective',
        emoji: '🧭',
        color: 'emerald',
        memorySettings: { longTerm: true, sessionBased: false }
    },
];

export async function getCoaches(id?: string): Promise<Coach[]> {
    try {
        let query = supabase
            .from('custom_coaches')
            .select('*');

        if (id) {
            // Check if it's a default coach first
            const def = DEFAULT_COACHES.find(c => c.id === id);
            if (def) return [def];
            query = query.eq('id', id);
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data: customCoaches, error } = await query;

        if (error) {
            console.error('Error fetching custom coaches:', error);
            return DEFAULT_COACHES;
        }

        const formattedCustomCoaches: Coach[] = customCoaches.map((c: any) => ({
            id: c.id,
            name: c.name,
            subtitle: c.subtitle,
            tone: c.tone || 'Unique',
            emoji: c.emoji,
            color: c.color_accent || 'zinc',
            isCustom: true,
            systemPrompt: c.system_prompt,
            voiceId: c.voice_id,
            memorySettings: {
                longTerm: c.memory_settings?.long_term ?? true,
                sessionBased: c.memory_settings?.session_based ?? false
            },
            toneLabel: c.tone_label
        }));

        return id ? formattedCustomCoaches : [...DEFAULT_COACHES, ...formattedCustomCoaches];
    } catch (e) {
        console.error('Failed to load coaches', e);
        return DEFAULT_COACHES;
    }
}

export async function saveCustomCoach(coach: Coach): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('custom_coaches')
            .insert({
                user_id: user.id,
                name: coach.name,
                subtitle: coach.subtitle,
                tone: coach.tone,
                emoji: coach.emoji,
                system_prompt: coach.systemPrompt,
                voice_id: coach.voiceId,
                memory_settings: {
                    long_term: coach.memorySettings?.longTerm,
                    session_based: coach.memorySettings?.sessionBased
                },
                tone_label: coach.toneLabel,
                color_accent: coach.color
            });

        if (error) throw error;
    } catch (e) {
        console.error('Failed to save coach', e);
        throw e;
    }
}

export async function deleteCustomCoach(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('custom_coaches')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (e) {
        console.error('Failed to delete coach', e);
        throw e;
    }
}
