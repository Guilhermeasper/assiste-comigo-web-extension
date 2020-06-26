var serverSeek = false;
var serverPlay = false;
var serverPause = false;

function main(){
    document.addEventListener("DOMContentLoaded", () => {
        console.log("Main content script loaded");
    
        let contentScriptsOptions = {
            "www.primevideo.com": primevideoScript,
            "www.anitube.site": anitubeScript,
            "www.youtube.com": youtubeScript,
            "www.viki.com": vikiScript,
            "www.netflix.com": netflixScript,
        };
    
        let pageHost = getPageHost();
        contentScriptsOptions[pageHost]();
    
    
        var videoUrl;
    
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            var html5VideoElement = getHtml5VideoElement();
    
            // homescreen return
            if (!html5VideoElement) {
                response({ page: "homepage" });
                return true;
            }
    
            if (!document.location.href.includes("primevideo")) {
                videoUrl = document.location.href;
            }
    
            if (msg.command == "info") {
                var info;
                try {
                    getSessionId().then((result) => {
                        if (result) {
                            info = {
                                page: "playerWithtId",
                                address: document.location.href,
                                time: html5VideoElement.currentTime,
                                url: videoUrl,
                            };
                        } else {
                            info = {
                                page: "playerWithoutId",
                                address: document.location.href,
                                time: html5VideoElement.currentTime,
                                url: videoUrl,
                            };
                        }
                        console.log(info);
                        response(info);
                    });
                } catch (err) {
                    console.log(err);
                    response("err");
                }
            } else if (msg.command == "createSession") {
                
                html5VideoElement.addEventListener("pause", () => {
                    if (!serverPause) {
                        client.emit("pause", { id: msg.sessionId });
                    }
                    serverPause = false;
                });
                html5VideoElement.addEventListener("play", () => {
                    if (!serverPlay) {
                        client.emit("play", { id: msg.sessionId });
                    }
                    serverPlay = false;
                });
    
                html5VideoElement.addEventListener("seeking", () => {
                    if (!serverSeek) {
                        client.emit("seek", {
                            id: msg.sessionId,
                            time: html5VideoElement.currentTime,
                        });
                        console.log(
                            `Video seeked to ${html5VideoElement.currentTime}`
                        );
                    }
                    serverSeek = false;
                });
                client.on("room_play", (data) => {
                    serverPlay = true;
                    html5VideoElement.play();
                });
    
                client.on("room_pause", (data) => {
                    serverPause = true;
                    html5VideoElement.pause();
                });
    
                client.on("room_seek", (data) => {
                    serverSeek = true;
                    html5VideoElement.currentTime = data.time;
                });
                response({ result: "sessionCreated" });
            } else if (msg.command == "connection") {
                client.emit("sessionConnect", { id: msg.sessionId });
            } else if (msg.command == "disconnect") {
                client.emit("leaveSession", { id: msg.sessionId });
            } else if (msg.command == "play_test") {
                html5VideoElement.play();
            } else if (msg.command == "pause_test") {
                html5VideoElement.pause();
            }
            return true;
        });
    });
}



function primevideoScript() {
    $(document).click((event) => {
        if (
            document.querySelectorAll(".dv-player-fullscreen").length == 0
        ) {
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
    let socket = io.connect("https://guilhermeasper.com.br:8080");
    return socket;
}

function createSession(socket){
    socket.emit("create", { id: msg.sessionId });
}

function joinSession(socket){
    socket.emit("join", { id: msg.sessionId });
}

function leaveSession(socket){
    socket.emit("leave", { id: msg.sessionId });
}

function html5VideoPlay(html5Video){
    serverPlay = true;
    html5Video.play();
}

function html5VideoPause(html5Video){
    serverPause = true;
    html5Video.pause();
}

function html5VideoSeek(html5Video, time){
    serverSeek = true;
    html5Video.currentTime = time;
}


function socketListeners(socket, html5Video) {
    socket.on("room_play", () => {
        html5VideoPlay(html5Video);
    });

    socket.on("room_pause", () => {
        html5VideoPause(html5Video);
    });

    socket.on("room_seek", (data) => {
        html5VideoSeek(html5Video, data.time)
    });
}

function socketListeners(html5Video, socket, sessionID) {
    html5Video.addEventListener("pause", () => {
        if (!serverPause) {
            socket.emit("pause", { id: sessionId });
        }
        serverPause = false;
    });
    html5Video.addEventListener("play", () => {
        if (!serverPlay) {
            socket.emit("play", { id: sessionId });
        }
        serverPlay = false;
    });

    html5Video.addEventListener("seeking", () => {
        if (!serverSeek) {
            socket.emit("seek", {
                id: sessionId,
                time: html5VideoElement.currentTime,
            });
            console.log(`Video seeked to ${html5Video.currentTime}`);
        }
        serverSeek = false;
    });
}

function getHtml5VideoElement() {
    const videos = document.querySelectorAll("video");
    var video;
    videos.forEach((element) => {
        if (element.src.includes("blob")) {
            video = element;
        }
    });
    return video;
}

function getPageHost() {
    let pageHost = document.location.host;
    return pageHost;
}

function getPageUrl() {
    let pageUrl = document.location.href;
    return pageUrl;
}

main();