import { ENDPOINTS, fetchJSON } from "./api-endpoints.js";

/**
 * Sends a message and returns the response (This will throw if sending fails!)
 * @param {string} token
 * @param {number} groupId
 * @param {{body: string}} messageContent
 * @param {string[]} [attachments=undefined]
 * @param {number} [replyTo=undefined]
 * @returns {ResponseMessage}
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