import { copyToClipboard, clearInfo } from "./../../utils/utils.js";
import { goToErrorPage, goToHomepagePage } from "./../../utils/popupNavigate.js";

const urlCopyButton = document.getElementById("urlCopyButton");
const disconnectButton = document.getElementById("disconnectButton");

document.addEventListener("DOMContentLoaded", DOMContentLoaded);

function DOMContentLoaded(){
    chrome.runtime.sendMessage({ type: "info" }, sendMessageClosure);
    chrome.runtime.onMessage.addListener(onMessage);
    disconnectButton.addEventListener("click", onDisconnectButtonClick);
}

function onDisconnectButtonClick() {
    console.log("Disconect");
    chrome.runtime.sendMessage({ type: "disconnect" }, sendMessageClosure);
    goToHomepagePage();
}

function onMessage(request, sender, response) {
    const player = request.player;
    const userId = request.userId;
    const sessionId = request.sessionId;
    const sessionUrl = request.sessionUrl;
    if (userId && player && sessionId) {
        urlCopyButton.addEventListener("click", copyToClipboard(sessionUrl));
    } else {
        goToErrorPage();
    }
}

function sendMessageClosure(response) {
    console.log(response);
}
