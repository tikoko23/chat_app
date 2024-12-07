import { readAll } from "./read-all.js";

export const API_PATH = "/api";

export const ENDPOINTS = {
    group: `${API_PATH}/group`,
    user: `${API_PATH}/user`,
    message: `${API_PATH}/message`,
    upload: `${API_PATH}/upload`,
    socket: "/socket"
};

/**
 * Fetches an API endpoint and parses the JSON result as an object
 * @param {string} url
 * @param {RequestInit} [param=undefined]
 * @returns {Promise<{response: Response, obj?: object, body?: string}>}
 */
export async function fetchJSON(url, param) {
    const response = await fetch(url, param);

    const decoder = new TextDecoder("utf-8");
    const responseString = decoder.decode(await readAll(response.body));

    try {
        const obj = JSON.parse(responseString);

        return {
            response: response,
            obj: obj
        }
    } catch (_e) {
        return {
            response: response,
            body: responseString
        };
    }
}
