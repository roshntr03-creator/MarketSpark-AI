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
        ? `صورة واقعية عالية الجودة لكامل الجسم لسفير علامة تجارية افتراضي تم وصفه بأنه: "${description}". يجب أن يكون الشخص واقفًا في استوديو بسيط ومضاء جيدًا بخلفية رمادية محايدة. يجب أن ينظر مباشرة إلى الكاميرا بتعبير واثق وودود. يجب أن تكون ملابسه عصرية وأنيقة ولكنها بسيطة وغير مشتتة. يجب أن يعكس المظهر العام شخصية العلامة التجارية: "${brandPersona}".`
        : `A high-quality, photorealistic, full-body portrait of a virtual brand ambassador described as: "${description}". The person should be standing in a well-lit, minimalist studio with a neutral grey background. They should be looking directly at the camera with a confident and friendly expression. Their clothing should be modern, stylish, yet simple and not distracting. The overall look should reflect the brand persona: "${brandPersona}".`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 4,
            outputMimeType: 'image/png',
            aspectRatio: '9:16',
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