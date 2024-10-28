import { fetchJSON } from "./api-endpoints.js";
import { ENDPOINTS } from "./api-endpoints.js";
import { addGroup } from "./group-ui.js";

export const body = document.querySelector("body");
export const luiRoot = document.getElementById("load-ui-root");

export async function moveAway() {
    body.style.transition = "all 1.5s cubic-bezier(0.5, 0, 0.50, 1.0)";
    body.style.transform = "translateY(-100%)";

    await new Promise(r => setTimeout(r, 1550));
    body.style.removeProperty("transition");
    luiRoot.innerHTML = "";
}

export async function setupGroups(token) {
    const result = await fetchJSON(`${ENDPOINTS.group}/fetch-joined`, {
        method: "GET",
        headers: {
            "Authorization": token
        }
    });

    if (result.response.status === 200) {
        result.obj.forEach(g => {
            addGroup(g.name, g.owner, g.id);
        });
        
        return true;
    } else
        return false;
}