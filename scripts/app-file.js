import { ENDPOINTS } from "./api-endpoints.js";

/**
 * Opens a file selection prompt
 * @param {boolean} multiple
 * @returns {Promise<File[]>}
 */
export async function promptFileSelection(multiple = true) {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;

    input.click();

    await new Promise(resolve => {
        input.addEventListener("change", function handler(e) {
            input.removeEventListener("change", handler);
            resolve(e);
        });
    });

    return Array.from(input.files);
}

/**
 * Uploads files to the default endpoint
 * @param {File} file
 * @param {string} token
 * @param {(arg0: ProgressEvent) => void | Promise<void>} [progressCallback=undefined]
 * @returns {Promise<string>}
 */
export async function uploadFile(file, token, progressCallback = undefined) {
    const req = new XMLHttpRequest();
    req.open("POST", `${ENDPOINTS.upload}?filename=${encodeURIComponent(file.name)}`)
    req.setRequestHeader("Authorization", token);

    if (progressCallback !== undefined)
        req.upload.addEventListener("progress", progressCallback);

    req.send(await file.bytes());

    await new Promise(res => {
        req.onload = res;
    });

    if (req.status !== 201)
        throw new Error(req.response);

    return decodeURI(req.getResponseHeader("Location"));
}

/**
 * @param {number} bytes
 * @returns {string}
 */
export function getPrettyFileSize(bytes) {
    const units = [ "bytes", "KB", "MB", "GB", "TB" ];

    const digitCount = String(bytes).length;
    const unitIndex = Math.floor(digitCount / 3);

    const unitValue = bytes / Math.pow(1000, unitIndex);

    return `${unitValue.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * @param {string} filename
 * @returns {string}
 */
export function getAttachmentType(filename) {
    const extensionStartIndex = filename.lastIndexOf(".");
    const extension = filename.substring(extensionStartIndex);

    switch (extension) {
        case ".htm":
        case ".html":
        case ".css":
        case ".js":
        case ".json":
        case ".txt":
            return "text";
        case ".png":
        case ".jpg":
        case ".jpeg":
        case ".gif":
        case ".svg":
        case ".webp":
            return "image";
        case ".mp3":
        case ".wav":
        case ".ogg":
        case ".aac":
            return "audio";
        case ".mp4":
        case ".mpeg":
            return "video";
        case ".zip":
        case ".tar":
        case ".7z":
        case ".xz":
        case ".gz":
            return "archive";
        default:
            return "binary";
    }
}

/**
 * @param {string} path
 * @returns {string}
 */
export function getContentType(path) {
    const extensionStartIndex = path.lastIndexOf(".");
    const extension = path.substring(extensionStartIndex);

    switch (extension) {
    case ".htm":
    case ".html":
        return "text/html";
    case ".js":
        return "text/javascript";
    case ".css":
        return "text/css";
    case ".json":
        return "application/json";
    case ".pdf":
        return "application/pdf";
    case ".png":
        return "image/png";
    case ".jpg":
    case ".jpeg":
        return "image/jpeg";
    case ".gif":
        return "image/gif";
    case ".svg":
        return "image/svg+xml";
    case ".webp":
        return "image/webp";
    case ".mp3":
        return "audio/mpeg";
    case ".wav":
        return "audio/wav";
    case ".ogg":
        return "audio/ogg";
    case ".aac":
        return "audio/aac";
    case ".mp4":
        return "video/mp4";
    case ".mpeg":
        return "video/mpeg";
    case ".txt":
        return "text/plain";
    default:
        return "application/octet-stream";
    }
}