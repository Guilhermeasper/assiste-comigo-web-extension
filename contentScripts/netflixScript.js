var assisteComigoId;
document.addEventListener("getInfo", function (request) {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const data = request.detail;
    const extensionId = data.extensionId;
    assisteComigoId = extensionId;
    let info = { player: false, url: document.location.href, time: undefined };

    if (playerSessionId.length > 0) {
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
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const extensionId = data.extensionId;
    if (playerSessionId.length > 0) {
        const data = { type: "disconnect" };
        chrome.runtime.sendMessage(extensionId, data, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("finishCreate", function (request) {
    console.log(request.detail);
    let video = document.querySelector("video");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const extensionId = data.extensionId;
    //console.log("Received create request");
    if (video) {
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        info.player = true;
        info.time = player.getCurrentTime();
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
    let video = document.querySelector("video");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const extensionId = data.extensionId;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    console.log("Received connect request");
    if (video) {
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        info.player = true;
        info.time = player.getCurrentTime();
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
    let video = document.querySelector("video");
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
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    console.log("Received info request");
    if (playerSessionId.length > 0) {
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        player.play();
    } else {
        console.log("Erro no play");
    }
});

document.addEventListener("pause", function (request) {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    console.log("Received info request");
    if (playerSessionId.length > 0) {
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        player.pause();
    } else {
        console.log("Erro no pause");
    }
});

document.addEventListener("seek", function (request) {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const data = request.detail;
    console.log("Received info request");
    if (playerSessionId.length > 0) {
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        player.seek(data.time);
    } else {
        console.log("Erro no seek");
    }
});

const playListener = function () {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId[0]);
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "play", time: player.getCurrentTime() },
        (response) => console.log(response)
    );
};

const pauseListener = function () {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId[0]);
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "pause", time: player.getCurrentTime() },
        (response) => console.log(response)
    );
};

const seekListener = function () {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId[0]);
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "seek", time: player.getCurrentTime() },
        (response) => console.log(response)
    );
};
