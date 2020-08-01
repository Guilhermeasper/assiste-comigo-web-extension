import { tabSendMessage, getSessionId } from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let infoCommand = { command: "info" };
    tabSendMessage(infoCommand).then((response) => {
        console.log(response);
        if (response.page == "player") {
            getSessionId().then((result) => {
                if(!result){
                    if (response.address.includes("assistecomigo")) {
                        window.location.assign(
                            "./../inSessionView/inSession.html"
                        );
                    } else {
                        window.location.assign(
                            "./../createSessionView/createSession.html"
                        );
                    }
                }else{
                    window.location.assign("./../inSessionView/inSession.html");
                }
            });
        } else if (response.page == "homepage") {
            console.log("Already on homepage");
        } else {
            window.location.assign("./../errorView/error.html");
        }
    });
});
