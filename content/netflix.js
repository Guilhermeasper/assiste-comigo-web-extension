var assisteComigoId;
var serverSeek = false;
var serverPlay = false;
var serverPause = false;

document.addEventListener("init", function (request) {
    console.log("Initializing youtube module");
    const contentRequestData = request.detail;
    const extensionId = contentRequestData.extensionId;
    console.log(`Extension ID:${extensionId}`);
    assisteComigoId = extensionId;
});

document.addEventListener("getInfo", function (request) {
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const player = getNetflixPlayer();
    console.log(player);
    if (player) {
        info.player = true;
        info.time = player.getCurrentTime();
        const newData = { ...data, ...info };
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    } else {
        const newData = { ...data, ...info };
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    }
});

// window.addEventListener("popstate", function (event) {
//     const player = getNetflixPlayer();
//     if (player) {
//         const data = { type: "disconnect" };
//         chrome.runtime.sendMessage(assisteComigoId, data, (response) =>
//             console.log(response)
//         );
//     }
// });

document.addEventListener("finishCreate", function (request) {
    console.log(request.detail);
    let video = document.querySelector("video");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const player = getNetflixPlayer();
    //console.log("Received create request");
    if (video) {
        info.player = true;
        info.time = player.getCurrentTime();
        const newData = { ...data, ...info };
        video.addEventListener("play", playListener);
        video.addEventListener("pause", pauseListener);
        video.addEventListener("seeking", seekListener);
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    } else {
        info.player = false;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("startConnect", function (request) {
    const data = request.detail;
    let info = { url: document.location.href };
    const newData = { ...data, ...info };
    chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
        console.log(response)
    );
    console.log("Received connect request");
});

document.addEventListener("finishConnect", function (request) {
    let video = document.querySelector("video");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const player = getNetflixPlayer();
    console.log("Received connect request");
    if (video) {
        info.player = true;
        info.time = player.getCurrentTime();
        const newData = { ...data, ...info };
        video.addEventListener("play", playListener);
        video.addEventListener("pause", pauseListener);
        video.addEventListener("seeking", seekListener);
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    } else {
        info.player = false;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("disconnect", function (request) {
    let video = document.querySelector("video");
    const data = request.detail;
    let info = { player: false, url: document.location.href };
    console.log("Received disconnect request");
    if (video) {
        info.player = true;
        const newData = { ...data, ...info };
        video.removeEventListener("play", playListener);
        video.removeEventListener("pause", pauseListener);
        video.removeEventListener("seeked", seekListener);
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    } else {
        info.player = false;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(assisteComigoId, newData, (response) =>
            console.log(response)
        );
    }
});

document.addEventListener("play", function (request) {
    const player = getNetflixPlayer();
    console.log("Received info request");
    if (player) {
        serverPlay = true;
        player.play();
    } else {
        console.log("Erro no play");
    }
});

document.addEventListener("pause", function (request) {
    const player = getNetflixPlayer();
    console.log("Received info request");
    if (player) {
        serverPause = true;
        player.pause();
    } else {
        console.log("Erro no pause");
    }
});

document.addEventListener("seek", function (request) {
    const player = getNetflixPlayer();
    const data = request.detail;
    console.log("Received info request");
    if (player) {
        serverSeek = true;
        player.seek(data.time);
    } else {
        console.log("Erro no seek");
    }
});

const playListener = function () {
    const player = getNetflixPlayer();
    if (!serverPlay) {
        chrome.runtime.sendMessage(
            assisteComigoId,
            { type: "listenerPlay", time: player.getCurrentTime() },
            (response) => console.log(response)
        );
    }
    serverPlay = false;
};

const pauseListener = function () {
    const player = getNetflixPlayer();
    if (!serverPlay) {
        chrome.runtime.sendMessage(
            assisteComigoId,
            { type: "listenerPause", time: player.getCurrentTime() },
            (response) => console.log(response)
        );
    }
    serverPause = false;
};

const seekListener = function () {
    const player = getNetflixPlayer();
    if (!serverSeek) {
        chrome.runtime.sendMessage(
            assisteComigoId,
            { type: "listenerSeek", time: player.getCurrentTime() },
            (response) => console.log(response)
        );
    }
    serverSeek = false;
};

function getNetflixPlayer() {
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
        .videoPlayer;
    const playerSessionId = videoPlayer.getAllPlayerSessionIds();
    const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId[0]);
    return player;
}
