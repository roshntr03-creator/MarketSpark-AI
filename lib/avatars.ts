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
    description_ar: string;
    dataUri: string;
    base64: string; // The raw base64 string without the data URI prefix
    mimeType: string;
}

const avatarData: Omit<Avatar, 'dataUri' | 'base64'>[] = [
    {
        id: 'avatar1',
        description: 'A friendly woman in her late 20s with brown hair, wearing a denim jacket, sitting in a cozy, well-lit home office',
        description_ar: 'امرأة ودودة في أواخر العشرينات من عمرها بشعر بني، ترتدي سترة من الدنيم، وتجلس في مكتب منزلي مريح ومضاء جيدًا',
        mimeType: 'image/jpeg',
    },
    {
        id: 'avatar2',
        description: 'A professional man in his 30s with short dark hair and glasses, wearing a neat sweater in a modern office setting',
        description_ar: 'رجل محترف في الثلاثينات من عمره بشعر داكن قصير ونظارات، يرتدي سترة أنيقة في بيئة مكتبية عصرية',
        mimeType: 'image/jpeg',
    },
    {
        id: 'avatar3',
        description: 'A trustworthy-looking woman in her 40s with blonde hair, wearing a blazer, standing in a clean, minimalist studio',
        description_ar: 'امرأة تبدو جديرة بالثقة في الأربعينات من عمرها بشعر أشقر، ترتدي سترة رسمية، وتقف في استوديو بسيط ونظيف',
        mimeType: 'image/jpeg',
    },
    {
        id: 'avatar4',
        description: 'An energetic young man in his early 20s with curly hair, wearing a casual t-shirt, in a bright, modern cafe',
        description_ar: 'شاب مفعم بالحيوية في أوائل العشرينات من عمره بشعر مجعد، يرتدي قميصًا عاديًا، في مقهى عصري ومشرق',
        mimeType: 'image/jpeg',
    }
];

