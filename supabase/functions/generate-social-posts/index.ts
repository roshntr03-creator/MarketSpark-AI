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
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            platform: { type: Type.STRING },
            content: { type: Type.STRING },
            hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            predictedEngagement: {
                type: Type.STRING,
                enum: ['High', 'Medium', 'Low']
            }
        }
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { topic, platform, tone, brandPersona, lang } = await req.json();

    const prompt = lang === 'ar'
        ? `أنشئ 3 منشورات لوسائل التواصل الاجتماعي حول الموضوع التالي: "${topic}".
           المنصة المستهدفة: ${platform}
           النبرة المطلوبة: ${tone}
           شخصية العلامة التجارية لدينا هي: "${brandPersona}".
           يجب أن يتضمن كل منشور محتوى، وهاشتاجات ذات صلة، وتقييمًا للتفاعل المتوقع (مرتفع، متوسط، منخفض).`
        : `Generate 3 social media posts about the following topic: "${topic}".
           Target Platform: ${platform}
           Desired Tone: ${tone}
           Our brand persona is: "${brandPersona}".
           Each post should include content, relevant hashtags, and a predicted engagement rating (High, Medium, or Low).`;
    
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