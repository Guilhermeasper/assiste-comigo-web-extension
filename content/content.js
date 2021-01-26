const socket = new Socket();

const contentScriptsOptions = {
    "www.primevideo.com": primevideoScript,
    "www.anitube.site": anitubeScript,
    "www.youtube.com": youtubeScript,
    "www.viki.com": vikiScript,
    "vimeo.com": vimeoScript,
    "www.crunchyroll.com": crunchyrollScript,
    "www.netflix.com": netflixScript,
    "tv.apple.com": appleTVScript
};

document.addEventListener("DOMContentLoaded", domLoaded());

function domLoaded() {

    console.log("Main content script loaded");
    const pageHost = getPageHost();
    chrome.runtime.onMessage.addListener(onMessage);
    contentScriptsOptions[pageHost]();
}

function onMessage(request, sender, response) {
    console.log(`New Message Arrived:`);
    console.log(request);
    const type = request.type;
    
    const onMessageCommands = {
        startCreate: startCreate.bind(this, request, response),
        startConnect: startConnect.bind(this, request, response),
        listenerPlay: listenerPlay.bind(this, request, response),
        listenerPause: listenerPause.bind(this, request, response),
        listenerSeek: listenerSeek.bind(this, request, response),
        disconnect: disconnect.bind(this, request, response),
    };
    try {
        onMessageCommands[type]();
    } catch (error) {
        console.log(error)
    }
    document.dispatchEvent(new CustomEvent(type, { detail: request }));
    response({ code: 200 });
    return true;
}

async function startCreate() {
    let userId = await getUserId();
    let packet = {
        userId: userId,
    };
    await socket.connect();
    socket.addSocketListeners();
    socket.emitCommand("create", packet);
}

async function startConnect() {
    let userId = await getUserId();
    const sessionId = getSessionIdFromURL();
    await setSessionId(sessionId);
    let packet = {
        userId: userId,
        sessionId: sessionId,
    };
    await socket.connect();
    socket.addSocketListeners();
    socket.emitCommand("join", packet);
}

async function listenerPlay(request, response) {
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("play", packet);
}
async function listenerPause(request, response) {
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("pause", packet);
}
async function listenerSeek(request, response) {
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("seek", packet);
}

async function disconnect(){
    await socket.disconnect();
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
    injectScript("content/netflix.js");
    console.log("Netflix");
}

function anitubeScript() {
    injectScript("content/anitube.js");
    console.log("Anitube");
}

function primevideoScript() {
    injectScript("content/primevideo.js");
    console.log("Primevideo");
}

function appleTVScript() {
    injectScript("content/appletv.js");
    console.log("AppleTV");
}

function getPageHost() {
    let pageHost = document.location.host;
    return pageHost ?? "unknown";
}

function getPageUrl() {
    let pageUrl = document.location.href;
    return pageUrl;
}

function getSessionIdFromURL(){
    let url = document.location.href.split("?")[1];
    const urlParams = new URLSearchParams(url);
    const sessionId = urlParams.get("assistecomigo");
    return sessionId;
}