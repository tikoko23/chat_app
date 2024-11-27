import { createMessageHolder } from "./message-ui.js";
import { getMessageHolder } from "./message-ui.js";
import { addMessage } from "./message-ui.js";
import { ENDPOINTS } from "./api-endpoints.js";

/**
 * @type {Record<string, Array<(data: any) => void>}
 */
const clientEvents = {};

/**
 * Adds an event listener to be handled by the web socket
 * @param {string} type
 * @param {(data: any) => void} f
 */
export function addClientEventListener(type, f) {
    if (clientEvents[type] === undefined)
        clientEvents[type] = [];

    clientEvents[type].push(f);
}

/**
 * Creates a WebSocket with a wrapper function to parse messages
 * @param {string} token
 * @param {(type: string, data: object) => void} eventHandler
 * @returns {WebSocket}
 */
export function getWebSocket(token, eventHandler) {
    const socket = new WebSocket(`${ENDPOINTS.socket}?token=${token}`);

    if (typeof eventHandler === "function") {
        socket.addEventListener("message", event => {
            let message;
            try {
                message = JSON.parse(event.data);
            } catch (e) {
                console.error(e);
                return;
            }

            eventHandler(message.type, message.object);
        });
    }

    return socket;
}

/**
 * Creates a socket with the default event handler and returns it
 * @param {string | Promise<string>} token
 * @returns {Promise<WebSocket>}
 */
export async function setupClientListener(token) {
    token = await token;

    if (token === undefined)
        return;

    return getWebSocket(token, (type, data) => {
        switch (type) {
            case "message.create": {
                if (data.author.id === window.thisUser.id)
                    break;

                const sender = data.author.displayName ?? data.author.name;
                const content = data.content.body;
                const id = data.id;

                const messageHolder = getMessageHolder(data.group.id) ?? createMessageHolder(data.group.id);

                addMessage(sender, content, id, messageHolder, data.replyId);
                break;
            }
        }

        if (clientEvents[type] !== undefined)
            clientEvents[type].forEach(f => f(data));
    });
}