import {
    goToConnectPage,
    goToCreateSessionPage,
    goToErrorPage,
    goToInSessionPage,
} from "./../../utils/popupNavigate.js";

const externalSession = document.getElementById("internalPlayerLink");
const informationIcon = document.getElementById("informationIcon");

document.addEventListener("DOMContentLoaded", DOMContentLoaded);
chrome.runtime.onMessage.addListener(onMessage);

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
async function onMessage(request, sender, response) {
    const player = request.player;
    const url = request.url;
    const userId = await getFromSyncStorage("userId");
    const sessionId = await getFromSyncStorage("sessionId");
    const urlParams = new URLSearchParams(url.split("?")[1]);
    console.log(request);
    if (!userId) {
        goToErrorPage();
    } else if (player) {
        if (sessionId) {
            goToInSessionPage();
        } else if (!sessionId && urlParams.has("assistecomigo")) {
            goToConnectPage();
        } else {
            goToCreateSessionPage();
        }
    }
}

/**
 * Function fired when the dom is completely loaded
 */
async function DOMContentLoaded() {
    informationIcon.addEventListener("click", informationIconCallback);
    externalSession.addEventListener("click", onButtonExternalSessionClick);
    const currentTabId = await getTabId();
    const sessionTabId = await getFromSyncStorage("sessionTabId");
    console.log(sessionTabId);
    if(sessionTabId && currentTabId !== sessionTabId){
        await setToSyncStorage("errorMessage", "alreadyInSessionError");
        goToErrorPage();
    }
    try {
        chrome.runtime.sendMessage({ type: "getInfo" });
    } catch (error) {
        console.log(error);
    }
    loadI18NData();
}

function onButtonExternalSessionClick() {
    var newURL = `chrome-extension://${chrome.runtime.id}/internalPlayer/mainPage/index.html`;
    chrome.tabs.create({ url: newURL });
}

function informationIconCallback() {
    var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
    chrome.tabs.create({ url: newURL });
}

function loadI18NData() {
    document.querySelectorAll("[data-locale]").forEach((elem) => {
        elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
    });
}
