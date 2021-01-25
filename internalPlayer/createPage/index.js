document.addEventListener("DOMContentLoaded", () => {
    const createButton = document.getElementById("createButton");

    createButton.addEventListener("click", createButtonOnClickEvent);
});

const serverAddress = "https://assistecomigo.herokuapp.com";

async function createButtonOnClickEvent(){
    const videoInput = document.getElementById("videoFile");
    const videoPlayer = document.getElementById("videoPlayer");
    const subtitleInput = document.getElementById("subFile");
    const videoUrlNotFound = document.getElementById("videoUrlNotFound");
    const filePicker = document.getElementsByClassName("filePicker");
    let videoSource = document.getElementById("source");
    const URL = window.URL || window.webkitURL;
    let parsedVideoURL;
    try {
        parsedVideoURL = URL.createObjectURL(videoInput.files[0]);
    } catch (error){
        console.log(error);
        videoUrlNotFound.style.display = "inline-block";
        return;
    }
    try {
        const internalPlayerSubtitleURL = subtitleInput.files[0];
    } catch (error){
        console.log(error);
    }
    for (const element of filePicker) {
        element.style.display = "none";
    }
    videoSource.src = parsedVideoURL;
    videoPlayer.load();
    videoPlayer.style.display = "block";
}

async function saveToStorage(tagName, value){
    await chrome.storage.local.set({ [tagName]: value }, function () {
        console.log(`${tagName} value is set to ${value}`);
        console.log(value);
    });
}

function readFromStorage(tagName){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([tagName], function(result) {
            resolve(result[tagName]);
        });
    });
}

async function getIdFromServer(){
    let temporarySocket = io.connect(serverAddress, {
        transports: ["websocket"],
    });
    const userId = await readFromStorage("userId");
    temporarySocket.on("sessionCreated", async (data) => {
        console.log(`The user created by server is ${data.newId}`);
        await saveToStorage("sessionId", data.newId);
    });
    temporarySocket.emit("create", {userId: userId});
}
