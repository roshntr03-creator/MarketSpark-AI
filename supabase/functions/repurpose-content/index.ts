/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ai } from '../_shared/gemini.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Type } from "https://esm.sh/@google/genai@1.10.0";

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        twitterThread: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        instagramCarousel: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    imageIdea: { type: Type.STRING },
                    caption: { type: Type.STRING }
                }
            }
        },
        linkedInPost: { type: Type.STRING },
        videoReelScript: { type: Type.STRING },
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, brandPersona, lang } = await req.json();
    
    const prompt = lang === 'ar'
        ? `أعد استخدام المحتوى التالي في تنسيقات متعددة: "${content}".
           شخصية العلامة التجارية لدينا هي: "${brandPersona}".
           قم بإنشاء:
           1. سلسلة تغريدات على تويتر.
           2. أفكار لمنشورات انستغرام متسلسلة (carousel) (فكرة صورة وتعليق لكل شريحة).
           3. منشور احترافي على لينكد إن.
           4. نص فيديو قصير (reel).`
        : `Repurpose the following content into multiple formats: "${content}".
           Our brand persona is: "${brandPersona}".
           Generate:
           1. A Twitter thread.
           2. Ideas for an Instagram carousel (image idea and caption for each slide).
           3. A professional LinkedIn post.
           4. A short video reel script.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        }
    });

    const data = JSON.parse(response.text);

    return new Response(JSON.stringify(data), {
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