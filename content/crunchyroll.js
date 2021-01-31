class Crunchyroll {
    #assisteComigoId;
    #serverPause;
    #serverPlay;
    #serverSeek;
    #video;

    constructor() {
        this.#serverPause = false;
        this.#serverPlay = false;
        this.#serverSeek = false;
        document.addEventListener("init", this.#init);
        document.addEventListener("getInfo", this.#getInfo);
        document.addEventListener("finishCreate", this.#finishCreate);
        document.addEventListener("finishConnect", this.#finishConnect);
        document.addEventListener("disconnect", this.#disconnect);
        document.addEventListener("play", this.#play);
        document.addEventListener("pause", this.#pause);
        document.addEventListener("seek", this.#seek);
    }

    #init = (request) => {
        const contentRequestData = request.detail;
        const extensionId = contentRequestData.extensionId;
        this.#assisteComigoId = extensionId;
        try {
            this.#video = VILOS_PLAYERJS;
        } catch (error) {}
    };

    #getInfo = (request) => {
        try {
            this.#video = VILOS_PLAYERJS;
        } catch (error) {}
        const contentRequestData = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };
        if (this.#video) {
            this.#video.getCurrentTime((time) => {
                info.player = true;
                info.time = time;
                const newData = { ...contentRequestData, ...info };
                chrome.runtime.sendMessage(this.#assisteComigoId, newData);
            });
        } else {
            const newData = { ...contentRequestData, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #finishCreate = (request) => {
        const data = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };

        if (this.#video) {
            this.#video.getCurrentTime((time) => {
                info.player = true;
                info.time = time;
                const newData = { ...data, ...info };
                this.#video.on("play", this.#playListener);
                this.#video.on("pause", this.#pauseListener);
                this.#video.on("seeked", this.#seekListener);
                chrome.runtime.sendMessage(this.#assisteComigoId, newData);
            });
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #finishConnect = (request) => {
        const data = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };
        if (this.#video) {
            this.#video.getCurrentTime((time) => {
                info.player = true;
                info.time = time;
                const newData = { ...data, ...info };
                this.#video.on("play", this.#playListener);
                this.#video.on("pause", this.#pauseListener);
                this.#video.on("seeked", this.#seekListener);
                chrome.runtime.sendMessage(this.#assisteComigoId, newData);
            });
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #disconnect = (request) => {
        const data = request.detail;
        let info = { player: false, url: document.location.href };
        if (this.#video) {
            info.player = true;
            const newData = { ...data, ...info };
            this.#video.off("play", this.#playListener);
            this.#video.off("pause", this.#pauseListener);
            this.#video.off("seeked", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #play = (request) => {
        if (this.#video) {
            this.#serverPlay = true;
            this.#video.play();
        }
    };

    #pause = (request) => {
        if (this.#video) {
            this.#serverPause = true;
            this.#video.pause();
        }
    };

    #seek = (request) => {
        const data = request.detail;
        if (this.#video) {
            this.#serverSeek = true;
            this.#video.setCurrentTime(data.time);
        }
    };

    #playListener = () => {
        if (!this.#serverPlay) {
            this.#video.getCurrentTime((time) => {
                chrome.runtime.sendMessage(this.#assisteComigoId, {
                    type: "listenerPlay",
                    time: time,
                });
            });
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        if (!this.#serverPause) {
            this.#video.getCurrentTime((time) => {
                chrome.runtime.sendMessage(this.#assisteComigoId, {
                    type: "listenerPause",
                    time: time,
                });
            });
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        if (!this.#serverSeek) {
            this.#video.getCurrentTime((time) => {
                chrome.runtime.sendMessage(this.#assisteComigoId, {
                    type: "listenerSeek",
                    time: time,
                });
            });
        }
        this.#serverSeek = false;
    };
}

const crunchyroll = new Crunchyroll();
