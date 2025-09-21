/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.10.0";
// FIX: Use Node.js compatibility layer to access environment variables, resolving the Deno type error.
import process from "https://deno.land/std@0.168.0/node/process.ts";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

export const ai = new GoogleGenAI({ apiKey });