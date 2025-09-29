/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// deno-lint-ignore-file
// FIX: Add type declaration for the Deno global to resolve TypeScript errors.
declare const Deno: any;
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.10.0";

const apiKey = Deno.env.get("API_KEY");
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

export const ai = new GoogleGenAI({ apiKey });