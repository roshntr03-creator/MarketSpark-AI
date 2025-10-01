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
    const { profile, content, lang } = await req.json();

    const systemInstruction = lang === 'ar'
      ? `أنت تتصرف كسفير علامة تجارية افتراضي. ملفك الشخصي هو كما يلي: ${JSON.stringify(profile)}. أعطاك المستخدم المحتوى الأولي التالي: "${content}". أعد كتابة هذا المحتوى وقدمه كما لو كنت ستقدمه في حملة تسويقية (على سبيل المثال، منشور على وسائل التواصل الاجتماعي، أو نص فيديو قصير). تجسد شخصيتك وأسلوب تواصلك وصوتك بالكامل. يجب أن يكون الناتج هو النص النهائي المصقول فقط، بدون أي تعليقات إضافية.`
      : `You are acting as an AI virtual brand ambassador. Your profile is as follows: ${JSON.stringify(profile)}. A user has given you the following rough content: "${content}". Rewrite and present this content as if you were delivering it for a marketing campaign (e.g., a social media post, a short video script). Fully embody your character, communication style, and voice. The output should be the final, polished text only, with no extra commentary.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Here is the content I need you to perform: " + content, // The actual content is passed here
        config: {
            systemInstruction,
        }
    });

    const performanceText = response.text;

    return new Response(JSON.stringify({ performanceText }), {
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