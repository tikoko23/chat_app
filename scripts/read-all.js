/**
 * Reads all data in the stream and returns it
 * @param {ReadableStream<Uint8Array>} stream 
 * @returns {Promise<Uint8Array>}
 */
export async function readAll(stream) {
    const reader = stream.getReader();

    let fullData = new Uint8Array();
    
    while (true) {
        const { value, done } = await reader.read();

        if (done)
            break;

        const newData = new Uint8Array(fullData.length + value.length);
        newData.set(fullData);
        newData.set(value, fullData.length);
        fullData = newData;
    }

    return fullData;
}