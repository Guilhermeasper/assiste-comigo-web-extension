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

function getSessionId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(["sessionId"], (result) => {
                resolve(result.sessionId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getUserId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(["userId"], (result) => {
                resolve(result.userId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getSessionUrl() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(["sessionUrl"], (result) => {
                resolve(result.sessionUrl);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function setSessionId(newSessionId) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({ sessionId: newSessionId }, function () {
                resolve(newSessionId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function setSessionUrl(sessionUrl) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({ sessionUrl: sessionUrl }, function () {
                resolve(sessionUrl);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function setUserId(userId) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({ userId: userId }, function () {
                resolve("userId value is set to " + userId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function clearInfo() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.remove(
                ["sessionId", "sessionUrl"],
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
                resolve(activeTab);
            });
        } catch (error) {
            reject(error);
        }
    });
}
