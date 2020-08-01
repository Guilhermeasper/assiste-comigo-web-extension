import {
    tabSendMessage,
    copyToClipboard,
    setSessionId,
    getSessionId,
    removeSessionId,
    getTabUrl,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    var idElement = document.getElementById("id");
    var urlCopyButton = document.getElementById("urlCopyButton");
    var disconnectButton = document.getElementById("disconnectButton");
    var infoCommand = { command: "info" };
    var connectionCommand;

    disconnectButton.addEventListener("click", () => {
        tabSendMessage({command: "disconnect"}).then((response) => {
            console.log(response);
        });
        removeSessionId();
        window.location.assign("./../createSessionView/createSession.html");
    });

    getSessionId().then((sessionId) => {
        if (sessionId) {
            idElement.textContent = sessionId;

            tabSendMessage(infoCommand).then((response) => {
                console.log(response);
                urlCopyButton.addEventListener(
                    "click",
                    copyToClipboard(
                        response.address + `&assistecomigo=${sessionId}`
                    )
                );
            });
        } else {
            getTabUrl().then((response) => {
                let sessionId;
                if(response.url.includes("?")){
                    sessionId = response.url.split("&assistecomigo=")[1];
                    urlCopyButton.addEventListener(
                        "click",
                        copyToClipboard(
                            response.address + `&assistecomigo=${sessionId}`
                        )
                    );
                }else{
                    sessionId = response.url.split("?assistecomigo=")[1];
                    urlCopyButton.addEventListener(
                        "click",
                        copyToClipboard(
                            response.address + `?assistecomigo=${sessionId}`
                        )
                    );
                }
                setSessionId(sessionId);
                connectionCommand = {
                    command: "connection",
                };
                idElement.textContent = sessionId;

                tabSendMessage(connectionCommand).then((response) => {
                    console.log(response);
                    
                });
            });
        }
    });
});
