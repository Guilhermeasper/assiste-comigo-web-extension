import { tabSendMessage, getSessionId } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    getSessionId().then((result) => {
        if (result) {
            window.location.assign("./../inSessionView/inSession.html");
        } else {
            window.location.assign("./../loadingView/loading.html");
        }
    });
});
