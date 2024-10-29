// deno-lint-ignore-file no-window

import { getMessageHolder, createMessageHolder } from "./message-ui.js";

const groupsContainer = document.getElementById("group-list");
const holderContainer = document.getElementById("message-holder");

export function switchActiveGroup(newId) {
    const currentHolder = getMessageHolder(window.activeGroup);
    const currentListItem = document.getElementById(`grp_${window.activeGroup}`);

    if (currentHolder !== null)
        currentHolder.remove();

    if (currentListItem !== null)
        currentListItem.classList.remove("active");

    const newHolder = getMessageHolder(newId) ?? createMessageHolder(newId);

    holderContainer.appendChild(newHolder);

    const newListItem = document.getElementById(`grp_${newId}`);

    if (newListItem !== null)
        newListItem.classList.add("active");

    window.activeGroup = newId;

    return newHolder;
}

export function addGroup(name, ownerId, id) {
    const holder = document.createElement("div");
    const nameDisplay = document.createElement("span");

    holder.classList.add("group");
    nameDisplay.classList.add("name-display");

    groupsContainer.appendChild(holder);
    holder.appendChild(nameDisplay);
    nameDisplay.innerText = name;

    holder.id = `grp_${id}`;

    if (ownerId === window.thisUser.id)
        nameDisplay.classList.add("owned");
}