/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// The client is configured using a hierarchy:
// 1. Environment Variables (for production)
// 2. localStorage (for local development override)
// 3. Hardcoded Fallback (for developer convenience)
//
// WARNING: The fallback keys are for immediate development setup. For a real
// production app, you MUST use environment variables to keep your keys secure.
const DEV_FALLBACK_URL = 'https://fclpddjhkypjqbxvujnb.supabase.co';
const DEV_FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbHBkZGpoa3lwanFieHZ1am5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODg4MjcsImV4cCI6MjA3NDA2NDgyN30.4eE_tJYqhr9aRgVxXtn9vTSTIUADzn-03o5WS9yXA9k';


let supabaseUrl: string | undefined | null = null;
let supabaseAnonKey: string | undefined | null = null;

try {
    // 1. Try to get from environment variables
    if (typeof process !== 'undefined' && process.env) {
        supabaseUrl = process.env.SUPABASE_URL;
        supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    }

    // 2. Fallback to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
        if (!supabaseUrl) {
            supabaseUrl = localStorage.getItem('SUPABASE_URL');
        }
        if (!supabaseAnonKey) {
            supabaseAnonKey = localStorage.getItem('SUPABASE_ANON_KEY');
        }
    }
    
    // 3. Final fallback to development keys
    if (!supabaseUrl) {
        supabaseUrl = DEV_FALLBACK_URL;
    }
    if (!supabaseAnonKey) {
        supabaseAnonKey = DEV_FALLBACK_ANON_KEY;
    }

} catch (e) {
    console.error("Failed to read Supabase configuration:", e);
}


export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {} as any; // Provide a dummy object if not configured

/**
 * Checks if the Supabase client was successfully configured.
 * @returns {boolean} True if credentials were provided and the client is initialized.
 */
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey);
};