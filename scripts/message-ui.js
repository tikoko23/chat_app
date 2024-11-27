// deno-lint-ignore-file

import { parseMarkdown } from "./app-message.js";
import { getReplyEmbed, setRepliedMessage } from "./reply-ui.js";

const contextHTML = `
<button id="reply-button">
    <svg
        style="pointer-events: none;"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
    >
        <path d="M 35 35 C 35 17 35 17 17 17 L 5 17" fill="transparent" stroke="white" stroke-width="3"/>
        <path d="M 15 7 L 5 17 L 15 27" fill="transparent" stroke="white" stroke-width="3"/>
    </svg>
</button>`;

const replyAnnotationSVG = `
<svg
    style="pointer-events: none; aspect-ratio: 2 / 1; height: 1em; margin-right: 5px;"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="20"
    viewBox="0 0 20 40"
    fill="none"
>
    <path d="M 10 30 C 10 20 10 20 20 20 L 70 20" fill="transparent" stroke="white" stroke-width="2"/>
</svg>
`;

/**
 * Creates a message holder for the given group (This will overwrite the previous holder if it exists!)
 * @param {number} groupId
 * @returns {HTMLElement}
 */
export function createMessageHolder(groupId) {
    const element = document.createElement("div");

    element.classList.add("glassify");
    element.id = "message-display";

    element.addEventListener("click", ev => {
        if (ev.target?.id === "reply-button") {
            const message = ev.target.parentElement.parentElement.parentElement;
            setRepliedMessage(message);

            return;
        }
    });

    window.groupMessages[groupId] = element;
    return element;
}

/**
 * Returns an already existing message holder or null if not found
 * @param {number} groupId
 * @returns {HTMLElement | null}
 */
export function getMessageHolder(groupId) {
    return window.groupMessages[groupId] || null;
}

/**
 * Adds a message to the UI
 * @param {string} sender Name to display in the UI
 * @param {string} content Supports markdown (will be converted to XML formatting)
 * @param {number} id
 * @param {HTMLElement} messageContainer Container to put the message in
 * @param {number?} replyTo
 * @returns {{holder: HTMLElement, nameDisplay: HTMLElement, messageContent: HTMLElement[]}}
 */
export function addMessage(sender, content, id, messageContainer, replyTo = undefined) {
    const holder = document.createElement("div");
    const body = document.createElement("div");
    const nameDisplay = document.createElement("span");
    const paragraphHolder = document.createElement("div");
    const context = document.createElement("div");

    const sanitized = parseMarkdown(content);

    holder.id = `msg_${id}`;

    holder.classList.add("message");
    body.classList.add("body");
    nameDisplay.classList.add("name-display");
    paragraphHolder.classList.add("paragraph-holder");
    context.classList.add("context");

    nameDisplay.textContent = sender;
    body.appendChild(nameDisplay);
    body.appendChild(paragraphHolder);
    body.appendChild(context);

    if (replyTo !== undefined && replyTo !== null) {
        const repliedMessage = document.getElementById(`msg_${replyTo}`);

        if (repliedMessage === null)
            throw new Error(`Replied message with id '${replyTo}' does not exist`);

        const embed = getReplyEmbed(repliedMessage);
        embed.innerHTML = `${replyAnnotationSVG}${embed.innerHTML}`;
        holder.appendChild(embed);
    }

    holder.appendChild(body);

    paragraphHolder.innerHTML = sanitized;
    context.innerHTML = contextHTML;

    const messageContent = Array.from(paragraphHolder.children).filter(e => e.tagName === "P");

    messageContent.forEach(e => e.classList.add("no-margin"));

    messageContainer.appendChild(holder);

    if (Math.abs(messageContainer.scrollHeight - messageContainer.clientHeight - messageContainer.scrollTop) <= 50)
        messageContainer.scroll({
            behavior: "instant",
            top: 99999
        });

    return {
        holder: holder,
        nameDisplay: nameDisplay,
        messageContent: messageContent
    };
}