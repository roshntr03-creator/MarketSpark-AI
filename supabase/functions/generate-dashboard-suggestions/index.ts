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
            title: { type: Type.STRING },
            tool: { type: Type.STRING },
            promptData: { type: Type.STRING }
        }
    }
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { lastCreation, lang } = await req.json();

        const prompt = lang === 'ar'
            ? `بناءً على هذا الإبداع الأخير للمستخدم (الأداة: ${lastCreation.tool}, النتيجة: ${JSON.stringify(lastCreation.result)}), اقترح 3 خطوات تالية ذكية ومنطقية يمكن للمستخدم اتخاذها. يجب أن يكون كل اقتراح عبارة عن كائن يحتوي على "title" (عنوان الإجراء المقترح)، و "tool" (معرف الأداة من القائمة: ['campaign-generator', 'social-post-assistant', 'image-editor', 'image-generator', 'video-generator', 'competitor-analysis', 'content-repurposing', 'content-strategist', 'asset-kit-generator', 'workflow'])، و "promptData" (سلسلة نصية يمكن استخدامها كمدخل أولي للأداة المقترحة). قدم ردك كـ JSON array فقط.`
            : `Based on this user's last creation (Tool: ${lastCreation.tool}, Result: ${JSON.stringify(lastCreation.result)}), suggest 3 smart, logical next steps the user could take. Each suggestion should be an object containing a "title" (the suggested action's title), a "tool" (the tool ID from this list: ['campaign-generator', 'social-post-assistant', 'image-editor', 'image-generator', 'video-generator', 'competitor-analysis', 'content-repurposing', 'content-strategist', 'asset-kit-generator', 'workflow']), and "promptData" (a string that can be used as the initial input for the suggested tool). Provide your response as a JSON array only.`;
        
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