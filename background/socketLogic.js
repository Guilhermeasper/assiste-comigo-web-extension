import {
    tabSendMessage,
    getSessionId,
    setSessionId,
    getUserId,
} from "./../utils/utils.js";

export class Socket {
    socket;
    constructor() {
        this.socket = undefined;
    }

    async connect() {
        this.socket = await io.connect("https://assistecomigo.herokuapp.com/", {
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
        this.socket.on("room_play", (data) => {
            tabSendMessage({type: "play"});
        });

        this.socket.on("room_pause", (data) => {
            tabSendMessage({type: "pause"});
        });

        this.socket.on("room_seek", (data) => {
            tabSendMessage({type: "seek", time: data.time});
        });

        this.socket.on("sessionCreated", (data) => {
            setSessionId(data.newId).then(() => {
                console.log(`Session id coming from server is ${data.newId}`);
                chrome.runtime.sendMessage({
                    type: "startCreate",
                    sessionId: data.newId
                });
            });
        });

        this.socket.on("joinedSession", (data) => {
            chrome.runtime.sendMessage({
                type: "startConnect",
                sessionId: data.newId
            });
        });

        this.socket.on("reconnect", () => {
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    this.socket.emit("rejoin", {
                        userId: userId,
                        sessionId: sessionId
                    });
                });
            });
        });
    }
}
