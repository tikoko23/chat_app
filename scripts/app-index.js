// deno-lint-ignore-file

import { appLogin } from "./app-login.js";
import { switchActiveGroup } from "./group-ui.js";
import { ENDPOINTS, fetchJSON } from "./api-endpoints.js";
import { addMessage, getMessageHolder, createMessageHolder } from "./message-ui.js";
import { setupClientListener } from "./websocket.js";
import { sendMessage } from "./app-message.js";
import { getTextareaLineCount } from "./app-message.js"

const tokenPromise = appLogin();

window.thisUser = null;
window.groupMessages = {};
window.activeGroup = -1;

(async () => {
    const url = new URL(window.location.href);
    const landingGroup = url.searchParams.get("landingGroupId") ?? -1;

    const groupDOM = document.getElementById(`grp_${landingGroup}`);

    if (groupDOM !== null)
        switchActiveGroup(landingGroup);
})();

const groupList = document.getElementById("group-list");

groupList.addEventListener("click", e => {
    if (e.target === null)
        return;

    if (!e.target.classList.contains("group"))
        return;

    const newGroupId = parseInt(e.target.id.substring(4));

    switchActiveGroup(newGroupId);
});

const messageInputFrame = document.getElementById("message-input");
const messageBox = document.getElementById("msg-box");
const sendButton = document.getElementById("send-message");

async function parseAndSendMessage() {
    const token = await tokenPromise;
    const contentBody = messageBox.value.trim();

    messageBox.value = "";

    const message = await sendMessage(token, window.activeGroup, { body: contentBody }, undefined, undefined);
    const messageHolder = getMessageHolder(window.activeGroup) ?? createMessageHolder(window.activeGroup);

    addMessage(
        message.author.displayName ?? message.author.name,
        contentBody,
        message.id,
        messageHolder
    );
}

function updateMessageBoxHeight() {
    const lineCount = getTextareaLineCount(messageBox);

    const lineCountFactor = Math.max(0, Math.min(1.5, lineCount / 4)) * 2;
    const flexGrow = lineCountFactor <= 0.5 ? 0 : lineCountFactor;

    messageInputFrame.style.flexGrow = `${flexGrow}`;
}

sendButton.addEventListener("click", parseAndSendMessage);
messageBox.addEventListener("mouseenter", updateMessageBoxHeight);
messageBox.addEventListener("mousemove", updateMessageBoxHeight);
messageBox.addEventListener("input", updateMessageBoxHeight);
messageBox.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        parseAndSendMessage();
        return;
    }

    updateMessageBoxHeight();
});

setupClientListener(tokenPromise);

/* TESTING */
(async () => {
    const token = await tokenPromise;
    console.log(window.groupMessages);

    for (const [ groupId, holder ] of Object.entries(window.groupMessages)) {
        console.log(groupId, holder);
        const result = await fetchJSON(`${ENDPOINTS.message}/fetch`, {
            method: "POST",
            headers: {
                "Authorization": token
            },
            body: JSON.stringify({
                sort: "createdAt",
                order: "DESC"
            })
        });

        if (result.response.status === 200) {
            const messages = result.obj;

            messages.forEach(m => {
                addMessage(m.author.displayName ?? m.author.name, m.content.body, m.id, holder);
                console.log(m);
            });
        } else
            console.error(result.response.body, "\n", result.response);
    }
})();