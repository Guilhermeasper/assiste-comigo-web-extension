export function tabSendMessage(message) {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                let activeTab = tabs[0];
                try {
                    chrome.tabs.sendMessage(activeTab.id, message, (answer) => {
                        resolve(answer);
                    });
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
                console.log(activeTab);
                resolve(activeTab);
                // try {
                //     chrome.tabs.sendMessage(activeTab.id, message, (answer) => {
                //         resolve(answer);
                //     });
                // } catch (error) {
                //     reject(error);
                // }
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function genericSendMessage(msg) {
    chrome.runtime.sendMessage(msg);
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
/**
 * Delay the current asynchronous process for a given amount of time
 * @param {Integer} ms - Amount of time to be delayed in milisseconds
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getSessionId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sessionId"], (result) => {
            console.log("sessionId value currently is " + result.sessionId);
            resolve(result.sessionId);
        });
    });
}

export function setSessionId(newSessionId) {
    chrome.storage.local.set({ sessionId: newSessionId }, function () {
        console.log("SID value is set to " + newSessionId);
    });
}

export function removeSessionId() {
    chrome.storage.local.remove(["sessionId"], function () {
        console.log("sessionId removed");
    });
}

export function getTabId() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            var activeTab = tabs[0];
            resolve(activeTab);
        });
    });
}

