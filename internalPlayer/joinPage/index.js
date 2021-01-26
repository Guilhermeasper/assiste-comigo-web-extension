import {
    tabSendMessage,
    copyToClipboard,
    setSessionId,
    getSessionId,
    getUserId,
    removeSessionId,
    getTabUrl,
    genericSendMessage,
} from "../../utils/utils.js";

var serverSeek = false;
var serverPlay = false;
var serverPause = false;

class Socket {
    socket;
    constructor() {
        this.socket = undefined;
    }

    async connect() {
        this.socket = await io.connect("https://guilhermeasper.com.br:443", {
            transports: ["websocket"],
        });
    }

    emitCommand(command, message) {
        this.socket.emit(command, message);
    }

    disconnect() {
        this.socket.disconnect();
    }

    addSocketListeners() {
        this.socket.on("room_play", (data) => {
            videoPlayer.play();
            serverPlay = true;
        });

        this.socket.on("room_pause", (data) => {
            videoPlayer.pause();
            serverPause = true;
        });

        this.socket.on("room_seek", (data) => {
            videoPlayer.currentTime = data.time;
            serverSeek = true;
        });

        this.socket.on("sessionCreated", (data) => {
            setSessionId(data.newId).then(() => {
                console.log(`Session id is ${data.newId}`);
                genericSendMessage({ command: "sessionReady" });
            });
        });

        this.socket.on("joinedSession", (data) => {
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    this.socket.emit("log", {
                        userId: userId,
                        sessionId: sessionId,
                        message: "Received joined session",
                    });
                });
            });
            console.log("Entrou na sessão!");
        });

        this.socket.on("reconnect", () => {
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    this.socket.emit("rejoin", {
                        userId: userId,
                        sessionId: sessionId,
                    });
                });
            });
        });
    }
}

var sckt = new Socket();

var videoPlayer;
document.addEventListener("DOMContentLoaded", () => {
    videoPlayer = document.getElementById("videoPlayer");
    let videoSource = document.getElementById("source");
    let videoInput = document.getElementById("videoFile");
    let subtitleTrack = document.getElementById("subTrack");
    let subtitleInput = document.getElementById("subFile");
    let confirmButton = document.getElementById("confirm");
    let checkbox = document.getElementById("create");
    let sessionIdDiv = document.getElementById("sessionIdDiv");
    let sessionId = document.getElementById("sessionId");

    checkbox.checked = true;
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            sessionIdDiv.style.display = "none";
        } else {
            sessionIdDiv.style.display = "block";
        }
    });

    var URL = window.URL || window.webkitURL;
    confirmButton.addEventListener("click", () => {
        var urlSub = "";
        var urlBlob = "";
        try {
            urlBlob = URL.createObjectURL(videoInput.files[0]);
            videoSource.src = urlBlob;
        } catch {
            alert("Você precisa selecionar um vídeo");
            return;
        }
        try {
            urlSub = URL.createObjectURL(subtitleInput.files[0]);
            subtitleTrack.src = urlSub;
        } catch {
            console.log("Você não adicionou legenda");
        }

        videoPlayer.load();
        videoPlayer.style.display = "block";
        if (checkbox.checked) {
            sckt.connect().then(() => {
                sckt.addSocketListeners();
                getUserId().then((userId) => {
                    getSessionId().then((sessionId) => {
                        let packet = {
                            userId: userId,
                            sessionId: sessionId,
                        };
                        sckt.emitCommand("create", packet);
                    });
                });
            });
        } else {
            setSessionId(sessionId.value).then(() => {
                sckt.connect().then(() => {
                    sckt.addSocketListeners();
                    getUserId().then((userId) => {
                        getSessionId().then((storageSessionId) => {
                            let packet = {
                                userId: userId,
                                sessionId: storageSessionId,
                            };
                            sckt.emitCommand("join", packet);
                        });
                    });
                });
            });
        }

        addVideoListeners();
    });
    function addVideoListeners() {
        videoPlayer.addEventListener("pause", html5VideoPauseListerner, false);
        videoPlayer.addEventListener("play", html5VideoPlayListerner, false);
        videoPlayer.addEventListener("seeking", html5VideoSeekListerner, false);
    }

    function removeVideoListeners() {
        videoPlayer.removeEventListener(
            "pause",
            html5VideoPauseListerner,
            false
        );
        videoPlayer.removeEventListener("play", html5VideoPlayListerner, false);
        videoPlayer.removeEventListener(
            "seeking",
            html5VideoSeekListerner,
            false
        );
    }

    var html5VideoPauseListerner = function (event) {
        console.log("Video pause");
        if (!serverPause) {
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    let packet = {
                        userId: userId,
                        time: videoPlayer.currentTime,
                        sessionId: sessionId,
                    };
                    sckt.emitCommand("pause", packet);
                });
            });
        }
        serverPause = false;
    };

    var html5VideoPlayListerner = function (event) {
        if (!serverPlay) {
            console.log("Video play");
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    let packet = {
                        userId: userId,
                        time: videoPlayer.currentTime,
                        sessionId: sessionId,
                    };
                    sckt.emitCommand("play", packet);
                });
            });
        }
        serverPlay = false;
    };
    var html5VideoSeekListerner = function (event) {
        if (!serverSeek) {
            console.log("Video seek");
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    let packet = {
                        userId: userId,
                        time: videoPlayer.currentTime,
                        sessionId: sessionId,
                    };
                    sckt.emitCommand("seek", packet);
                });
            });
        }
        serverSeek = false; 
    };
});
