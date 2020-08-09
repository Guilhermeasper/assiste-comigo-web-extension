import {
    tabSendMessage,
    setSessionId,
} from "./../../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let buttonCreate = document.getElementById("buttonCreate");
    buttonCreate.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "createSession"}, (response) => {
            if(response.type == "creation" && response.status == "completed"){
                console.log("Criado");
                window.location.assign("./../loadingView/loading.html");
            }else{
                window.location.assign("./../errorView/error.html");
            }
        });
    });
    
});
