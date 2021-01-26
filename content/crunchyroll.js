class Crunchyroll {
    #assisteComigoId;
    #selector;
    #serverPause;
    #serverPlay;
    #serverSeek;

    constructor() {
        this.#selector = "#player0";
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
    };

    #getVideo = () => {
        const video = VILOS_PLAYERJS;
        return video;
    };

    #getInfo = (request) => {
        const video = this.#getVideo();
        const contentRequestData = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };
        if (video) {
            info.player = true;
            info.time = video.currentTime;
            const newData = { ...contentRequestData, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            const newData = { ...contentRequestData, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #finishCreate = (request) => {
        const video = this.#getVideo();
        const data = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };

        if (video) {
            info.player = true;
            info.time = video.currentTime;
            const newData = { ...data, ...info };
            video.on("play", this.#playListener);
            video.on("pause", this.#pauseListener);
            video.on("seeked", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #finishConnect = (request) => {
        const video = this.#getVideo();
        const data = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };
        if (video) {
            info.player = true;
            info.time = video.currentTime;
            const newData = { ...data, ...info };
            video.on("play", this.#playListener);
            video.on("pause", this.#pauseListener);
            video.on("seeked", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #disconnect = (request) => {
        const video = this.#getVideo();
        const data = request.detail;
        let info = { player: false, url: document.location.href };
        const extensionId = data.extensionId;
        if (video) {
            info.player = true;
            const newData = { ...data, ...info };
            video.off("play", this.#playListener);
            video.off("pause", this.#pauseListener);
            video.off("seeked", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #play = (request) => {
        const video = this.#getVideo();
        if (video) {
            this.#serverPlay = true;
            video.play();
        }
    };

    #pause = (request) => {
        const video = this.#getVideo();
        if (video) {
            this.#serverPause = true;
            video.pause();
        }
    };

    #seek = (request) => {
        const video = this.#getVideo();
        const data = request.detail;
        if (video) {
            this.#serverSeek = true;
            video.setCurrentTime(data.time);
        }
    };

    #playListener = () => {
        const video = this.#getVideo();
        if (!this.#serverPlay) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerPlay",
                time: video.getCurrentTime(() => {
                    console.log("Play");
                }),
            });
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        const video = this.#getVideo();
        if (!this.#serverPause) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerPause",
                time: video.getCurrentTime(() => console.log("Play")),
            });
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        const video = this.#getVideo();
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerSeek",
                time: video.getCurrentTime(() => console.log("Play")),
            });
        }
        this.#serverSeek = false;
    };
}

const crunchyroll = new Crunchyroll();
