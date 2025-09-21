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
        campaign: {
            type: Type.OBJECT,
            properties: {
                productName: { type: Type.STRING },
                tagline: { type: Type.STRING },
                keyMessages: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                targetAudience: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        demographics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                },
                channels: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            contentIdea: { type: Type.STRING }
                        }
                    }
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
    const { product, brandPersona, lang } = await req.json();
    
    const prompt = lang === 'ar'
        ? `أنشئ حملة تسويقية شاملة للمنتج التالي:
           الاسم: ${product.name}
           الوصف: ${product.description}
           الجمهور المستهدف: ${product.targetAudience}
           شخصية العلامة التجارية لدينا هي: "${brandPersona}".
           قم بتضمين: شعار، رسائل رئيسية، تحليل للجمهور المستهدف، واقتراحات للقنوات مع أفكار للمحتوى.`
        : `Generate a comprehensive marketing campaign for the following product:
           Name: ${product.name}
           Description: ${product.description}
           Target Audience: ${product.targetAudience}
           Our brand persona is: "${brandPersona}".
           Include: a tagline, key messages, target audience analysis, and channel suggestions with content ideas.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema,
        }
    });

    const data = JSON.parse(response.text);
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