// Raw base64 strings are stored separately to avoid clutter
const rawBase64Strings: { [key: string]: string } = {
    avatar1: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoACgDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAUDBAYH/8QAKxAAAQMDAwQCAgMAAAAAAAAAAQIDBAUGEQASIQcxQRMiFGEiMkJxgZGh/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAeEQEBAAEEAwEAAAAAAAAAAAABAAIRIQMSMUFRcf/aAAwDAQACEQMRAD8A68/W6NTp71PqVUgxZcbZ5TL8hCHFbkgjcCeRgnke9N59/wBhpbKZE+6aNGaWkOIW9VaekKSeQQVOcg+tVrd+2ar12vV6sW/TIzMmrOl6Wt+OHy4sgAnG4Y4AGMY4rL6jqlzXLsVyvT6C08lpLKVxKa00oJSMAYCSOPf1qS2u/45L6xvt1dD3/e9h0yIqXPu6gR2EHBdcthpIPsSpwAn61BqXVTZ1NZU9bVyUWqyF7fLjUaO66lPcFxKVkDPzWbLlzZsgyZ0p+S+r8zzyytZ+5JyaY7z6qO/1JbV6c/2U88TqDpDqvZ9WcUm2Lsq9TLXmOx48V91aRwFKS4VAH3xVD/AOquwA4D/wDWqBx71+K1n3E+qj9TWV+z2O4qO7r1BqPUC3b5pbEu163S6ywpWwuwZSH0JXgHBUgnBwQce9SMaowZa3WIsyO84wsodQ26lSm1A4IUAeCDkHPpX542pcFwW5VF1e16xNpc1TY0X4UlTKygEEp3JIOOCR9a/Q/b1vW3dtqM3HcE6nyqvJfdLz9PkF9CkpISkbiBkgDPGOab3FjE1uQnZf/9k=',
    avatar2: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoACgDASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAgEDAAQF/8QAKBAAAgEDAwMEAwEAAAAAAAAAAQIDAAQRBRIhEzFRBhQiQYEyQmJx/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAEDAgT/xAAgEQACAQQCAwEAAAAAAAAAAAAAAQIDERIEITEyUWGB/9oADAMBAAIRAxEAPwDq65yEkgAEn0FRPdWkLmOVgCpII2njPpxWHrd7qFrLGtpG7Ag7iI9wPsf6/azmq6rraXTxWzTxxoANyRZ3cd+fH0rKdaMXZGqVvR0pYggEkcdzVc2pWzKGFzFljgfOOa4u71LW552dLi6G48KImGB2GBxUf8AEan5u4zXXmOdsP+10Ljq+h+nS+I6N9eQwIzzSKiKCWYngAeSaw9V8R2NtAyWkizytwAvKj3JHH7rnNR1fU58mW7uXz6uST/AFk1GbmSRizsWJ5JJyTXU69vRXSoLeW9nknnYvJIxZmPcnk1EoqhRVsEEgggkHkEeooBCAiiigH//Z',
    avatar3: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoACgDASIAAhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAAAAMCBAAFBgf/xAApEAABAgUEAgIDAQEAAAAAAAABAgMABBEFEiETIjFRYQZBYnETI0KB/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAIBBAP/xAAdEQACAgMAAwEAAAAAAAAAAAAAAQIREiExEEFR/9oADAMBAAIRAD8A6UqYl2XU81xDaE6qUcAVjJ2/Il1Fpl8OrOymwVE/Olc4rLzE2uZc2lQ+GlRAQP0nn7k1FhP2iRzH6r6H067fllwSssy5SAcJUskq9wAOPuajzO1J8K+3KyyFtnVKnVkKHwADj5J+I4eUqUtS1qKlKOSTqTUe0RZnP6q10/sUvO2ZltWJebmB5s7KmwEkfIIJ/cVGm9qL7r2ZdgsNtnZDjhUofAAx8k/FYa+tXtEmcyH5t9DrdOzpZalBLcw4VFRShJSlWvU7j35rNzW2ZpxuKzLqQdlSU4T9yTSooEV1bMzk/wC20aM1MTCFO2+blR5K3QkZlSglIA3OgG1c0gKCAoD0k9xUqS/3EshW7Y8Kvof080LqVlK0KCkKGQRqD5piiEwIoooB//Z',
    avatar4: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAoACgDASIAAhEBAxEB/8QAGwAAAwEBAQEBAAAAAAAAAAAAAwQFAgABBgf/xAAoEAACAQMDAwQCAwAAAAAAAAABAgMABBEFEiExExQiQWEjMmGBFEb/xAAXAQEBAQEAAAAAAAAAAAAAAAABAgAD/8QAHBEBAQEAAgMBAAAAAAAAAAAAAAERAhIhIDFh/9oADAMBAAIRAxEAPwDo9K8ooDyiiigKKKKA8rN671N9MtUkhRXmlbYrHO0eScf2K0leUUDaW9/qF08moXTzSOfmdj9ABwBS2a4niO6KV1HII4x8g1oKKmViK5lZizMSTySTzS6inFZK8oooIqKKKApfRRQFFFFAf/9k=',
};

function sanitizeBase64(raw: string): string {
    // Remove any characters that are not part of the Base64 standard
    let cleaned = raw.replace(/[^A-Za-z0-9+/=]/g, "");
    // Ensure correct padding
    const mod = cleaned.length % 4;
    if (mod) {
        cleaned += "=".repeat(4 - mod);
    }
    return cleaned;
}

export const avatars: Avatar[] = avatarData.map(avatar => {
    const rawString = rawBase64Strings[avatar.id] || '';
    const cleanedBase64 = sanitizeBase64(rawString);
    return {
        ...avatar,
        base64: cleanedBase64,
        dataUri: `data:${avatar.mimeType};base64,${cleanedBase64}`
    };
});
