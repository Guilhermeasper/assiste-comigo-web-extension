import {
    tabSendMessage,
    setSessionId,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let buttonCreate = document.getElementById("buttonCreate");
    buttonCreate.addEventListener("click", () => {
        tabSendMessage({ command: "createSession"}).then((response) => {
            if(response.type == "creation" && response.status == "completed"){
                window.location.assign("./../loadingView/loading.html");
            }else{
                window.location.assign("./../errorView/error.html");
            }
        });
    });
});
