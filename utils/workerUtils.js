/**
 * Send a message to the content script of the current tab
 * @param {Object} message Object containing the message to be sent
 */
function tabSendMessage(message) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                let activeTab = tabs[0];
                try {
                    const newdata = { tabId: activeTab.id };
                    const newMessage = { ...message, ...newdata };
                    chrome.tabs.sendMessage(
                        activeTab.id,
                        newMessage,
                        (answer) => {
                            resolve(answer);
                        }
                    );
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function tabSendMessageId(message, id) {
    chrome.tabs.sendMessage(id, message);
}

function setToSyncStorage(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [key]: value }, function () {
            // console.log(`${key} value is set to ${value}`);
            resolve(value);
        });
    });
}

function getFromSyncStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], function (result) {
            // console.log(`${key} value is set to ${result[key]}`);
            resolve(result[key]);
        });
    });
}

function getTabUrl() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                let activeTab = tabs[0];
                resolve(activeTab.url);
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Copy the received string to clipboard
 * @param {string} url -
 */
function copyToClipboard(url) {
    const textAreaElement = document.createElement("textarea");
    textAreaElement.value = url;
    textAreaElement.style.position = "absolute";
    textAreaElement.style.left = "-9001px";
    document.body.appendChild(textAreaElement);
    textAreaElement.select();
    document.execCommand("copy");
    document.body.removeChild(textAreaElement);
}

function clearInfo() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.remove(
                ["sessionId", "sessionUrl", "sessionTabId"],
                function () {
                    resolve({ code: 200 });
                }
            );
        } catch (error) {
            reject(error);
        }
    });
}

function getTabId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                var activeTab = tabs[0];
                resolve(activeTab.id);
            });
        } catch (error) {
            reject(error);
        }
    });
}
