import {
    tabSendMessage,
    getSessionId,
    setSessionId,
    getUserId,
} from "./utils.js";

var socket;

function roomPlay(data) {
    tabSendMessage({ type: "play" });
}

function roomPause(data) {
    tabSendMessage({ type: "pause" });
}

function roomSeek(data) {
    tabSendMessage({ type: "seek", time: data.time });
}

async function sessionCreated(data) {
    await setSessionId(data.newId);
    console.log(`Session id coming from server is ${data.newId}`);
    chrome.runtime.sendMessage({
        type: "startCreate",
        sessionId: data.newId,
    });
}

function joinedSession(data) {
    chrome.runtime.sendMessage({
        type: "startConnect",
        sessionId: data.newId,
    });
}

class Socket {
    socket;
    constructor() {
        this.socket = undefined;
    }

    async connect() {
        this.socket = await io.connect("http://192.168.0.18:80", {
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
        this.socket.on("room_play", roomPlay);

        this.socket.on("room_pause", roomPause);

        this.socket.on("room_seek", roomSeek);

        this.socket.on("sessionCreated", sessionCreated);

        this.socket.on("joinedSession", joinedSession);

        this.socket.on("reconnect", async () => {
            let userId = await getUserId();
            let sessionId = await getSessionId();
            this.socket.emit("rejoin", {
                userId: userId,
                sessionId: sessionId,
            });
        });
    }
}

export default socket = new Socket();
