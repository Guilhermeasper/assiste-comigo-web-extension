import {
    tabSendMessage,
    copyToClipboard,
    setSessionId,
    getSessionId,
    removeSessionId,
    getTabUrl,
    genericSendMessage,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    var idElement = document.getElementById("id");
    var urlCopyButton = document.getElementById("urlCopyButton");
    var disconnectButton = document.getElementById("disconnectButton");
    var infoCommand = { command: "info" };
    var connectionCommand;

    disconnectButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "disconnect" }, (response) => {
            console.log(response);
        });
        removeSessionId();
        window.location.assign("./../createSessionView/createSession.html");
    });

    getSessionId().then((storageSessionId) => {
        if (storageSessionId) {
            console.log("Already have a Session id");

            tabSendMessage(infoCommand).then((response) => {
                idElement.textContent = storageSessionId;
                let url = response.address;
                if (url.includes("assistecomigo=")) {
                    urlCopyButton.addEventListener(
                        "click",
                        copyToClipboard(url)
                    );
                } else {
                    if (url.includes("?")) {
                        urlCopyButton.addEventListener(
                            "click",
                            copyToClipboard(`${url}&assistecomigo=${storageSessionId}`)
                        );
                    } else {
                        urlCopyButton.addEventListener(
                            "click",
                            copyToClipboard(`${url}?assistecomigo=${storageSessionId}`)
                        );
                    }
                }
            });
        } else {
            window.location.assign("./../errorView/error.html");
            // console.log("Doesn't have a Session id");
            // getTabUrl().then((url) => {
            //     let sessionId;
            //     let connectionCommand = {
            //         command: "connection",
            //     };
            //     if (url.includes("assistecomigo=")) {
            //         if (url.includes("?assistecomigo=")) {
            //             sessionId = url.split("?assistecomigo=")[1];
            //         } else {
            //             sessionId = url.split("&assistecomigo=")[1];
            //         }
            //         console.log(`Session id from url is ${sessionId}`);
            //         idElement.textContent = sessionId;
            //         setSessionId(sessionId).then(() => {
            //             urlCopyButton.addEventListener(
            //                 "click",
            //                 copyToClipboard(url)
            //             );
            //             chrome.runtime.sendMessage(
            //                 connectionCommand,
            //                 (response) => {
            //                     console.log(response);
            //                 }
            //             );
            //         });
            //     }
            // });
        }
    });
});
