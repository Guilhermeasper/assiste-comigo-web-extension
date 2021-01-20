var serverSeek = false;
var serverPlay = false;
var serverPause = false;
var videoElement;
var globalResponse;
const socket = new Socket();

document.addEventListener("DOMContentLoaded", domLoaded());

function domLoaded() {
    console.log("Main content script loaded");
    let contentScriptsOptions = {
        "www.primevideo.com": primevideoScript,
        "www.anitube.site": anitubeScript,
        "www.youtube.com": youtubeScript,
        "www.viki.com": vikiScript,
        "vimeo.com": vimeoScript,
        "www.crunchyroll.com": crunchyrollScript,
        "www.netflix.com": netflixScript,
    };

    let pageHost = getPageHost();

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const type = request.type;
        console.log(request);
        if (type == "create") {
            (async () => {
                let userId = await getUserId();
                let packet = {
                    userId: userId,
                };
                await socket.connect();
                socket.addSocketListeners();
                socket.emitCommand("create", packet);
            })();
        } else if (type == "listenerPlay") {
            (async () => {
                let userId = await getUserId();
                let sessionId = await getSessionId();
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                    time: request.time,
                };
                socket.emitCommand("play", packet);
            })();
        }else if (type == "listenerPause") {
            (async () => {
                let userId = await getUserId();
                let sessionId = await getSessionId();
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                    time: request.time,
                };
                socket.emitCommand("pause", packet);
            })();
        }else if (type == "listenerSeek") {
            (async () => {
                let userId = await getUserId();
                let sessionId = await getSessionId();
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                    time: request.time,
                };
                socket.emitCommand("seek", packet);
            })();
        }else if(type == "startConnect"){
            (async () => {
                let userId = await getUserId();
                let url = document.location.href.split('?')[1];
                const urlParams = new URLSearchParams(url);
                const sessionId = urlParams.get("assistecomigo");
                await setSessionId(sessionId);
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                };
                await socket.connect();
                socket.addSocketListeners();
                socket.emitCommand("join", packet);
            })();
        }
        console.log(`Request: ${type}`);
        document.dispatchEvent(new CustomEvent(type, { detail: request }));
        response({ code: 200 });
        return true;
    });

    contentScriptsOptions[pageHost]();
}

function injectScript(url) {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL(url);
    s.onload = function () {
        this.remove();
        chrome.runtime.sendMessage({ type: "init" });
    };
    (document.head || document.documentElement).appendChild(s);
}

function vimeoScript() {
    injectScript("content/vimeo.js");
    console.log("Vimeo");
}

function crunchyrollScript() {
    injectScript("content/crunchyroll.js");
    console.log("Crunchyroll");
}

function vikiScript() {
    injectScript("content/viki.js");
    console.log("Viki");
}

function youtubeScript() {
    injectScript("content/youtube.js");
    console.log("Youtube");
}

function netflixScript() {
    injectScript("content/youtube.js");
    console.log("Netflix");
}

function anitubeScript() {
    injectScript("content/anitube.js");
    console.log("Anitube");
}

function primevideoScript() {
    injectScript("content/primevideo.js");
    console.log("Primevideo");
    // $(document).click((event) => {
    //     if (document.querySelectorAll(".dv-player-fullscreen").length == 0) {
    //         video =
    //             "https://www.primevideo.com" +
    //             $(event.target).parent().parent().parent().attr("href");
    //         console.log(video);
    //     } else if (
    //         $(event.target)
    //             .parent()
    //             .parent()
    //             .attr("class")
    //             .toString()
    //             .includes("closeButtonWrapper")
    //     ) {
    //         chrome.storage.local.remove(["sessionId"], function () {
    //             console.log("SID removed");
    //         });
    //     }
    // });
}

//Not working
function getCrunchyrollVideo() {
    console.log("Trying to get crunchyroll video");
    $("#vilos-player").toggle();
    const video = document.querySelector("#player0");
    console.log(video);
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
