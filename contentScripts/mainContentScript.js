var serverSeek = false;
var serverPlay = false;
var serverPause = false;
var socket;
var videoElement;

document.addEventListener("DOMContentLoaded", domLoaded());

function domLoaded() {
    console.log("Main content script loaded");

    let contentScriptsOptions = {
        "www.primevideo.com": {
            main: primevideoScript,
            getVideo: getPrimeVideo,
            info: getInfo,
            play: html5VideoPlay,
            pause: html5VideoPause,
            seek: html5VideoSeek,
            addListeners: addVideoListeners,
            delListeners: removeVideoListeners,
        },
        "www.anitube.site": {
            main: anitubeScript,
            getVideo: getAnitubeVideo,
            info: getInfo,
            play: html5VideoPlay,
            pause: html5VideoPause,
            seek: html5VideoSeek,
            addListeners: addVideoListeners,
            delListeners: removeVideoListeners,
        },
        "www.youtube.com": {
            main: youtubeScript,
        },
        "www.viki.com": {
            main: vikiScript,
            getVideo: getVikiVideo,
            info: getInfo,
            play: html5VideoPlay,
            pause: html5VideoPause,
            seek: html5VideoSeek,
            addListeners: addVideoListeners,
            delListeners: removeVideoListeners,
        },
        "vimeo.com": {
            main: vimeoScript,
            getVideo: getVimeoVideo,
            info: getInfo,
            play: html5VideoPlay,
            pause: html5VideoPause,
            seek: html5VideoSeek,
            addListeners: addVideoListeners,
            delListeners: removeVideoListeners,
        },
        "www.crunchyroll.com": {
            main: crunchyrollScript,
            getVideo: getCrunchyrollVideo,
            info: getInfo,
            play: html5VideoPlay,
            pause: html5VideoPause,
            seek: html5VideoSeek,
            addListeners: addVideoListeners,
            delListeners: removeVideoListeners,
        },
        "www.netflix.com": {
            main: netflixScript,
        },
    };
    let pageHost = getPageHost();

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const type = request.type;
        console.log(`Request: ${type}`);
        document.dispatchEvent(new CustomEvent(type, { detail: request }));
        response({ code: 200 });
        return true;
    });

    contentScriptsOptions[pageHost].main();
}

function vimeoScript() {
    console.log("Vimeo");
}

function crunchyrollScript() {
    console.log("Crunchyroll");
}

function vikiScript() {
    console.log("Viki");
}

function youtubeScript() {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("contentScripts/youtube.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("Youtube");
}

function netflixScript() {
    console.log("Netflix");
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("contentScripts/netflixScript.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function anitubeScript() {
    console.log("Anitube");
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("contentScripts/anitubeScript.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function primevideoScript() {
    $(document).click((event) => {
        if (document.querySelectorAll(".dv-player-fullscreen").length == 0) {
            video =
                "https://www.primevideo.com" +
                $(event.target).parent().parent().parent().attr("href");
            console.log(video);
        } else if (
            $(event.target)
                .parent()
                .parent()
                .attr("class")
                .toString()
                .includes("closeButtonWrapper")
        ) {
            chrome.storage.local.remove(["sessionId"], function () {
                console.log("SID removed");
            });
        }
    });
}

var html5VideoPauseListerner = function (event) {
    if (!serverPause) {
        chrome.runtime.sendMessage({
            command: "pause",
            time: videoElement.currentTime,
        });
    }
    serverPause = false;
};

var html5VideoPlayListerner = function (event) {
    if (!serverPlay) {
        chrome.runtime.sendMessage({
            command: "play",
            time: videoElement.currentTime,
        });
    }
    serverPlay = false;
};
var html5VideoSeekListerner = function (event) {
    if (!serverSeek) {
        chrome.runtime.sendMessage({
            command: "seek",
            time: videoElement.currentTime,
        });
    }
    serverPlay = false;
};

function addVideoListeners() {
    videoElement.addEventListener("pause", html5VideoPauseListerner, false);
    videoElement.addEventListener("play", html5VideoPlayListerner, false);
    videoElement.addEventListener("seeking", html5VideoSeekListerner, false);
}

function removeVideoListeners() {
    videoElement.removeEventListener("pause", html5VideoPauseListerner, false);
    videoElement.removeEventListener("play", html5VideoPlayListerner, false);
    videoElement.removeEventListener("seeking", html5VideoSeekListerner, false);
}

function getHtml5VideoElement() {
    const videos = document.querySelectorAll("video");
    for (video of videos) {
        if (video.src.includes("blob")) {
            return video;
        }
    }
    return undefined;
}

function getYoutubeVideo() {
    const video = document.querySelector(".video-stream");
    return video;
}

//Not working
function getCrunchyrollVideo() {
    console.log("Trying to get crunchyroll video");
    $("#vilos-player").toggle();
    const video = document.querySelector("#player0");
    console.log(video);
    return video;
}

function getAnitubeVideo() {
    const video = document.querySelector(".jw-video");
    return video;
}

function getVimeoVideo() {
    const video = document.querySelector(
        "div.vp-video-wrapper > div.vp-video > div > video"
    );
    return video;
}

function getVikiVideo() {
    const video = document.querySelector("#html5_player_id_Shaka_api");
    return video;
}

function getPrimeVideo() {
    const video = document.querySelector(
        "#dv-web-player > div > div:nth-child(1) > div > div > div.scalingVideoContainer > div.scalingVideoContainerBottom > div > video"
    );
    return video;
}

function getPageHost() {
    let pageHost = document.location.host;
    return pageHost ?? "unknown";
}

function getPageUrl() {
    let pageUrl = document.location.href;
    return pageUrl;
}

function getInfo(getVideo) {
    let info;
    videoElement = getVideo();
    if (!videoElement) {
        info = {
            page: "homepage",
            address: document.location.href,
        };
    } else {
        info = {
            page: "player",
            address: document.location.href,
        };
    }
    return info;
}

function getCrunchyrollInfo(getVideo) {
    var info;
    videoElement = getVideo();
    console.log("Should get the video");
    console.log(videoElement);
    if (!videoElement) {
        info = {
            page: "homepage",
            address: document.location.href,
            type: "information",
            status: "completed",
        };
    } else {
        info = {
            page: "player",
            address: document.location.href,
            type: "information",
            status: "completed",
        };
    }
    return info;
}

function genericSendMessage(msg) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(msg, () => {
            console.log(msg);
            resolve(msg);
        });
    });
}

function html5VideoPlay() {
    serverPlay = true;
    videoElement.play();
}

function html5VideoPause() {
    serverPause = true;
    videoElement.pause();
}

function html5VideoSeek(time) {
    serverSeek = true;
    videoElement.currentTime = time;
}
