var serverSeek = false;
var serverPlay = false;
var serverPause = false;
var socket;
var html5VideoElement;
document.addEventListener("DOMContentLoaded", domLoaded());

function domLoaded() {
    console.log("Main content script loaded");
    
    let contentScriptsOptions = {
        "www.primevideo.com": primevideoScript,
        "www.anitube.site": anitubeScript,
        "www.youtube.com": youtubeScript,
        "www.viki.com": vikiScript,
        "www.netflix.com": netflixScript,
    };
    let pageHost = getPageHost();

    var videoUrl;

    chrome.runtime.onMessage.addListener((message, sender, response) => {
        console.log(`Message`);
        console.log(message);

        if (message.command == "info") {
            var info;
            html5VideoElement = getHtml5VideoElement();
            if (!html5VideoElement) {
                info = { page: "homepage", address: document.location.href, type: "information", status: "completed"};
            } else {
                info = { page: "player", address: document.location.href, type: "information", status: "completed"};
            }
            response(info);
            return true;
        } else if (message.command == "createSession") {
            html5VideoElement = getHtml5VideoElement();
            serverConnection();
            addSocketListeners();
            addVideoListeners();
            createSession();
            response({ page: "player", address: document.location.href, type: "creation", status: "completed"});
        } else if (message.command == "connection") {
            html5VideoElement = getHtml5VideoElement();
            serverConnection();
            addSocketListeners();
            addVideoListeners();
            connectSession();
            response({ page: "player", address: document.location.href, type: "connection", status: "completed"});
        } else if (message.command == "disconnect") {
            socket.emit("leaveSession", { id: message.sessionId });
            removeVideoListeners();
            socket.disconnect();
            response({ page: "player", address: document.location.href, type: "disconnection", status: "completed"});
        } else{
            response({ page: "undentified", address: document.location.href, type: "none", status: "unknown"});
        }
        return true;
    });

    contentScriptsOptions[pageHost]();
}

function anitubeScript() {
    console.log("Anitube");
}

function vikiScript() {
    console.log("Viki");
}

function youtubeScript() {
    console.log("Youtube");
}

function netflixScript() {
    console.log("Netflix");
}

function primevideoScript() {
    $(document).click((event) => {
        if (document.querySelectorAll(".dv-player-fullscreen").length == 0) {
            video =
                "https://www.primevideo.com" +
                $(event.target).parent().parent().parent().attr("href");
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

function serverConnection() {
    socket = io.connect("https://guilhermeasper.com.br:443");
}

function createSession() {
    getUserId().then((userId) => {
        socket.emit("create", {
            userId: userId,
        });
    });
}

function connectSession() {
    getUserId().then((userId) => {
        getSessionId().then((sessionId) => {
            socket.emit("join", { userId: userId, sessionId: sessionId });
        });
    });
}

function joinSession() {
    socket.emit("join", { id: msg.sessionId });
}

function leaveSession() {
    getUserId().then((userId) => {
        getSessionId().then((sessionId) => {
            socket.emit("leave", { userId: userId, sessionId: sessionId });
        });
    });
}


function addSocketListeners() {
    socket.on("room_play", () => {
        serverPlay = true;
        html5VideoElement.play();
    });

    socket.on("room_pause", () => {
        serverPause = true;
    html5VideoElement.pause();
    });

    socket.on("room_seek", (data) => {
        serverSeek = true;
        html5VideoElement.currentTime = time;
    });

    socket.on("sessionCreated", (data) => {
        setSessionId(data.newId);
    });

    socket.on("joinedSession", (data) => {
        console.log("Entrou na sessão!");
    });

    socket.on("reconnect", (attemptNumber) => {
        console.log(attemptNumber);
        // console.log(`Reconnected ${attemptNumber} times`);
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                socket.emit("rejoin", { userId: userId, sessionId: sessionId });
            });
        });
    });
}


var html5VideoPauseListerner = function(event){
    if (!serverPause) {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                socket.emit("pause", {
                    userId: userId,
                    time: html5VideoElement.currentTime,
                    sessionId: sessionId,
                });
            });
        });
    }
    serverPause = false;
} 
var html5VideoPlayListerner = function(event){
    if (!serverPlay) {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                socket.emit("play", {
                    userId: userId,
                    time: html5VideoElement.currentTime,
                    sessionId: sessionId,
                });
            });
        });
    }
    serverPlay = false;
}
var html5VideoSeekListerner = function(event){
    if (!serverSeek) {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                socket.emit("seek", {
                    userId: userId,
                    time: html5VideoElement.currentTime,
                    sessionId: sessionId,
                });
            });
        });
        
    }
    serverSeek = false;
}

function addVideoListeners() {
    html5VideoElement.addEventListener("pause", html5VideoPauseListerner, false);
    html5VideoElement.addEventListener("play", html5VideoPlayListerner, false);
    html5VideoElement.addEventListener("seeking", html5VideoSeekListerner, false);
}

function removeVideoListeners() {
    html5VideoElement.removeEventListener("pause", html5VideoPauseListerner, false);
    html5VideoElement.removeEventListener("play", html5VideoPlayListerner, false);
    html5VideoElement.removeEventListener("seeking", html5VideoSeekListerner, false);
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

function getPageHost() {
    let pageHost = document.location.host;
    return pageHost;
}

function getPageUrl() {
    let pageUrl = document.location.href;
    return pageUrl;
}

function getSessionId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sessionId"], (result) => {
            resolve(result.sessionId);
        });
    });
}

function getUserId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["userId"], (result) => {
            console.log("userId value currently is " + result.userId);
            resolve(result.userId);
        });
    });
}

function setSessionId(newSessionId) {
    chrome.storage.local.set({ sessionId: newSessionId }, function () {
        console.log("SID value is set to " + newSessionId);
    });
}

function genericSendMessage(msg) {
    chrome.runtime.sendMessage(msg);
}
