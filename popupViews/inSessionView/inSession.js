import { copyToClipboard, getSessionId, getUserId, getSessionUrl } from "./../../utils/utils.js";
import { goToErrorPage, goToHomepagePage } from "./../../utils/popupNavigate.js";

const urlCopyButton = document.getElementById("urlCopyButton");
const disconnectButton = document.getElementById("disconnectButton");

document.addEventListener("DOMContentLoaded", DOMContentLoaded);
chrome.runtime.onMessage.addListener(onMessage);
disconnectButton.addEventListener("click", onDisconnectButtonClick);

/**
 * Function fired when the dom is completely loaded
 */
function DOMContentLoaded(){
    chrome.runtime.sendMessage({ type: "getInfo" }, sendMessageClosure);
    document.querySelectorAll("[data-locale]").forEach((elem) => {
        elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
    });
}

/**
 * Function fired when disconnect button is clicked
 */
function onDisconnectButtonClick() {
    chrome.runtime.sendMessage({ type: "disconnect" }, sendMessageClosure);
    goToHomepagePage();
}

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
async function onMessage(request, sender, response) {
    const player = request.player;
    const userId = await getUserId();
    const sessionId = await getSessionId();
    const sessionUrl = await getSessionUrl();
    console.log(player, userId, sessionId);
    if (userId && player && sessionId) {
        urlCopyButton.addEventListener("click", copyToClipboard(sessionUrl));
    } else {
        goToErrorPage();
    }
}

/**
 * Callback from the send message function
 * @param {Object} result Answer from the send message
 */
function sendMessageClosure(response) {
    console.log(response);
}
