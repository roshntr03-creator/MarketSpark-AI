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
        logoStyles: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING },
                    description: { type: Type.STRING },
                }
            }
        },
        colorPalette: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                }
            }
        },
        fontPairings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                }
            }
        },
        imageStyles: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { description, keywords, lang } = await req.json();
    
    const prompt = lang === 'ar'
        ? `أنشئ مجموعة أصول علامة تجارية كاملة لوصف العلامة التجارية التالي: "${description}". الكلمات الرئيسية للعلامة التجارية هي: "${keywords}". قم بتضمين اقتراحات للشعارات، ولوحة ألوان (مع أسماء وأكواد hex)، وأزواج خطوط، ودليل لنمط الصور.`
        : `Generate a complete brand asset kit for the following brand description: "${description}". Brand keywords are: "${keywords}". Include logo suggestions, a color palette (with names and hex codes), font pairings, and an image style guide.`;

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