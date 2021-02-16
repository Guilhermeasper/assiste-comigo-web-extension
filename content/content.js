const socket = new Socket();
var sessionIdFromURL;
var currentTabId;
const contentScriptsOptions = {
    "www.primevideo.com": "primevideo",
    "www.anitube.site": "anitube",
    "www.youtube.com": "youtube",
    "www.viki.com": "viki",
    "vimeo.com": "vimeo",
    "www.crunchyroll.com": "crunchyroll",
    "www.netflix.com": "netflix",
    "tv.apple.com": "appletv",
    "goyabu.com": "goyabu",
    "mubi.com": "mubi"
};

document.addEventListener("DOMContentLoaded", domLoaded());
chrome.runtime.onMessage.addListener(onMessage);

async function domLoaded() {
    const pageHost = getPageHost();
    const currentSite = contentScriptsOptions[pageHost];
    sessionIdFromURL = getSessionIdFromURL();
    injectHtmlVideoControllerScript(currentSite);
}

function onMessage(request, sender, response) {
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
    } catch (error) {}
    document.dispatchEvent(new CustomEvent(type, { detail: request }));
    response({ code: 200 });
    return true;
}

async function startCreate() {
    let userId = await getFromSyncStorage("userId");
    let packet = {
        userId: userId,
    };
    await socket.connect();
    socket.addSocketListeners();
    socket.emitCommand("create", packet);
}

async function startConnect() {
    let userId = await getFromSyncStorage("userId");
    const sessionId =
        (await getFromSyncStorage("sessionId")) || getSessionIdFromURL();
    await setToSyncStorage("sessionId", sessionId);
    let packet = {
        userId: userId,
        sessionId: sessionId,
    };
    await socket.connect();
    socket.addSocketListeners();
    socket.emitCommand("join", packet);
}

async function listenerPlay(request, response) {
    let userId = await getFromSyncStorage("userId");
    let sessionId = await getFromSyncStorage("sessionId");
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("play", packet);
}
async function listenerPause(request, response) {
    let userId = await getFromSyncStorage("userId");
    let sessionId = await getFromSyncStorage("sessionId");
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("pause", packet);
}
async function listenerSeek(request, response) {
    let userId = await getFromSyncStorage("userId");
    let sessionId = await getFromSyncStorage("sessionId");
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("seek", packet);
}

async function disconnect() {
    await socket.disconnect();
}

function injectHtmlVideoControllerScript(scriptName) {
    var s = document.createElement("script");
    const url = `content/htmlVideoController.js`;
    s.src = chrome.runtime.getURL(url);
    s.onload = function () {
        injectScript(scriptName);
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

function injectScript(scriptName) {
    var s = document.createElement("script");
    const url = `content/${scriptName}.js`;
    s.src = chrome.runtime.getURL(url);
    s.onload = async function () {
        chrome.runtime.sendMessage({ type: "init" });
    };
    (document.head || document.documentElement).appendChild(s);
}

function getPageHost() {
    let pageHost = document.location.host;
    return pageHost ?? "unknown";
}

function getPageUrl() {
    let pageUrl = document.location.href;
    return pageUrl;
}

function getSessionIdFromURL() {
    let url = document.location.href.split("?")[1];
    const urlParams = new URLSearchParams(url);
    const sessionId = urlParams.get("assistecomigo");
    return sessionId;
}
