/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
declare const Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ai } from '../_shared/gemini.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Admin client to bypass RLS for storage upload
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { operation } = await req.json();

        const updatedOperation = await ai.operations.getVideosOperation({ operation });

        // If the video is ready, download it from Google, upload it to Supabase Storage,
        // and replace the temporary Google URI with a permanent public Supabase URL.
        if (updatedOperation.done && updatedOperation.response?.generatedVideos?.[0]?.video?.uri) {
            const apiKey = Deno.env.get("API_KEY");
            if (!apiKey) {
                throw new Error("API_KEY environment variable not set on server.");
            }
            
            const originalUri = updatedOperation.response.generatedVideos[0].video.uri;

            // Fetch video from Google's temporary URI
            const videoResponse = await fetch(`${originalUri}&key=${apiKey}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to fetch generated video from Google: ${videoResponse.status} ${videoResponse.statusText}`);
            }

            // Get video data as a buffer
            const videoArrayBuffer = await videoResponse.arrayBuffer();
            const videoMimeType = videoResponse.headers.get('Content-Type') || 'video/mp4';
            const filePath = `videos/${crypto.randomUUID()}.mp4`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabaseAdmin.storage
              .from('generated_creations') // Assumes a public bucket named 'generated_creations' exists
              .upload(filePath, videoArrayBuffer, {
                contentType: videoMimeType,
                upsert: false,
              });

            if (uploadError) {
                throw new Error(`Failed to upload video to storage: ${uploadError.message}`);
            }

            // Get the public URL for the newly uploaded file
            const { data: { publicUrl } } = supabaseAdmin.storage
              .from('generated_creations')
              .getPublicUrl(filePath);

            if (!publicUrl) {
                throw new Error("Could not get public URL for the uploaded video.");
            }

            // Replace the URI in the operation object with the public Supabase URL
            updatedOperation.response.generatedVideos[0].video.uri = publicUrl;
        }

        return new Response(JSON.stringify(updatedOperation), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error("Error in check-video-status:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});