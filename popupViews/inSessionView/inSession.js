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
        window.location.assign("./../homepageView/homepage.html");
    });

    getSessionId().then((storageSessionId) => {
        if (storageSessionId) {
            console.log("Already have a Session id");

            tabSendMessage(infoCommand).then((response) => {
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
        }
    });
});
