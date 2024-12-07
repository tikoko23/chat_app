import { promptFileSelection } from "./app-file.js";
import { addAttachment } from "./attachment-ui.js";

const uploadButton = document.getElementById("upload-button");

uploadButton.addEventListener("click", async () => {
    const files = await promptFileSelection();

    files.forEach(addAttachment);
});