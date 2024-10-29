// deno-lint-ignore-file
import { getCookie } from "./cookie.js";
import { ENDPOINTS, fetchJSON } from "./api-endpoints.js";
import { LINKS } from "./links.js";
import { setupGroups, moveAway } from "./app-ui.js";

export const progress = document.getElementById("progress-display");

export async function appLogin() {
    progress.innerText = "Getting cookie...";
    const token = getCookie("auth_token");

    if (token === null) {
        progress.innerText = "Your cookie has a skill issue";
        window.location.href = LINKS.login;
        return;
    }

    progress.innerText = "Fetching self...";
    const result = await fetchJSON(`${ENDPOINTS.user}/fetch-self`, {
        headers: { "Authorization": token }
    });

    // Valid token
    if (result.response.status === 200 && result.obj) {
        window.thisUser = result.obj;

        progress.innerText = "Setting up groups...";
        const success = await setupGroups(token);

        if (!success)
            console.error("Setting up groups failed");

        progress.innerText = "Moving away...";
        await moveAway();
        return token;
    } else {
        progress.innerText = "Your token has a skill issue";
        window.location.href = LINKS.login;
    }
}