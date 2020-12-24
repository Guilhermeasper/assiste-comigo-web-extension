var assisteComigoId;
const selector = ".video-stream";

document.addEventListener("getInfo", getInfo);
document.addEventListener("finishCreate", finishCreate);
document.addEventListener("startConnect", startConnect);
document.addEventListener("finishConnect", finishConnect);
document.addEventListener("disconnect", disconnect);
document.addEventListener("play", play);
document.addEventListener("pause", pause);
document.addEventListener("seek", seek);

function getInfo(request) {
    const video = document.querySelector(selector);
    const data = request.detail;
    const extensionId = data.extensionId;
    assisteComigoId = extensionId;
    let info = { player: false, url: document.location.href, time: undefined };
    if (video) {
        info.player = true;
        info.time = video.currentTime;
        const newData = { ...data, ...info };
        console.log(newData);
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    } else {
        const newData = { ...data, ...info };
        chrome.runtime.sendMessage(extensionId, newData, (response) =>
            console.log(response)
        );
    }
}

function finishCreate(request) {
    const video = document.querySelector(selector);
    const videoAds = document.querySelector(".video-ads");
    const data = request.detail;
    let info = { player: false, url: document.location.href, time: undefined };
    const extensionId = data.extensionId;

    if (video) {
        info.player = true;
        info.time = video.currentTime;
        const newData = { ...data, ...info };
        video.addEventListener("play", playListener);
        video.addEventListener("pause", pauseListener);
        video.addEventListener("seeking", seekListener);
        new ResizeObserver(videoAdsResize).observe(videoAds);
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
}

function startConnect(request) {
    const data = request.detail;
    let info = { url: document.location.href };
    const newData = { ...data, ...info };
    const extensionId = data.extensionId;
    chrome.runtime.sendMessage(extensionId, newData, (response) =>
        console.log(response)
    );
}

function finishConnect(request) {
    const video = document.querySelector(selector);
    const videoAds = document.querySelector(".video-ads");
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
        new ResizeObserver(videoAdsResize).observe(videoAds);
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
}

function disconnect(request) {
    const video = document.querySelector(selector);
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
}

function play(request) {
    const video = document.querySelector(selector);
    console.log("Received info request");
    if (video) {
        video.play();
    } else {
        console.log("Erro no play");
    }
}

function pause(request) {
    const video = document.querySelector(selector);
    console.log("Received info request");
    if (video) {
        video.pause();
    } else {
        console.log("Erro no pause");
    }
}

function seek(request) {
    const video = document.querySelector(selector);
    const data = request.detail;
    console.log("Received info request");
    if (video) {
        video.currentTime = data.time;
    } else {
        console.log("Erro no seek");
    }
}

function playListener() {
    const video = document.querySelector(selector);
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "play", time: video.currentTime },
        (response) => console.log(response)
    );
}

function pauseListener() {
    const video = document.querySelector(selector);
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "pause", time: video.currentTime },
        (response) => console.log(response)
    );
}

function seekListener() {
    const video = document.querySelector(selector);
    chrome.runtime.sendMessage(
        assisteComigoId,
        { type: "seek", time: video.currentTime },
        (response) => console.log(response)
    );
}

function videoAdsResize(){
    const video = document.querySelector(selector);
    const videoAds = document.querySelector(".video-ads");
    console.log(videoAdsRect);
    if(videoAdsRect.width + videoAdsRect.height > 0){
        console.log("Pausing for ad");
        chrome.runtime.sendMessage(
            assisteComigoId,
            { type: "pause", time: video.currentTime },
            (response) => console.log(response)
        );
    }else{
        console.log("Playing after ad");
        chrome.runtime.sendMessage(
            assisteComigoId,
            { type: "play", time: video.currentTime },
            (response) => console.log(response)
        );
    }
}
