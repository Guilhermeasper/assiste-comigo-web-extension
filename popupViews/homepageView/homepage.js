import { tabSendMessage } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let infoCommand = { command: "info" };
    tabSendMessage(infoCommand).then((response) => {
        console.log(response);
        if (response.page == "playerWithoutId") {
            window.location.assign("./../createSessionView/createSession.html");
        } else if (response.page == "playerWithtId") {
            window.location.assign("./../inSessionView/inSession.html");
        } else {
            window.location.assign("./../errorView/error.html");
        }
    });
});
