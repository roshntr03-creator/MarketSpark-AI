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

        // Updated prompt to be more specific and firm about the audio requirement.
        const fullPrompt = lang === 'ar'
            ? `أنشئ فيديو ترويجي قصير. الموضوع الأساسي هو: "${prompt}". يجب أن يحتوي الفيديو على موسيقى تصويرية آلية مبهجة وحيوية مناسبة للترويج لمنتج. الصوت ضروري للغاية لهذا الفيديو. يجب أن يتوافق النمط المرئي مع شخصية علامتنا التجارية: "${brandPersona}".`
            : `Generate a short promotional video. The core subject is: "${prompt}". The video must have an uplifting and energetic instrumental soundtrack suitable for a product promotion. Audio is absolutely essential for this video. The visual style should align with our brand persona: "${brandPersona}".`;

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
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});