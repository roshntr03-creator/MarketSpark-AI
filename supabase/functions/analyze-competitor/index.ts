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
    const { url, lang } = await req.json();

    const prompt = lang === 'ar'
        ? `قم بتحليل شامل لموقع الويب هذا: ${url}. أريد تحليلاً تسويقيًا كاملاً يتضمن: اسم المنافس، ملخص التحليل، نبرة الصوت، الرسائل التسويقية الرئيسية، نقاط قوة المحتوى، نقاط ضعف المحتوى، وفرص التميز. لا تقم بتضمين أي شيء آخر في إجابتك. يجب أن يكون الرد بتنسيق JSON.`
        : `Analyze this website: ${url}. I need a full marketing analysis including: competitorName, analysisSummary, toneOfVoice, keyMarketingMessages, contentStrengths, contentWeaknesses, and differentiationOpportunities. Do not include anything else in your response. The response must be in JSON format.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const jsonText = response.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

    const data = JSON.parse(jsonText);
    data.sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
      uri: c.web?.uri || '',
      title: c.web?.title || ''
    })) || [];

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