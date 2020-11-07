import { tabSendMessage, setSessionId } from "./../../utils/utils.js";
const buttonCreate = document.getElementById("buttonCreate");
document.addEventListener("DOMContentLoaded", DOMContentLoaded)

function DOMContentLoaded(){
    buttonCreate.addEventListener("click", onButtonCreateClick);
    chrome.runtime.onMessage.addListener(onMessage);
}

function onMessage(request, sender, response){
    if (request.type == "startCreate") {
        chrome.runtime.sendMessage({type: "finishCreate"});
        return;
    }
    const player = request.player;
    const userId = request.userId;
    const sessionId = request.sessionId;
    const url = request.url;
    const urlParams = new URLSearchParams(url);
    console.log(request);
    if (!userId) {
        window.location.assign("./../errorView/error.html");
    } else {
        if (player && (sessionId || urlParams.has("assistecomigo"))) {
            window.location.assign("./../inSessionView/inSession.html");
        } else if (player && !sessionId) {
            // window.location.assign(
            //     "./../createSessionView/createSession.html"
            // );
        }
    }
}

function onButtonCreateClick(){
    chrome.runtime.sendMessage({ type: "startCreate" });
}


