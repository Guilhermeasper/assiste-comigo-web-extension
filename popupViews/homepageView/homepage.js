import {
    goToConnectPage,
    goToCreateSessionPage,
    goToErrorPage,
    goToInSessionPage
} from "./../../utils/popupNavigate.js";

document.addEventListener("DOMContentLoaded", DOMContentLoaded);

/**
 * 
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */

function onMessage(request, sender, response) {
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

function sendMessageClosure(result) {
    console.log(result);
}

function DOMContentLoaded() {
    let infoPacket = { type: "getInfo" };
    chrome.runtime.onMessage.addListener(onMessage);
    chrome.runtime.sendMessage(infoPacket, sendMessageClosure);
}
