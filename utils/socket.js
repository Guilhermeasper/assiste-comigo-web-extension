class Socket {
    socket;
    _address;
    response;
    constructor() {
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
        document.dispatchEvent(
            new CustomEvent("play", {
                detail: {
                    type: "play",
                },
            })
        );
    }

    roomPause(data) {
        document.dispatchEvent(
            new CustomEvent("pause", {
                detail: {
                    type: "pause",
                },
            })
        );
    }

    roomSeek(data) {
        document.dispatchEvent(
            new CustomEvent("seek", {
                detail: {
                    type: "seek",
                    time: data.time,
                },
            })
        );
    }

    async sessionCreated(data) {
        await setSessionId(data.newId);
        document.dispatchEvent(
            new CustomEvent("finishCreate", {
                detail: {
                    type: "finishCreate",
                    sessionId: data.newId,
                },
            })
        );
    }

    joinedSession(data) {
        document.dispatchEvent(
            new CustomEvent("finishConnect", {
                detail: {
                    type: "finishConnect"
                },
            })
        );
    }
}
