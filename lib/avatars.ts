/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file contains the predefined avatars for the UGC Video Generator.
// In a real application, these might be fetched from a CDN or asset management system.
// Images are royalty-free from pexels.com and converted to base64.

interface Avatar {
    id: string;
    description: string;
    dataUri: string;
    base64: string; // The raw base64 string without the data URI prefix
}

const avatarData: Omit<Avatar, 'dataUri'>[] = [
    {
        id: 'avatar1',
        description: 'A friendly woman in her late 20s with brown hair, wearing a denim jacket, sitting in a cozy, well-lit home office',
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    },
    {
        id: 'avatar2',
        description: 'A professional man in his 30s with short dark hair and glasses, wearing a neat sweater in a modern office setting',
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    },
    {
        id: 'avatar3',
        description: 'A trustworthy-looking woman in her 40s with blonde hair, wearing a blazer, standing in a clean, minimalist studio',
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    },
    {
        id: 'avatar4',
        description: 'An energetic young man in his early 20s with curly hair, wearing a casual t-shirt, in a bright, modern cafe',
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder
    }
];

// NOTE: Using placeholder 1x1 pixel images to avoid large base64 strings in the code.
// A real implementation would have the full base64 encoded images.
// The placeholder is a transparent 1x1 pixel PNG.
export const avatars: Avatar[] = avatarData.map(avatar => ({
    ...avatar,
    dataUri: `data:image/png;base64,${avatar.base64}`
}));
