// deno-lint-ignore-file

import { parseMarkdown } from "./app-message.js";

/**
 * @type {Record<string, {card: HTMLDivElement, id: string, timeoutId: number}>}
 */
const NOTIFICATIONS = {};

/**
 * Creates and sends a notification
 * @param {string} title The title of the notification
 * @param {string} content The text to display (supports markdown)
 * @param {{time?: number, icon?: string, sound?: HTMLAudioElement}} [options={}]
 * @returns {{card: HTMLDivElement, id: string}} The notification id. This can be used to destroy the notification later
 */
export function sendNotification(title, content, options = {}) {
    const time = options.time || 5;
    const icon = options.icon || null;
    const sound = options.sound || null;

    const notificationId = `${time}-${Date.now()}-${title[0]}${content[0]}`;

    const notificationHolder = document.getElementById("notification-holder");

    const notificationCard = document.createElement("div");
    notificationCard.id = `notification-${notificationId}`;
    notificationCard.classList.add("notification", "glassify", "dark-glass");

    if (icon !== null) {
        const notificationIconHolder = document.createElement("div");
        notificationIconHolder.classList.add("n-symbol");
        notificationIconHolder.innerHTML = icon;

        notificationCard.appendChild(notificationIconHolder);
    }

    const notificationBody = document.createElement("div");
    notificationBody.classList.add("n-body");

    const notificationTitle = document.createElement("span");
    notificationTitle.classList.add("n-title");
    notificationTitle.innerText = title;

    notificationBody.appendChild(notificationTitle);

    const sanitized = parseMarkdown(content);
    notificationBody.innerHTML += sanitized;

    notificationCard.appendChild(notificationBody);

    notificationHolder.appendChild(notificationCard);

    if (sound !== null)
        // Will throw if no user input occurs, added empty catch
        sound.play().catch(() => {});

    const timeoutId = setTimeout(() => {
        NOTIFICATIONS[notificationId].timeoutId = -1;
        destroyNotification(notificationId);
    }, time * 1000);

    const notification = {
        card: notificationCard,
        id: notificationId
    };

    NOTIFICATIONS[notificationId] = { ...notification, timeoutId: timeoutId };

    return notification;
}

/**
 * Cancels the timeout of the notification if it exists, and destroys the DOM element
 * @param {string} id The notification to destroy
 * @returns {void}
 */
export function destroyNotification(id) {
    const notification = NOTIFICATIONS[id];

    if (notification === undefined)
        return;

    if (notification.timeoutId >= 0)
        clearTimeout(notification.timeoutId);

    notification.card.remove();

    delete NOTIFICATIONS[id];
}