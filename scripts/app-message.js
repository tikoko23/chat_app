// deno-lint-ignore-file

/** @module types */

import { ENDPOINTS, fetchJSON } from "./api-endpoints.js";

/**
 * Sends a message and returns the response (This will throw if sending fails!)
 * @param {string} token
 * @param {number} groupId
 * @param {{body: string}} messageContent
 * @param {string[]} [attachments=undefined]
 * @param {number} [replyTo=undefined]
 * @returns {Promise<ResponseMessage>}
 */
export async function sendMessage(token, groupId, messageContent, attachments = undefined, replyTo = undefined) {
    const result = await fetchJSON(`${ENDPOINTS.message}/create`, {
        method: "POST",
        headers: { "Authorization": token },
        body: JSON.stringify({
            messageContent: messageContent,
            groupId: groupId,
            replyTo: replyTo,
            attachments: attachments
        })
    });

    if (result.response.status !== 201)
        throw new Error(`Sending message failed: ${result.body}`);

    return result.obj;
}

/**
 * Calculates the number of lines of text in a textarea, accounting for line breaks and word wrapping.
 * @param {HTMLTextAreaElement} textarea The textarea element containing the text.
 * @returns {number} The number of lines the text occupies.
 */
export function getTextareaLineCount(textarea) {
    const computedStyle = window.getComputedStyle(textarea);
    const textareaWidth = textarea.clientWidth;

    const text = textarea.value;

    if (text.length === 0)
        return 1;

    const lines = text.split('\n');
    let lineCount = 0;

    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.whiteSpace = "pre";
    tempSpan.style.position = "absolute"
    tempSpan.style.font = computedStyle.font;
    document.body.appendChild(tempSpan);

    lines.forEach(line => {
        tempSpan.textContent = line;
        const lineWidth = tempSpan.clientWidth;
        lineCount += Math.ceil(lineWidth / textareaWidth);
    });

    if (text[text.length - 1] === "\n")
        ++lineCount;

    document.body.removeChild(tempSpan);

    return lineCount;
}