/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ai } from '../_shared/gemini.ts';
import { corsHeaders } from '../_shared/cors.ts';
import process from "https://deno.land/std@0.168.0/node/process.ts";
import { encode } from "https://deno.land/std@0.204.0/encoding/base64.ts";

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { operation } = await req.json();

        const updatedOperation = await ai.operations.getVideosOperation({ operation });

        if (updatedOperation.done && updatedOperation.response?.generatedVideos?.[0]?.video?.uri) {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                throw new Error("API_KEY environment variable not set on server.");
            }
            
            const originalUri = updatedOperation.response.generatedVideos[0].video.uri;

            // Prevent re-processing if the URI is already a data URI
            if (!originalUri.startsWith('data:')) {
                // Fetch video from Google's URI
                const videoResponse = await fetch(`${originalUri}&key=${apiKey}`);
                if (!videoResponse.ok) {
                    throw new Error(`Failed to fetch generated video from Google: ${videoResponse.status} ${videoResponse.statusText}`);
                }

                // Convert to base64 data URI
                const videoArrayBuffer = await videoResponse.arrayBuffer();
                const videoBase64 = encode(videoArrayBuffer);
                const videoMimeType = videoResponse.headers.get('Content-Type') || 'video/mp4';

                // Replace the URI in the operation object with the data URI
                updatedOperation.response.generatedVideos[0].video.uri = `data:${videoMimeType};base64,${videoBase64}`;
            }
        }


        return new Response(JSON.stringify(updatedOperation), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
