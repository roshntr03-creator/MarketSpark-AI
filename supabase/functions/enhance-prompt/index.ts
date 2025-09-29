/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ai } from '../_shared/gemini.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Type } from "https://esm.sh/@google/genai@1.10.0";

const toolEnum = [
    'campaign-generator',
    'social-post-assistant',
    'image-editor',
    'image-generator',
    'video-generator',
    'competitor-analysis',
    'content-repurposing',
    'content-strategist',
    'asset-kit-generator',
    'workflow'
];

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            promptText: { 
                type: Type.STRING,
                description: "The enhanced, detailed prompt text."
            },
            targetTool: {
                type: Type.STRING,
                enum: toolEnum,
                description: "The most appropriate tool from the list to use this prompt with."
            }
        }
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, context, lang } = await req.json();
    
    const systemInstruction = lang === 'ar'
        ? `أنت خبير في هندسة الأوامر متخصص في التسويق. مهمتك هي تحويل فكرة بسيطة إلى 3-4 أوامر مفصلة وقوية يمكن استخدامها مع أدوات الذكاء الاصطناعي التوليدية. يجب أن يكون كل أمر مقترح مصممًا خصيصًا لأداة تسويق محددة. لكل اقتراح، حدد الأداة الأنسب من القائمة: ${toolEnum.join(', ')}.`
        : `You are a prompt engineering expert specializing in marketing. Your task is to transform a simple idea into 3-4 detailed, powerful prompts for generative AI tools. Each suggested prompt should be tailored for a specific marketing tool. For each suggestion, identify the most suitable tool from this list: ${toolEnum.join(', ')}.`;

    const fullPrompt = lang === 'ar'
        ? `الفكرة الأساسية: "${prompt}". السياق الإضافي أو الهدف هو: "${context}".`
        : `The basic idea is: "${prompt}". Additional context or goal is: "${context}".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction,
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