import { tabSendMessage, getSessionId } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let infoCommand = { command: "info" };
    let hideButton = document.getElementById("player");
    hideButton.addEventListener("click", () => {
        var newURL = `chrome-extension://${chrome.runtime.id}/player/index.html`;
        chrome.tabs.create({ url: newURL });
        console.log("Nova guia");
    })
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
});
