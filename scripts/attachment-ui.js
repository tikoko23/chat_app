import { fetchJSON } from "./api-endpoints.js";
import { getAttachmentType, getContentType, getPrettyFileSize } from "./app-file.js";

const messageFrame = document.getElementById("message-frame");
const textInput = document.getElementById("text-input");

/**
 * Creates an attachment card with the given parameters
 * @param {string} title
 * @param {string} subtext
 * @param {{link?: string, icon?: string, onClose?: (self: HTMLDivElement, event: MouseEvent) => void}} [options={}]
 */
export function getAttachmentCard(title, subtext, options = {}) {
    const link = options.link || null;
    const icon = options.icon || null;
    const onClose = options.onClose;

    const card = document.createElement("div");
    card.classList.add("attachment-card");

    const body = document.createElement("div");
    body.classList.add("body");

    const titleLabel = document.createElement("a");
    titleLabel.classList.add("title");
    titleLabel.textContent = title;

    const subtextLabel = document.createElement("span");
    subtextLabel.classList.add("subtext");
    subtextLabel.textContent = subtext;

    if (icon !== null) {
        const iconDiv = document.createElement("div");
        iconDiv.classList.add("icon");

        card.appendChild(iconDiv);
    }

    if (link !== null)
        titleLabel.href = encodeURI(link);

    body.appendChild(titleLabel);
    body.appendChild(subtextLabel);
    card.appendChild(body);

    if (onClose !== undefined) {
        const closeButton = document.createElement("button");
        closeButton.classList.add("close-button", "attachment-close-button");
        closeButton.textContent = "×";

        closeButton.addEventListener("click", e => onClose(card, e));

        card.appendChild(closeButton);
    }

    return card;
}

/**
 * @returns {HTMLDivElement}
 */
export function showAttachmentPreview() {
    const oldPreview = document.getElementById("attachment-preview");
    if (oldPreview !== null)
        return oldPreview;

    const preview = document.createElement("div");
    preview.id = "attachment-preview";

    messageFrame.insertBefore(preview, textInput);

    return preview;
}

export function hideAttachmentPreview() {
    const preview = document.getElementById("attachment-preview");

    if (preview !== null)
        preview.remove();
}

/** @type {{file: File, card: HTMLDivElement, progressBar: HTMLDivElement}[]} */
export let attachments = [];

/**
 * @param {File} attachment
 * @returns {HTMLDivElement}
 */
export function addAttachment(attachment) {
    if (attachments.some(a => a.file.name === attachment.name))
        return;

    const preview = showAttachmentPreview();

    const card = getAttachmentCard(attachment.name, getPrettyFileSize(attachment.size), {
        onClose: self => {
            attachments = attachments.filter(a => a.file.name !== attachment.name);
            self.remove();

            if (attachments.length === 0)
                hideAttachmentPreview();
        }
    });

    const progressBar = document.createElement("div");
    progressBar.classList.add("attachment-upload-progress-bar");
    progressBar.style.width = "0%";

    const cardBody = Array.from(card.children).find(e => e.classList.contains("body"));
    cardBody.appendChild(progressBar);

    preview.appendChild(card);
    attachments.push({
        file: attachment,
        card: card,
        progressBar: progressBar
    });

    return card;
}

export function clearAttachments() {
    hideAttachmentPreview();
    attachments = [];
}

/**
 * @param {string[]} links
 * @returns {Promise<HTMLDivElement>}
 */
export async function getAttachmentHolder(links) {
    const holder = document.createElement("div");
    holder.classList.add("msg-attachment-holder");

    const metadata = await Promise.all(links.map(async l => {
        const result = await fetchJSON(`${l}?meta=true`);

        return result.obj || {};
    }));

    links.forEach((l, i) => {
        const name = l.replace(/^\/cdn\/user_upload\/[0-9]+\/[0-9]+___/, "");

        switch (getAttachmentType(name)) {
        case "image": {
            const anchor = document.createElement("a");
            anchor.classList.add("attachment-preview-image");
            anchor.href = encodeURI(l);
            anchor.target = "_blank";

            const img = document.createElement("img");
            img.src = l;

            anchor.appendChild(img);
            holder.appendChild(anchor);
            break;
        }
        case "audio": {
            const audio = document.createElement("audio");
            audio.controls = true;

            const source = document.createElement("source");
            source.src = encodeURI(l);
            source.type = getContentType(l);

            audio.appendChild(source);
            holder.appendChild(audio);
            break;
        }
        case "video": {
            const video = document.createElement("video");
            video.classList.add("attachment-preview-video");
            video.controls = true;

            const source = document.createElement("source");
            source.src = encodeURI(l);
            source.type = getContentType(l);

            video.appendChild(source);
            holder.appendChild(video);
            break;
        }
        default: {
            const card = getAttachmentCard(name, getPrettyFileSize(metadata[i].length) || "Unknown", {
                link: l
            });

            card.classList.add("glassify");

            holder.appendChild(card);
            break;
        }}
    });

    return holder;
}