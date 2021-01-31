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
        const userId = data.newId;
        setToSyncStorage("userId", userId);
        setToSyncStorage("errorMessage", "genericError");
        temporarySocket.disconnect();
        var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
        chrome.tabs.create({ url: newURL });
    });
    temporarySocket.emit("getId", {});
}
