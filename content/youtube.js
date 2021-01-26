class AssisteComigoYoutube {
    #assisteComigoId;
    #selector;
    #serverPause;
    #serverPlay;
    #serverSeek;

    constructor() {
        this.#selector = ".video-stream";
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

    #getInfo = (request) => {
        const video = document.querySelector(this.#selector);
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
        const video = document.querySelector(this.#selector);
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
            video.addEventListener("play", this.#playListener);
            video.addEventListener("pause", this.#pauseListener);
            video.addEventListener("seeking", this.#seekListener);
            this.#createAdsObserver();
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #finishConnect = (request) => {
        const video = document.querySelector(this.#selector);
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
            video.addEventListener("play", this.#playListener);
            video.addEventListener("pause", this.#pauseListener);
            video.addEventListener("seeking", this.#seekListener);
            this.#createAdsObserver();
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #disconnect = (request) => {
        const video = document.querySelector(this.#selector);
        const data = request.detail;
        let info = { player: false, url: document.location.href };
        const extensionId = data.extensionId;
        if (video) {
            info.player = true;
            const newData = { ...data, ...info };
            video.removeEventListener("play", this.#playListener);
            video.removeEventListener("pause", this.#pauseListener);
            video.removeEventListener("seeking", this.#seekListener);
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            chrome.runtime.sendMessage(this.#assisteComigoId, newData);
        }
    };

    #play = (request) => {
        const video = document.querySelector(this.#selector);
        if (video) {
            this.#serverPlay = true;
            video.play();
        }
    };

    #pause = (request) => {
        const video = document.querySelector(this.#selector);
        if (video) {
            this.#serverPause = true;
            video.pause();
        }
    };

    #seek = (request) => {
        const video = document.querySelector(this.#selector);
        const data = request.detail;
        if (video) {
            this.#serverSeek = true;
            video.currentTime = data.time;
        }
    };

    #playListener = () => {
        const video = document.querySelector(this.#selector);
        if (!this.#serverPlay) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerPlay",
                time: video.currentTime,
            });
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        const video = document.querySelector(this.#selector);
        if (!this.#serverPause) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerPause",
                time: video.currentTime,
            });
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        const video = document.querySelector(this.#selector);
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "listenerSeek",
                time: video.currentTime,
            });
        }
        this.#serverSeek = false;
    };

    #videoAdsResize = () => {
        const video = document.querySelector(this.#selector);
        const videoAds = document.querySelector(".video-ads").rect;
        if (videoAdsRect.width + videoAdsRect.height > 0) {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "pause",
                time: video.currentTime,
            });
        } else {
            chrome.runtime.sendMessage(this.#assisteComigoId, {
                type: "play",
                time: video.currentTime,
            });
        }
    };

    #createAdsObserver = () => {
        const videoAds = document.querySelector(".video-ads");
        // if (videoAds) {
        //     const videoAdsObserver = new ResizeObserver(this.#videoAdsResize);
        //     videoAdsObserver.observe(videoAds);
        // }
    };
}

const youtube = new AssisteComigoYoutube();
