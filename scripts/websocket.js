import { createMessageHolder } from "./message-ui.js";
import { getMessageHolder } from "./message-ui.js";
import { addMessage } from "./message-ui.js";

const SOCKET_URL = `/socket`;

/**
 * Creates a WebSocket with a wrapper function to parse messages
 * @param {string} token
 * @param {(type: string, data: object) => void} eventHandler
 * @returns {WebSocket}
 */
export function getWebSocket(token, eventHandler) {
    const socket = new WebSocket(`${SOCKET_URL}?token=${token}`);

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
 * @param {string|Promise<string>} token
 * @returns {Promise<WebSocket>}
 */
export async function setupClientListener(token) {
    token = await token;

    return getWebSocket(token, (type, data) => {
        switch (type) {
            case "message.create": {
                const sender = data.author.name;
                const content = data.content.body;
                const id = data.id;

                const messageHolder = getMessageHolder(data.group.id) ?? createMessageHolder(data.group.id);

                addMessage(sender, content, id, messageHolder);
                break;
            }
        }
    })
}