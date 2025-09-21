/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ai } from '../_shared/gemini.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Modality } from "https://esm.sh/@google/genai@1.10.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { base64ImageData, mimeType, prompt, brandPersona, lang } = await req.json();

    const fullPrompt = lang === 'ar'
        ? `قم بتعديل هذه الصورة بناءً على الطلب التالي: "${prompt}". تذكر أن شخصية علامتنا التجارية هي: "${brandPersona}".`
        : `Edit this image based on the following prompt: "${prompt}". Keep in mind our brand persona is: "${brandPersona}".`;

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: fullPrompt };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let editedImageBase64 = '';
    let text = null;

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            editedImageBase64 = part.inlineData.data;
        } else if (part.text) {
            text = part.text;
        }
    }

    if (!editedImageBase64) {
      throw new Error("The model did not return an edited image.");
    }

    return new Response(JSON.stringify({ editedImageBase64, text }), {
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