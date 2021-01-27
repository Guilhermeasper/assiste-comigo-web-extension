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
        try{
            this.#video = VILOS_PLAYERJS;
        }catch(error){

        }
        
    };

    #getInfo = (request) => {
        try{
            this.#video = VILOS_PLAYERJS;
        }catch(error){

        }
        const contentRequestData = request.detail;
        let info = {
            player: false,
            url: document.location.href,
            time: undefined,
        };
        if (this.#video) {
            info.player = true;
            info.time = this.#video.getCurrentTime(() => {});
            const newData = { ...contentRequestData, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
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
            info.player = true;
            info.time = this.#video.getCurrentTime(() => {});
            const newData = { ...data, ...info };
            this.#video.on("play", this.#playListener);
            this.#video.on("pause", this.#pauseListener);
            this.#video.on("seeked", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
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
            info.player = true;
            info.time = this.#video.getCurrentTime(() => {});
            const newData = { ...data, ...info };
            this.#video.on("play", this.#playListener);
            this.#video.on("pause", this.#pauseListener);
            this.#video.on("seeked", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #disconnect = (request) => {
        const data = request.detail;
        let info = { player: false, url: document.location.href };
        const extensionId = data.extensionId;
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
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerPlay",
                time: this.#video.getCurrentTime(() => {}),
            });
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        if (!this.#serverPause) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerPause",
                time: this.#video.getCurrentTime(() => {}),
            });
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerSeek",
                time: this.#video.getCurrentTime(() => {}),
            });
        }
        this.#serverSeek = false;
    };
}

const crunchyroll = new Crunchyroll();
