import { tabSendMessage, getSessionId } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let infoCommand = { command: "info" };
    tabSendMessage(infoCommand)
        .then((response) => {
            if (response.page == "player") {
                // window.location.assign("./../loadingView/loading.html");
                getSessionId().then((result) => {
                    if (!result) {
                        if (response.address.includes("assistecomigo")) {
                            window.location.assign(
                                "./../loadingView/loading.html"
                            );
                        } else {
                            window.location.assign(
                                "./../createSessionView/createSession.html"
                            );
                        }
                    } else {
                        window.location.assign(
                            "./../inSessionView/inSession.html"
                        );
                    }
                });
            } else if (response.page == "homepage") {
                console.log("Already on homepage");
            } else {
                window.location.assign("./../errorView/error.html");
            }
        })
        .catch((error) => {
            chrome.runtime.sendMessage({ command: "log", error: error });
            window.location.assign("./../errorView/error.html");
        });
});
