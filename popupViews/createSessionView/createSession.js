const buttonCreate = document.getElementById("buttonCreate");

chrome.runtime.onMessage.addListener(onMessage);
buttonCreate.addEventListener("click", onButtonCreateClick);

import {tabSendMessage} from './../../utils/utils.js';

/**
 * Listener from messages coming from the background
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
function onMessage(request, sender, response){
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

/**
 * Function fired when create button is clicked
 */
function onButtonCreateClick(){
    // chrome.runtime.sendMessage({ type: "startCreate" });
    tabSendMessage({type: "create"}).then((response) => {
        console.log(response);
    });
}


