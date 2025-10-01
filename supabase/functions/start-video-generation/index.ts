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
        const { prompt, image, brandPersona, lang } = await req.json();

        // The client now sends a highly detailed prompt (especially for UGC), 
        // so we use it directly without modification.
        const fullPrompt = prompt;

        let imagePayload;
        if (image) {
            imagePayload = {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            };
        }

        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: fullPrompt,
            image: imagePayload,
            config: {
                numberOfVideos: 1,
            },
        });

        return new Response(JSON.stringify(operation), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error("Error in start-video-generation function:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
