// deno-lint-ignore-file
export function createMessageHolder(groupId) {
    const element = document.createElement("div");

    element.classList.add("glassify");
    element.id = "message-display";

    window.groupMessages[groupId] = element;
    return element;
}

export function getMessageHolder(groupId) {
    return window.groupMessages[groupId] || null;
}

export function addMessage(sender, content, id, messageContainer) {
    const holder = document.createElement("div");
    const nameDisplay = document.createElement("span");

    const parsed = marked.parse(content);
    const sanitized = DOMPurify.sanitize(parsed);

    holder.id = `msg_${id}`;

    holder.classList.add("message");
    nameDisplay.classList.add("name-display");

    nameDisplay.innerText = sender;
    holder.appendChild(nameDisplay);
    holder.innerHTML += sanitized;

    const messageContent = Array.from(holder.children).filter(e => e.tagName === "P");

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