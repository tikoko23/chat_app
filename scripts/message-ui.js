// deno-lint-ignore-file

/**
 * Creates a message holder for the given group (This will overwrite the previous holder if it exists!)
 * @param {number} groupId
 * @returns {HTMLElement}
 */
export function createMessageHolder(groupId) {
    const element = document.createElement("div");

    element.classList.add("glassify");
    element.id = "message-display";

    window.groupMessages[groupId] = element;
    return element;
}

/**
 * Returns an already existing message holder or null if not found
 * @param {number} groupId
 * @returns {HTMLElement|null}
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
 * @returns {{holder: HTMLElement, nameDisplay: HTMLElement, HTMLElement[]}}
 */
export function addMessage(sender, content, id, messageContainer) {
    const holder = document.createElement("div");
    const nameDisplay = document.createElement("span");
    const paragraphHolder = document.createElement("div");

    const parsed = marked.parse(content).replace("\n", "<br>").replace(/\<br\>$/g, "");
    const sanitized = DOMPurify.sanitize(parsed);

    holder.id = `msg_${id}`;

    holder.classList.add("message");
    nameDisplay.classList.add("name-display");
    paragraphHolder.classList.add("paragraph-holder");

    nameDisplay.textContent = sender;
    holder.appendChild(nameDisplay);
    holder.appendChild(paragraphHolder);

    paragraphHolder.innerHTML = sanitized;

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