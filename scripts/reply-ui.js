const messageFrame = document.getElementById("message-frame");

let currentReplyPreview = null;

export function removeReplyPreview() {
    if (currentReplyPreview === null)
        return;

    currentReplyPreview.remove();
    currentReplyPreview = null;
}

/**
 * @param {string} name
 * @param {string} [content=""]
 * @returns {HTMLDivElement}
 */
export function getReplyPreview(name, content = "") {
    const replyPreview = document.createElement("div");
    replyPreview.classList.add("reply-preview");

    const replyToLabel = document.createElement("span");
    replyToLabel.classList.add("reply-to-text");
    replyToLabel.textContent = "Reply to:";

    const nameDisplay = document.createElement("span");
    nameDisplay.classList.add("name-display");
    nameDisplay.textContent = name;

    const pHolder = document.createElement("div");
    pHolder.classList.add("paragraph-holder");
    pHolder.innerHTML = content;

    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => {
        removeReplyPreview();
        window.repliedMessageId = null;
    });

    replyPreview.appendChild(replyToLabel);
    replyPreview.appendChild(nameDisplay);
    replyPreview.appendChild(pHolder);
    replyPreview.appendChild(closeButton);

    return replyPreview;
}

/**
 * Returns metadata about the message object
 * @param {HTMLDivElement} message
 * @returns {{body: HTMLDivElement, children: Element[], nameDisplay?: Element, paragraphHolder?: Element, id: number}}
 */
function getMessageMeta(message) {
    const body = Array.from(message.children).find(e => e.classList.contains("body"));
    console.log("m", message);
    const children = Array.from(body.children);

    const nameDisplay = children.find(e => e.classList.contains("name-display"));
    const paragraphHolder = children.find(e => e.classList.contains("paragraph-holder"));

    const id = Number(message.id.match(/[0-9]+/g)[0]);

    return {
        body,
        children,
        nameDisplay,
        paragraphHolder,
        id
    };
}

/**
 * Sets the replied message and updates the preview
 * @param {HTMLDivElement} message
 */
export function setRepliedMessage(message) {
    removeReplyPreview();

    const meta = getMessageMeta(message);

    const replyPreview = getReplyPreview(meta.nameDisplay.textContent, meta.paragraphHolder.innerHTML);

    currentReplyPreview = replyPreview;

    messageFrame.insertBefore(replyPreview, messageFrame.firstChild);
    window.repliedMessageId = meta.id;
}

/**
 * Gets an embed for the replied message, truncating it if necessary
 * @param {HTMLDivElement} message
 * @param {number} [maxCharCount=200]
 * @returns {HTMLDivElement}
 */
export function getReplyEmbed(message, maxCharCount = 200) {
    const embed = document.createElement("div");
    embed.classList.add("reply-embed")

    const meta = getMessageMeta(message);

    const nameDisplay = document.createElement("span");
    nameDisplay.classList.add("name-display");
    nameDisplay.textContent = meta.nameDisplay.textContent;

    const content = document.createElement("p");
    content.classList.add("no-margin");

    if (meta.paragraphHolder !== undefined) {
        const firstParagraph = meta.paragraphHolder.children.item(0);

        if (firstParagraph !== null)
            content.innerHTML = firstParagraph.innerHTML.substring(0, maxCharCount);
    }

    embed.appendChild(nameDisplay);
    embed.appendChild(content);

    return embed;
}