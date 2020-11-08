var serverSeek = false;
var serverPlay = false;
var serverPause = false;
var socket;
var videoElement;

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
        "www.netflix.com": netflixScript
    };
    let pageHost = getPageHost();

    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const type = request.type;
        console.log(`Request: ${type}`);
        document.dispatchEvent(new CustomEvent(type, { detail: request }));
        response({ code: 200 });
        return true;
    });

    contentScriptsOptions[pageHost]();
}

function vimeoScript() {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/vimeo.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("Vimeo");
}

function crunchyrollScript() {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/crunchyroll.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("Crunchyroll");
}

function vikiScript() {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/viki.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("Viki");
}

function youtubeScript() {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/youtube.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("Youtube");
}

function netflixScript() {
    console.log("Netflix");
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/netflix.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function anitubeScript() {
    console.log("Anitube");
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/anitube.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function primevideoScript() {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("content/primevideo.js");
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
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



