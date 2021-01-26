class Anitube {
    #assisteComigoId;
    #selector;
    #serverPause;
    #serverPlay;
    #serverSeek;

    constructor() {
        this.#selector = ".jw-video";
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
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
        console.log("Received info request");
        if (video) {
            this.#serverPlay = true;
            video.play();
        } else {
            console.log("Erro no play");
        }
    };

    #pause = (request) => {
        const video = this.#getHTMLVideoElement();
        console.log("Received info request");
        if (video) {
            this.#serverPause = true;
            video.pause();
        } else {
            console.log("Erro no pause");
        }
    };

    #seek = (request) => {
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
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
        const video = this.#getHTMLVideoElement();
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerSeek", time: video.currentTime },
                (response) => console.log(response)
            );
        }
        this.#serverSeek = false;
    };

    #getHTMLVideoElement = () => {
        return document.querySelector("body > amp-mediakit-root > apple-tv-plus-player").shadowRoot.querySelector("amp-window-takeover > div > amp-video-player-internal").shadowRoot.querySelector("amp-video-player").shadowRoot.querySelector("#apple-music-video-player");
    }
}

const anitube = new Anitube();
