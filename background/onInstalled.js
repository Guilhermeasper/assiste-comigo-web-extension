importScripts('./libs/socket.io.js');

const serverAddress = "https://assistecomigo.herokuapp.com";

chrome.runtime.onInstalled.addListener(onInstalled);

/**
 * Fired when the extension is installed
 * @param {string} details - Details of installation
 */
function onInstalled(details) {
    clearInfo();
    let temporarySocket = io.connect(serverAddress, {
        transports: ["websocket"],
    });
    temporarySocket.on("newId", (data) => {
        console.log(`The user created by server is ${data.newId}`);
        setUserId(data.newId);
        temporarySocket.disconnect();
    });
    temporarySocket.emit("getId", {});
}
