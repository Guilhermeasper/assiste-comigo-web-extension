document.addEventListener("DOMContentLoaded", DOMContentLoaded);

chrome.runtime.onMessage.addListener(onMessage);

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
function onMessage(request, sender, response) {
    const type = request.type;
    console.log("Connect view");
    console.log(request);
    if (type == "startConnect") {
        chrome.runtime.sendMessage({ type: "finishConnect" });
        return;
    }
    if (type == "finishConnect") {
        window.location.assign("./../inSessionView/inSession.html");
    }
}

/**
 * Function fired when the dom is completely loaded
 */
function DOMContentLoaded() {
    chrome.runtime.sendMessage({
        type: "startConnect",
    });
}
