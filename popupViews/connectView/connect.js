const sessionURLField = document.getElementById("sessionURL");
const joinButton = document.getElementById("joinButton");
const backButton = document.getElementById("backButton");
const informationIcon = document.getElementById("informationIcon");

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
    const url = request.url;
    const urlParams = new URLSearchParams(url.split("?")[1]);

    if (type == "finishConnect") {
        window.location.assign("./../inSessionView/inSession.html");
    }

    if (type == "getInfo") {
        if(urlParams.has("assistecomigo")){
            sessionURLField.value = request.url;
        }else{
            sessionURLField.placeholder = chrome.i18n.getMessage("placeholderSessionURL");
        }
        
    }
    
}

/**
 * Function fired when the dom is completely loaded
 */
function DOMContentLoaded() {
    informationIcon.addEventListener("click", informationIconCallback);
    joinButton.addEventListener("click", joinButtonCallback);
    backButton.addEventListener("click", onBackButtonClick);
    document.querySelectorAll("[data-locale]").forEach((elem) => {
        elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
    });
    chrome.runtime.sendMessage({ type: "getInfo" });
    sessionURLField.addEventListener("focus", sessionURLFieldOnFocus);
}

async function joinButtonCallback() {
    const sessionURL = sessionURLField.value;
    const urlParams = new URLSearchParams(sessionURL.split("?")[1]);

    if(sessionURL === ""){
        sessionURLField.placeholder = chrome.i18n.getMessage("placeholderSessionURL");
        return;
    }
    
    if(validateURL(urlParams) && validateUUID(urlParams)){
        console.log(validateUUID(urlParams));
        await setToSyncStorage("sessionId", urlParams.get("assistecomigo"));
        await setToSyncStorage("sessionURL", sessionURL);
        chrome.runtime.sendMessage({
            type: "startConnect",
        });
    }else{
        sessionURLField.value = "";
        sessionURLField.placeholder = "URL Inválida";
    }
}

function sessionURLFieldOnFocus(){
    sessionURLField.placeholder = chrome.i18n.getMessage("placeholderSessionURL");
}

function informationIconCallback() {
    var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
    chrome.tabs.create({ url: newURL });
}

function onBackButtonClick() {
    window.location.assign("./../createSessionView/createSession.html");
}

function validateURL(urlParams){
    return urlParams.has("assistecomigo");
}

function validateUUID(urlParams){
    const UUID = urlParams.get("assistecomigo");
    return UUID.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
}