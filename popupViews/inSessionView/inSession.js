import {
    tabSendMessage,
    copyToClipboard,
    setSessionId,
    getSessionId,
    removeSessionId,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    var idElement = document.getElementById("id");
    var urlCopyButton = document.getElementById("urlCopyButton");
    var disconnectButton = document.getElementById("disconnectButton");
    var infoCommand = { command: "info" };

    getSessionId().then((sessionId) => {
        idElement.textContent = sessionId;
        tabSendMessage(infoCommand).then((response) => {
            urlCopyButton.addEventListener(
                "click",
                copyToClipboard(response.url + `?pvt=${sessionId}`)
            );

            disconnectButton.addEventListener("click", () => {
                removeSessionId();
                window.location.assign("./../createSessionView/createSession.html");
            });
        });
    });
});
