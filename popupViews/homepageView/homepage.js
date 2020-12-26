import {
    goToConnectPage,
    goToCreateSessionPage,
    goToErrorPage,
    goToInSessionPage
} from "./../../utils/popupNavigate.js";

document.addEventListener("DOMContentLoaded", DOMContentLoaded);
chrome.runtime.onMessage.addListener(onMessage);

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
function onMessage(request, sender, response){
    console.log(request);
    const player = request.player;
    const userId = request.userId;
    const sessionId = request.sessionId;
    const url = request.url;
    if (!userId) {
        goToErrorPage();
    } else {
        if (player && sessionId) {
            goToInSessionPage();
        } else if (!sessionId && url.includes("assistecomigo=")) {
            goToConnectPage();
        } else if (player && !sessionId) {
            goToCreateSessionPage();
        }
    }
}

/**
 * Callback from the send message function
 * @param {Object} result Answer from the send message
 */
function sendMessageClosure(result) {

    if(!result){
        goToErrorPage();
    }
}

/**
 * Function fired when the dom is completely loaded
 */
function DOMContentLoaded() {
    let infoPacket = { type: "getInfo" };
    chrome.runtime.sendMessage(infoPacket, sendMessageClosure);
}
