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

    chrome.runtime.onMessage.addListener( async (request, sender, response) => {
        const type = request.type;
        if(type == "startCreate"){
            const socket = new Socket();
            await socket.connect();
            socket.emitCommand("create", packet);
        }
        console.log(`Request: ${type}`);
        document.dispatchEvent(new CustomEvent(type, { detail: request }));
        response({ code: 200 });
        return true;
    });

    contentScriptsOptions[pageHost]();
}

function injectScript(url){
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL(url);
    s.onload = function () {
        this.remove();
        chrome.runtime.sendMessage({type: "init"});
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

class Socket {
    socket;
    _address;
    constructor() {
        this.socket = undefined;
        this._address = "https://assistecomigo.herokuapp.com";
    }

    async connect() {
        this.socket = await io.connect(this._address, {
            transports: ["websocket"],
        });
    }

    emitCommand(type, data) {
        this.socket.emit(type, data);
    }

    disconnect() {
        this.socket.disconnect();
    }

    addSocketListeners() {
        this.socket.on("room_play", this.roomPlay);

        this.socket.on("room_pause", this.roomPause);

        this.socket.on("room_seek", this.roomSeek);

        this.socket.on("sessionCreated", this.sessionCreated);

        this.socket.on("joinedSession", this.joinedSession);

        this.socket.on("reconnect", async () => {
            let userId = await getUserId();
            let sessionId = await getSessionId();
            this.socket.emit("rejoin", {
                userId: userId,
                sessionId: sessionId,
            });
        });
    }

    roomPlay(data) {
        tabSendMessage({ type: "play" });
    }
    
    roomPause(data) {
        tabSendMessage({ type: "pause" });
    }
    
    roomSeek(data) {
        tabSendMessage({ type: "seek", time: data.time });
    }
    
    async sessionCreated(data) {
        await setSessionId(data.newId);
        console.log(`Session id coming from server is ${data.newId}`);
        chrome.runtime.sendMessage({
            type: "startCreate",
            sessionId: data.newId,
        });
    }
    
    joinedSession(data) {
        chrome.runtime.sendMessage({
            type: "startConnect",
            sessionId: data.newId,
        });
    }
}