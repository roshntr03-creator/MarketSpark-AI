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
        name: { type: Type.STRING, description: "A fitting first and last name for the ambassador." },
        backstory: { type: Type.STRING, description: "A short, engaging backstory (2-3 sentences) for the ambassador." },
        communicationStyle: { type: Type.STRING, description: "A description of how the ambassador communicates (e.g., witty, informative, friendly)." },
        voiceDescription: { type: Type.STRING, description: "A detailed description of the ambassador's voice (e.g., tone, pitch, accent, style)." },
    }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { description, brandPersona, lang } = await req.json();
    
    const prompt = lang === 'ar'
        ? `أنشئ ملفًا شخصيًا لسفير علامة تجارية افتراضي تم وصفه بأنه: "${description}". يجب أن تتوافق الشخصية مع شخصية علامتنا التجارية: "${brandPersona}". قم بتضمين اسم مقترح، وقصة خلفية، وأسلوب تواصل، ووصف تفصيلي للصوت.`
        : `Create a profile for a virtual brand ambassador described as: "${description}". The personality should align with our brand persona: "${brandPersona}". Include a suggested name, a backstory, a communication style, and a detailed voice description.`;

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