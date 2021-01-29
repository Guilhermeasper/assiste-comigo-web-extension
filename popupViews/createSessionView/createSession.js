const createButton = document.getElementById("createButton");
const joinButton = document.getElementById("joinButton");
const informationIcon = document.getElementById("informationIcon");

chrome.runtime.onMessage.addListener(onMessage);
document.addEventListener("DOMContentLoaded", DOMContentLoaded);

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
async function onMessage(request, sender, response) {
    const requestType = request.type;
    if (requestType == "finishCreate") {
        const userId = await getUserId();
        if (!userId) {
            window.location.assign("./../errorView/error.html");
        } else {
            window.location.assign("./../inSessionView/inSession.html");
        }
    }
}

/**
 * Function fired when create button is clicked
 */
function onCreateButtonClick() {
    tabSendMessage({ type: "startCreate" });
}

function onJoinButtonClick() {
    window.location.assign("./../connectView/connect.html");
}

function DOMContentLoaded() {
    createButton.addEventListener("click", onCreateButtonClick);
    joinButton.addEventListener("click", onJoinButtonClick);
    informationIcon.addEventListener("click", informationIconCallback);
    loadI18NData();
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
