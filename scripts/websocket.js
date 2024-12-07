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
 * @param {(err: CloseEvent) => void} [closeHandler=undefined]
 * @returns {WebSocket}
 */
export function getWebSocket(token, eventHandler, closeHandler = undefined) {
    const socket = new WebSocket(`${ENDPOINTS.socket}?token=${token}`);

    if (eventHandler !== undefined) {
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

    if (closeHandler !== undefined)
        socket.addEventListener("close", closeHandler);

    return socket;
}

/**
 * Creates a socket with the default event handler and returns it
 * @param {string | Promise<string>} token
 */
export async function setupClientListener(token) {
    token = await token;

    if (token === undefined)
        return;

    const eventHandler = (type, data) => {
        switch (type) {
            case "message.create": {
                if (data.author.id === window.thisUser.id)
                    break;

                const sender = data.author.displayName ?? data.author.name;
                const content = data.content.body;
                const id = data.id;

                const messageHolder = getMessageHolder(data.group.id) ?? createMessageHolder(data.group.id);

                addMessage(sender, content, id, messageHolder, data.replyId, data.attachments);
                break;
            }
        }

        if (clientEvents[type] !== undefined)
            clientEvents[type].forEach(f => f(data));
    };

    getWebSocket(token, eventHandler, function closeHandler(cl) {
        if (cl.code === 1006) {
            let intervalId;
            intervalId = setInterval(() => {
                try {
                    console.log("Trying to reconnect");
                    getWebSocket(token, eventHandler, closeHandler)
                } catch (_e) {
                    return;
                }

                clearInterval(intervalId);
            }, 30 * 1e3);
        }
    });
}