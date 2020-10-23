var assisteComigoId;
document.addEventListener("info", function (request) {
    const video = document.querySelector(".video-stream");
    const data = request.detail;
    const extensionId = data.extensionId;
    assisteComigoId = extensionId;
    let info = { player: false, url: document.location.href, time: undefined };
    //console.log("Received info request");
    if (video) {
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        info.player = true;
        info.time = player.getCurrentTime();
        const newData = { ...data, ...info };
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    } else {
        const newData = { ...data, ...info };
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    }
});

window.addEventListener("popstate", function (event) {
    const video = document.querySelector(".video-stream");
    const extensionId = data.extensionId;
    if (video) {
        const data = { type: "disconnect" };
        chrome.runtime.sendMessage(extensionId, data, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("finishCreate", function (request) {
    const video = document.querySelector(".video-stream");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const extensionId = data.extensionId;
    //console.log("Received create request");
    if (video) {
        info.player = true;
        info.time = video.currentTime;
        const newData = { ...data, ...info };
        video.addEventListener("play", playListener);
        video.addEventListener("pause", pauseListener);
        video.addEventListener("seeking", seekListener);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    } else {
        info.player = false;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("startConnect", function (request) {
    const data = request.detail;
    let info = { url: document.location.href };
    const newData = { ...data, ...info };
    const extensionId = data.extensionId;
    chrome.runtime.sendMessage(extensionId, newData, (response) =>
        console.log(response)
    );
    console.log("Received connect request");
});

document.addEventListener("finishConnect", function (request) {
    const video = document.querySelector(".video-stream");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    console.log("Received connect request");
    if (video) {
        info.player = true;
        info.time = video.currentTime;
        const newData = { ...data, ...info };
        video.addEventListener("play", playListener);
        video.addEventListener("pause", pauseListener);
        video.addEventListener("seeking", seekListener);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    } else {
        info.player = false;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("disconnect", function (request) {
    const video = document.querySelector(".video-stream");
    const data = request.detail;
    let info = { player: false, url: document.location.href };
    const extensionId = data.extensionId;
    console.log("Received disconnect request");
    if (video) {
        info.player = true;
        const newData = { ...data, ...info };
        video.removeEventListener("play", playListener);
        video.removeEventListener("pause", pauseListener);
        video.removeEventListener("seeked", seekListener);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    } else {
        info.player = false;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("play", function (request) {
    const video = document.querySelector(".video-stream");
    console.log("Received info request");
    if (video) {
        video.play();
    } else {
        console.log("Erro no play");
    }
});

document.addEventListener("pause", function (request) {
    const video = document.querySelector(".video-stream");
    console.log("Received info request");
    if (video) {
        video.pause();
    } else {
        console.log("Erro no pause");
    }
});

document.addEventListener("seek", function (request) {
    const video = document.querySelector(".video-stream");
    const data = request.detail;
    console.log("Received info request");
    if (video) {
        video.currentTime = data.time;
    } else {
        console.log("Erro no seek");
    }
});

const playListener = function () {
    const video = document.querySelector(".video-stream");
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "play", time: video.currentTime },
        (response) => console.log(response)
    );
};

const pauseListener = function () {
    const video = document.querySelector(".video-stream");
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "pause", time: video.currentTime },
        (response) => console.log(response)
    );
};

const seekListener = function () {
    const video = document.querySelector(".video-stream");
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "seek", time: video.currentTime },
        (response) => console.log(response)
    );
};
