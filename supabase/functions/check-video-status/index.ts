/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ai } from '../_shared/gemini.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { operation } = await req.json();

        // This function now ONLY polls the operation status from the Gemini API.
        // It does not handle any file downloading or uploading to prevent server timeouts.
        const updatedOperation = await ai.operations.getVideosOperation({ operation });

        return new Response(JSON.stringify(updatedOperation), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error("Error in check-video-status:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});