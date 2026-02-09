import { supabase } from '@/lib/supabase';

export type Coach = {
    id: string;
    name: string;
    subtitle: string;
    tone: string;
    emoji: string;
    color: string;
    isCustom?: boolean;
    systemPrompt?: string; // For custom coaches
};

export const DEFAULT_COACHES: Coach[] = [
    {
        id: 'focus',
        name: 'The Director',
        subtitle: 'Cut through the noise',
        tone: 'Direct, action-focused',
        emoji: '🎯',
        color: 'indigo'
    },
    {
        id: 'energy',
        name: 'The Hypeman',
        subtitle: 'Bring the energy',
        tone: 'High-energy, motivating',
        emoji: '🔥',
        color: 'orange'
    },
    {
        id: 'clarity',
        name: 'The Guide',
        subtitle: 'Find your clarity',
        tone: 'Thoughtful, reflective',
        emoji: '🧭',
        color: 'emerald'
    },
];

export async function getCoaches(): Promise<Coach[]> {
    try {
        const { data: customCoaches, error } = await supabase
            .from('custom_coaches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching custom coaches:', error);
            // Return defaults on error to not break the app
            return DEFAULT_COACHES;
        }

        const formattedCustomCoaches: Coach[] = customCoaches.map((c: any) => ({
            id: c.id,
            name: c.name,
            subtitle: c.subtitle,
            tone: c.tone || 'Unique', // Default if missing
            emoji: c.emoji,
            color: 'zinc', // Default color for custom
            isCustom: true,
            systemPrompt: c.system_prompt
        }));

        return [...DEFAULT_COACHES, ...formattedCustomCoaches];
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
                system_prompt: coach.systemPrompt
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
