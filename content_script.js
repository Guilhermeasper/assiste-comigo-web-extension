console.log("Content script executando");

var client = io.connect("https://guilhermeasper.com.br:8080");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getVideo() {
    const videos = document.querySelectorAll("video");
    var video;
    videos.forEach((element) => {
        if (element.src.split(":")[0] == "blob") {
            video = element;
        }
    });
    return video;
}

function set_url(url) {
    chrome.storage.local.set({ url: url }, function () {
        console.log("URL value is set to " + url);
    });
}

var videoUrl;

if (document.location.href.includes("primevideo")) {
    $(document).click((event) => {
        if (document.querySelectorAll(".dv-player-fullscreen").length == 0) {
            videoUrl =
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

function getSessionId() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["sessionId"], (result) => {
            console.log("sessionId value currently is " + result.sessionId);
            resolve(result.sessionId);
        });
    });
}

function setsessionId(newSessionId) {
    chrome.storage.local.set({ sessionId: newSessionId }, function () {
        console.log("SID value is set to " + newSessionId);
    });
}

function gen_sendMessage(msg) {
    chrome.runtime.sendMessage(msg);
}

serverSeek = false;
serverPlay = false;
serverPause = false;

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    var video = getVideo();

    console.log(`Message received`);
    console.log(msg);
    // homescreen return
    if (!video) {
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
                        time: video.currentTime,
                        url: videoUrl,
                    };
                } else {
                    info = {
                        page: "playerWithoutId",
                        address: document.location.href,
                        time: video.currentTime,
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
        client.emit("create", { id: msg.sessionId });
        video.addEventListener("pause", () => {
            if (!serverPause) {
                client.emit("pause", { id: msg.sessionId });
            }
            serverPause = false;
        });
        video.addEventListener("play", () => {
            if (!serverPlay) {
                client.emit("play", { id: msg.sessionId });
            }
            serverPlay = false;
        });

        video.addEventListener("seeking", () => {
            if (!serverSeek) {
                client.emit("seek", {
                    id: msg.sessionId,
                    time: video.currentTime,
                });
                console.log(`Video seeked to ${video.currentTime}`);
            }
            serverSeek = false;
        });
        client.on("room_play", (data) => {
            serverPlay = true;
            video.play();
        });

        client.on("room_pause", (data) => {
            serverPause = true;
            video.pause();
        });

        client.on("room_seek", (data) => {
            serverSeek = true;
            video.currentTime = data.time;
        });
        response({ result: "sessionCreated" });
    } else if (msg.command == "connection") {
        client.emit("sessionConnect", { id: msg.sessionId });
        video.addEventListener("pause", () => {
            if (!serverPause) {
                client.emit("pause", { id: msg.sessionId });
            }
            serverPause = false;
        });
        video.addEventListener("play", () => {
            if (!serverPlay) {
                client.emit("play", { id: msg.sessionId });
            }
            serverPlay = false;
        });

        video.addEventListener("seeking", () => {
            if (!serverSeek) {
                client.emit("seek", {
                    id: msg.sessionId,
                    time: video.currentTime,
                });
                console.log(`Video seeked to ${video.currentTime}`);
            }
            serverSeek = false;
        });
        client.on("room_play", (data) => {
            serverPlay = true;
            video.play();
        });

        client.on("room_pause", (data) => {
            serverPause = true;
            video.pause();
        });

        client.on("room_seek", (data) => {
            serverSeek = true;
            video.currentTime = data.time;
        });
    } else if (msg.command == "disconnect") {
        client.emit("leaveSession", { id: msg.sessionId });
    } else if (msg.command == "play_test") {
        video.play();
    } else if (msg.command == "pause_test") {
        video.pause();
    }
    return true;
});
