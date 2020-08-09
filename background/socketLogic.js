import {
    tabSendMessage,
    genericSendMessage,
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
            tabSendMessage({ command: "play", time: data.time });
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    this.socket.emit("log", {
                        userId: userId,
                        sessionId: sessionId,
                        message: "Received room play",
                    });
                });
            });
        });

        this.socket.on("room_pause", (data) => {
            tabSendMessage({ command: "pause", time: data.time });
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    this.socket.emit("log", {
                        userId: userId,
                        sessionId: sessionId,
                        message: "Received room pause",
                    });
                });
            });
        });

        this.socket.on("room_seek", (data) => {
            tabSendMessage({ command: "seek", time: data.time });
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    this.socket.emit("log", {
                        userId: userId,
                        sessionId: sessionId,
                        message: "Received room seek",
                    });
                });
            });
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
