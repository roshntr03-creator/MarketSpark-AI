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
    const { product, brandPersona, lang } = await req.json();
    
    const prompt = lang === 'ar'
        ? `أنشئ حملة تسويقية شاملة للمنتج المسمى "${product.name}" (الوصف: ${product.description}, الجمهور المستهدف: ${product.targetAudience}).
           شخصية علامتنا التجارية هي: "${brandPersona}".
           يجب أن يكون الرد كائن JSON واحدًا فقط يحتوي على مفتاح رئيسي "campaign". يجب أن يحتوي كائن "campaign" على: productName، tagline، keyMessages (مصفوفة من السلاسل النصية)، targetAudience (كائن يحتوي على خاصية 'description' وهي سلسلة نصية وخاصية 'demographics' يجب أن تكون مصفوفة من السلاسل النصية)، و channels (مصفوفة من الكائنات تحتوي على name و contentIdea).
           لا تقم بتغليف JSON في كتل أكواد markdown.`
        : `Generate a comprehensive marketing campaign for the product named "${product.name}" (Description: ${product.description}, Target Audience: ${product.targetAudience}).
           Our brand persona is: "${brandPersona}".
           The response must be a single JSON object with a root key "campaign". The "campaign" object should contain: productName, tagline, keyMessages (array of strings), targetAudience (an object with a 'description' string and a 'demographics' property which must be an array of strings), and channels (array of objects with name and contentIdea).
           Do not wrap the JSON in markdown code blocks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
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
