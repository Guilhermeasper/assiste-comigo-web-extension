document.addEventListener("DOMContentLoaded", DOMContentLoaded);

function DOMContentLoaded(){

    const createButton = document.getElementById("createButton");
    const joinButton = document.getElementById("joinButton");
    createButton.addEventListener("click", createButtonClick);
    joinButton.addEventListener("click", joinButtonClick);
}

function createButtonClick(){

    window.location.assign("./../createPage/index.html");
}

function joinButtonClick(){
    
    window.location.assign("./../joinPage/index.html");
}