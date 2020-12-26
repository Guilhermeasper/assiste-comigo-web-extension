/**
 * Send a message to the content script of the current tab
 * @param {Object} message Object containing the message to be sent
 */
export function tabSendMessage(message) {
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

export function getTabUrl() {
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
export function copyToClipboard(url) {
    const textAreaElement = document.createElement("textarea");
    textAreaElement.value = url;
    textAreaElement.style.position = "absolute";
    textAreaElement.style.left = "-9001px";
    document.body.appendChild(textAreaElement);
    textAreaElement.select();
    document.execCommand("copy");
    document.body.removeChild(textAreaElement);
}

export function getSessionId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(["sessionId"], (result) => {
                console.log("sessionId value currently is " + result.sessionId);
                resolve(result.sessionId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function getUserId() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(["userId"], (result) => {
                console.log("User id value currently is " + result.userId);
                resolve(result.userId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function getSessionUrl() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(["sessionUrl"], (result) => {
                console.log(`Getting session url: ${result.sessionUrl}`);
                resolve(result.sessionUrl);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function setSessionId(newSessionId) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set({ sessionId: newSessionId }, function () {
                console.log("SID value is set to " + newSessionId);
                resolve(newSessionId);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function setSessionUrl(sessionUrl) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`Setting new session url to ${sessionUrl}`);
            chrome.storage.local.set({ sessionUrl: sessionUrl }, function () {
                resolve(sessionUrl);
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function setUserId(userId) {
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

export function clearInfo() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.remove(
                ["sessionId", "sessionUrl"],
                function () {
                    console.log("Info removed");
                    resolve({ code: 200 });
                }
            );
        } catch (error) {
            reject(error);
        }
    });
}

export function getTabId() {
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
