import {
    tabSendMessage,
    getSessionId,
    setSessionId,
} from "../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({
        type: "startConnect",
    });

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const type = request.type;
        if(type == "startConnect"){
            chrome.runtime.sendMessage({type: "finishConnect"});
            return;
        }
        if (type == "finishConnect") {
            window.location.assign("./../inSessionView/inSession.html");
        }
    });
});
