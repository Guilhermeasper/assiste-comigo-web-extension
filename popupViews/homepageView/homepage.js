import {
    goToConnectPage,
    goToCreateSessionPage,
    goToErrorPage,
    goToInSessionPage
} from "./../../utils/popupNavigate.js";

import {getUserId, getSessionId} from "./../../utils/utils.js"

document.addEventListener("DOMContentLoaded", DOMContentLoaded);
chrome.runtime.onMessage.addListener(onMessage);

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
async function onMessage(request, sender, response){
    console.log(request);
    const player = request.player;
    const url = request.url;
    const userId = await getUserId();
    const sessionId = await getSessionId();
    
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
