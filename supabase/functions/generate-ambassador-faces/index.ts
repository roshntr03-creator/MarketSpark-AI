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
    const { description, brandPersona, lang } = await req.json();

    const prompt = lang === 'ar'
        ? `صورة وجه واقعية عالية الجودة لسفير علامة تجارية افتراضي تم وصفه بأنه: "${description}". يجب أن تكون الصورة أمامية، بإضاءة احترافية، وخلفية محايدة. يجب أن يعكس الوجه شخصية العلامة التجارية: "${brandPersona}".`
        : `A high-quality, photorealistic headshot of a virtual brand ambassador described as: "${description}". The portrait should be front-facing, with professional studio lighting and a neutral background. The face should reflect the brand persona: "${brandPersona}".`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 4,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        }
    });
    
    const faces = response.generatedImages.map(img => img.image.imageBytes);

    return new Response(JSON.stringify({ faces }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});