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
        strategyName: { type: Type.STRING },
        overallGoal: { type: Type.STRING },
        contentPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    format: { type: Type.STRING },
                    contentIdea: { type: Type.STRING },
                    suggestedTime: { type: Type.STRING },
                }
            }
        }
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { details, brandPersona, lang } = await req.json();
    
    const prompt = lang === 'ar'
        ? `أنشئ استراتيجية محتوى مفصلة بناءً على التفاصيل التالية:
           الهدف الأساسي: ${details.goal}
           مدة الحملة: ${details.duration}
           الجمهور: ${details.audience}
           الكلمات الرئيسية: ${details.keywords}
           شخصية علامتنا التجارية هي: "${brandPersona}".
           يجب أن تتضمن الخطة مهامًا يومية مع أفكار للمحتوى، والمنصة، والتنسيق، والوقت المقترح للنشر.`
        : `Generate a detailed content strategy based on the following details:
           Primary Goal: ${details.goal}
           Duration: ${details.duration}
           Audience: ${details.audience}
           Keywords: ${details.keywords}
           Our brand persona is: "${brandPersona}".
           The plan should include day-by-day tasks with content ideas, platform, format, and suggested posting time.`;

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