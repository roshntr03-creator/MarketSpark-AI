/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
// This function has been repurposed to be a secure video download proxy.
declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    try {
        const { uri } = await req.json();
        if (!uri) {
            throw new Error("Missing 'uri' parameter.");
        }

        const apiKey = Deno.env.get("API_KEY");
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set on server.");
        }
        
        // Fetch the video from Google's temporary URL using the secret API key
        const videoResponse = await fetch(`${uri}&key=${apiKey}`);
        if (!videoResponse.ok || !videoResponse.body) {
            throw new Error(`Failed to fetch video from Google: ${videoResponse.status} ${videoResponse.statusText}`);
        }

        // Stream the video file directly back to the client as the response body
        return new Response(videoResponse.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
                'Content-Length': videoResponse.headers.get('Content-Length') || '',
            },
            status: 200,
        });

    } catch (error) {
        console.error("Error in download-video-proxy:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});