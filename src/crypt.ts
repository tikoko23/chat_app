export async function hashString(str: string): Promise<string> {

    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(length: number = 16): string {
    const array = new Uint8Array(length);

    crypto.getRandomValues(array);

    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}