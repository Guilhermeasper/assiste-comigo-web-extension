import {
    tabSendMessage,
    setSessionId,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let buttonCreate = document.getElementById("buttonCreate");
    buttonCreate.addEventListener("click", () => {
        let tempSessionId = Math.random().toString(36).substr(2, 9);
        setSessionId(tempSessionId);
        tabSendMessage({ command: "createSession", sessionId: tempSessionId }).then((response) => {
            if(response.result == "sessionCreated"){
                window.location.assign("./../inSessionView/inSession.html");
            }else{
                window.location.assign("./../errorView/error.html");
            }
        });
    });
});
