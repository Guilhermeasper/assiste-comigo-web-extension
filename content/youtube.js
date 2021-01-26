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
        console.log("Initializing youtube module");
        const contentRequestData = request.detail;
        const extensionId = contentRequestData.extensionId;
        console.log(`Extension ID:${extensionId}`);
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
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
        } else {
            const newData = { ...contentRequestData, ...info };
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
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
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            console.log(newData);
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
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
        console.log("Received connect request");
        if (video) {
            info.player = true;
            info.time = video.currentTime;
            const newData = { ...data, ...info };
            video.addEventListener("play", this.#playListener);
            video.addEventListener("pause", this.#pauseListener);
            video.addEventListener("seeking", this.#seekListener);
            this.#createAdsObserver();
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            console.log(newData);
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
        }
    };

    #disconnect = (request) => {
        const video = document.querySelector(this.#selector);
        const data = request.detail;
        let info = { player: false, url: document.location.href };
        const extensionId = data.extensionId;
        console.log("Received disconnect request");
        if (video) {
            info.player = true;
            const newData = { ...data, ...info };
            video.removeEventListener("play", this.#playListener);
            video.removeEventListener("pause", this.#pauseListener);
            video.removeEventListener("seeking", this.#seekListener);
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
        } else {
            info.player = false;
            const newData = { ...data, ...info };
            console.log(newData);
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                newData,
                (response) => console.log(response)
            );
        }
    };

    #play = (request) => {
        const video = document.querySelector(this.#selector);
        console.log("Received info request");
        if (video) {
            this.#serverPlay = true;
            video.play();
        } else {
            console.log("Erro no play");
        }
    };

    #pause = (request) => {
        const video = document.querySelector(this.#selector);
        console.log("Received info request");
        if (video) {
            this.#serverPause = true;
            video.pause();
        } else {
            console.log("Erro no pause");
        }
    };

    #seek = (request) => {
        const video = document.querySelector(this.#selector);
        const data = request.detail;
        console.log("Received info request");
        if (video) {
            this.#serverSeek = true;
            video.currentTime = data.time;
        } else {
            console.log("Erro no seek");
        }
    };

    #playListener = () => {
        const video = document.querySelector(this.#selector);
        if (!this.#serverPlay) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPlay", time: video.currentTime },
                (response) => console.log(response)
            );
            
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        const video = document.querySelector(this.#selector);
        if (!this.#serverPause) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPause", time: video.currentTime },
                (response) => console.log(response)
            );
            
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        const video = document.querySelector(this.#selector);
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerSeek", time: video.currentTime },
                (response) => console.log(response)
            );
            
        }
        this.#serverSeek = false;
    };

    #videoAdsResize = () => {
        const video = document.querySelector(this.#selector);
        const videoAds = document.querySelector(".video-ads").rect;
        if (videoAdsRect.width + videoAdsRect.height > 0) {
            console.log("Pausing for ad");
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "pause", time: video.currentTime },
                (response) => console.log(response)
            );
        } else {
            console.log("Playing after ad");
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "play", time: video.currentTime },
                (response) => console.log(response)
            );
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
