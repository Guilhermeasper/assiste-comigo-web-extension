import { copyToClipboard, clearInfo } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    var urlCopyButton = document.getElementById("urlCopyButton");
    var disconnectButton = document.getElementById("disconnectButton");

    chrome.runtime.sendMessage({ type: "info" }, (response) => {
        console.log(response);
    });

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const player = request.player;
        const userId = request.userId;
        const sessionId = request.sessionId;
        const sessionUrl = request.sessionUrl;
        if (userId && player && sessionId) {
            urlCopyButton.addEventListener(
                "click",
                copyToClipboard(sessionUrl)
            );
        } else {
            window.location.assign("./../errorView/error.html");
        }
    });

    disconnectButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "disconnect" }, (response) => {
            console.log(response);
        });
        window.location.assign("./../homepageView/homepage.html");
    });
});
