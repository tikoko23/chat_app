/**
 * Gets a cookie by name.
 * @param {string} name - The name of the cookie.
 * @returns {string | null} - The value of the cookie, or null if not found.
 */
export function getCookie(name) {
    const match = document.cookie.match(`(?:^|; )${name}=([^;]*)`);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Sets a cookie with the given name and value.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {number} [days] - Optional number of days until expiration.
 * @param {string} [path='/'] - Optional path for the cookie.
 * @param {string} [domain] - Optional domain for the cookie.
 * @returns {void}
 */
export function setCookie(name, value, days = 365, path = '/', domain) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}` + (domain ? `; domain=${domain}` : '');
}

/**
 * Removes a cookie by name.
 * @param {string} name - The name of the cookie to remove.
 * @param {string} [path='/'] - Optional path of the cookie to remove.
 * @param {string} [domain] - Optional domain of the cookie to remove.
 * @returns {void}
 */
export function removeCookie(name, path = '/', domain) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}` + (domain ? `; domain=${domain}` : '');
}
