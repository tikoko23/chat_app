// deno-lint-ignore-file
import { getCookie } from "./cookie.js";
import { ENDPOINTS, fetchJSON } from "./api-endpoints.js";
import { LINKS } from "./links.js";
import { setupGroups, moveAway } from "./app-ui.js";

export const progress = document.getElementById("progress-display");

/**
 * Calls other functions to ready the initial UI state and get the token
 * @returns {Promise<string | void>} Token if the fetch was successful
 */
export async function appLogin() {
    progress.textContent = "Getting cookie...";
    const token = getCookie("auth_token");

    if (token === null) {
        progress.textContent = "Your cookie has a skill issue";
        window.location.href = LINKS.login;
        return;
    }

    progress.textContent = "Fetching self...";
    const result = await fetchJSON(`${ENDPOINTS.user}/fetch-self`, {
        headers: { "Authorization": token }
    });

    // Valid token
    if (result.response.status === 200 && result.obj) {
        window.thisUser = result.obj;

        progress.textContent = "Setting up groups...";
        const success = await setupGroups(token);

        if (!success)
            console.error("Setting up groups failed");

        progress.textContent = "Moving away...";
        await moveAway();
        return token;
    } else {
        progress.textContent = "Your token has a skill issue";
        window.location.href = LINKS.login;
    }
}