importScripts("./utils/utils.js");
importScripts('./libs/socket.io.js');

chrome.runtime.onInstalled.addListener(onInstalled);

/**
 * Fired when the extension is installed
 * @param {string} details - Details of installation
 */
function onInstalled(details) {
    clearInfo();
    let tmpSocket = io.connect("http://assistecomigotest.herokuapp.com", {
        transports: ["websocket"],
    });
    tmpSocket.on("newId", (data) => {
        console.log(`The user created by server is ${data.newId}`);
        setUserId(data.newId);
        tmpSocket.disconnect();
    });
    tmpSocket.emit("getId", {});

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        console.log("Rules Removed");
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches:
                                "(vimeo|crunchyroll|primevideo|viki|youtube|anitube|netflix).(com|site)",
                        },
                    }),
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()],
            },
        ]);
        console.log("New rules added");
    });
}
