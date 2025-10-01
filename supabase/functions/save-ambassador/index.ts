/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decode } from "https://deno.land/std@0.204.0/encoding/base64.ts";
import { corsHeaders } from '../_shared/cors.ts';

declare const Deno: any;

const getSupabaseAdminClient = () => {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
};

const getSupabaseUserClient = (req: Request) => {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const userClient = getSupabaseUserClient(req);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { ambassadorData } = await req.json();
    const { faceImageBase64, ...profileData } = ambassadorData;

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Upload image to storage
    const imageBuffer = decode(faceImageBase64);
    const filePath = `${user.id}/ambassador_${Date.now()}.png`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('ambassador_faces')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 2. Get public URL for the image
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('ambassador_faces')
      .getPublicUrl(filePath);

    if (!publicUrl) throw new Error("Could not get public URL for the uploaded image.");
      
    // 3. Insert ambassador data into the database
    const finalAmbassadorData = {
        ...profileData,
        user_id: user.id,
        face_image_url: publicUrl,
    };
      
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('ambassadors')
      .insert(finalAmbassadorData)
      .select()
      .single();

    if (dbError) throw dbError;
      
    // Map snake_case from DB to camelCase for the client
    const clientResponse = {
        id: dbData.id,
        userId: dbData.user_id,
        name: dbData.name,
        backstory: dbData.backstory,
        communicationStyle: dbData.communication_style,
        faceImageUrl: dbData.face_image_url,
        coreDescription: dbData.core_description,
    };

    return new Response(JSON.stringify(clientResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in save-ambassador function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});