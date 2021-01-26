import {
    goToConnectPage,
    goToCreateSessionPage,
    goToErrorPage,
    goToInSessionPage,
} from "./../../utils/popupNavigate.js";

import { getUserId, getSessionId } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", DOMContentLoaded);
chrome.runtime.onMessage.addListener(onMessage);

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
async function onMessage(request, sender, response) {
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
    if (!result) {
        console.log("Erro"); //goToErrorPage();
    }
}

/**
 * Function fired when the dom is completely loaded
 */
function DOMContentLoaded() {
    let infoPacket = { type: "getInfo" };
    const externalSession = document.getElementById("internalPlayerLink");
    const informationIcon = document.getElementById("informationIcon");
    informationIcon.addEventListener("click", informationIconCallback);
    externalSession.addEventListener("click", onButtonExternalSessionClick);
    chrome.runtime.sendMessage(infoPacket, sendMessageClosure);
    document.querySelectorAll("[data-locale]").forEach((elem) => {
        elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
    });
}

function onButtonExternalSessionClick() {
    var newURL = `chrome-extension://${chrome.runtime.id}/internalPlayer/mainPage/index.html`;
    chrome.tabs.create({ url: newURL });
    console.log("Nova guia");
}

function informationIconCallback(){
    var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
    chrome.tabs.create({ url: newURL });
}
