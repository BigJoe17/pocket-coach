import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { message } = body;

        if (message.type === 'end-of-call-report') {
            const call = message.call;

            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            const { error } = await supabase.from('call_logs').insert({
                user_id: call.customer?.number || call.metadata?.userId, // Fallback or extracting from metadata
                coach_id: call.metadata?.coachId || 'unknown',
                vapi_call_id: call.id,
                duration_seconds: Math.round(call.durationSeconds || 0), // Ensure integer
                call_start: call.startedAt,
                call_end: call.endedAt,
                status: 'completed',
                // Analysis from Vapi (summary, etc.) could be added if schema supported it
            });

            if (error) {
                console.error('Error logging call:', error);
                return new Response(JSON.stringify({ error: error.message }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500
                });
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });
    }
});
