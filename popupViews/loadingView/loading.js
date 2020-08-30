import {
    tabSendMessage,
    getSessionId,
    setSessionId,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        getSessionId().then((result) => {
            if (result) {
                window.location.assign("./../inSessionView/inSession.html");
            } else {
                var infoCommand = { command: "info" };
                tabSendMessage(infoCommand).then((response) => {
                    let url = response.address;
                    let sessionId;
                    if (url.includes("assistecomigo=")) {
                        if (url.includes("?assistecomigo=")) {
                            sessionId = url.split("?assistecomigo=")[1];
                        } else {
                            sessionId = url.split("&assistecomigo=")[1];
                        }
                        console.log(`Session id from url is ${sessionId}`);
                        setSessionId(sessionId).then(() => {
                            let connectionCommand = {
                                command: "connection",
                            };
                            chrome.runtime.sendMessage(
                                connectionCommand,
                                (response) => {
                                    console.log(response);
                                }
                            );
                            window.location.assign(
                                "./../inSessionView/inSession.html"
                            );
                        });
                    }
                });
            }
        });

        chrome.runtime.onMessage.addListener((message, sender, response) => {
            if (message.command == "sessionReady") {
                window.location.assign("./../inSessionView/inSession.html");
            }
        });
    }, 2000);
});
