import { copyToClipboard, getSessionId, getUserId, getSessionUrl } from "./../../utils/utils.js";
import { goToErrorPage, goToHomepagePage } from "./../../utils/popupNavigate.js";

const urlCopyButton = document.getElementById("urlCopyButton");
const disconnectButton = document.getElementById("disconnectButton");
const emojisHTMLElement = document.getElementById("emojis");

document.addEventListener("DOMContentLoaded", DOMContentLoaded);
chrome.runtime.onMessage.addListener(onMessage);
disconnectButton.addEventListener("click", onDisconnectButtonClick);

/**
 * Function fired when the dom is completely loaded
 */
function DOMContentLoaded(){
    chrome.runtime.sendMessage({ type: "getInfo" }, sendMessageClosure);
    const informationIcon = document.getElementById("informationIcon");
    informationIcon.addEventListener("click", informationIconCallback);
    document.querySelectorAll("[data-locale]").forEach((elem) => {
        elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
    });
}

function informationIconCallback(){
    var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
    chrome.tabs.create({ url: newURL });
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
        emojisHTMLElement.innerText = convertUUIDToEmoji(sessionId);
        twemoji.parse(emojisHTMLElement);
        urlCopyButton.addEventListener("click", copyToClipboard.bind(this, sessionUrl));
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

function convertUUIDToEmoji(uuid){
    let emojiOutput = ""
    const uuidArray = uuid.split("-");
    for (const section of uuidArray) {
        const index = parseInt(section.substring(0,2), 16);
        emojiOutput += emojis[index];
    }
    return emojiOutput;
}