/** @module types */

export const REGEX = {
    username: /^[a-zA-Z0-9_\.-]{3,32}$/,
    displayName: /^[^\n\t]{1,32}$/,
    email: /^.+@.+\..+$/,
    password: /^.{8,}$/
};

/**
 * Returns a RegExp object to match pings for the given user
 * @param {ResponseUser?} [user=undefined]
 * @returns {RegExp}
 */
export function pingRegex(user = undefined) {
    if (user === undefined) {
        const usernameRegex = String(REGEX.username);
        user = {
            name: usernameRegex.substring(2, usernameRegex.length - 2),
            id: "[0-9]+?"
        }
    }

    return RegExp(`\\[@(?<name>${user.name})\\]\\(ping;(?<id>${user.id})\\)`, "g");
}