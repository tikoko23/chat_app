export const REGEX = {
    username: /^[a-zA-Z0-9_\.-]{3,32}$/,
    displayName: /^[^\n\t]{1,32}$/,
    email: /^.+@.+\..+$/,
    password: /^.{8,}$/
};