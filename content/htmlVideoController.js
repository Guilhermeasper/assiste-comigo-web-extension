class htmlVideoController {
    #assisteComigoId;
    #selector;
    #serverPause;
    #serverPlay;
    #serverSeek;
    #htmlVideo;

    constructor(selector) {
        this.#selector = selector;
        this.#serverPause = false;
        this.#serverPlay = false;
        this.#serverSeek = false;
        document.addEventListener("init", this.#init);
        document.addEventListener("getInfo", this.#getInfo);
        document.addEventListener("finishCreate", this.#startSession);
        document.addEventListener("finishConnect", this.#startSession);
        document.addEventListener("disconnect", this.#completeEndSession);
        document.addEventListener("play", this.#playbackCommands);
        document.addEventListener("pause", this.#playbackCommands);
        document.addEventListener("seek", this.#playbackCommands);
    }

    #init = (request) => {
        const contentRequestData = request.detail;
        const extensionId = contentRequestData.extensionId;
        this.#assisteComigoId = extensionId;
        this.#htmlVideo = this.#getHtmlVideo();
    };

    #prepareInformation = (requestData) => {
        const playerExists = this.#checkIfPlayerExists();
        const playerCurrentTime = this.#getPlayerCurrentTime();
        const responseDataPacket = this.#generateInformartionPacket(
            requestData,
            playerExists,
            playerCurrentTime
        );
        return responseDataPacket;
    };

    #getInfo = (request) => {
        this.#htmlVideo = this.#getHtmlVideo();
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #getHtmlVideo = () => {
        const htmlVideo = document.querySelector(this.#selector);
        return htmlVideo;
    };

    #startSession = (request) => {
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        if (this.#htmlVideo) this.#addEventListerners(this.#htmlVideo);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #completeEndSession = (request) => {
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        if (this.#htmlVideo) this.#removeEventListeners(this.#htmlVideo);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #playbackCommands = (request) => {
        const requestData = request.detail;
        const requestType = requestData.type;
        switch (requestType) {
            case "play":
                this.#serverPlay = true;
                this.#htmlVideo.play();
                break;
            case "pause":
                this.#serverPause = true;
                this.#htmlVideo.pause();
                break;
            case "seek":
                this.#serverSeek = true;
                this.#htmlVideo.currentTime = requestData.time;
                break;
            default:
                break;
        }
    };

    #playListener = () => {
        if (!this.#serverPlay) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPlay", time: this.#htmlVideo.currentTime },
                this.#sendMessageCallback
            );
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        if (!this.#serverPause) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPause", time: this.#htmlVideo.currentTime },
                this.#sendMessageCallback
            );
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerSeek", time: this.#htmlVideo.currentTime },
                this.#sendMessageCallback
            );
        }
        this.#serverSeek = false;
    };

    #removeEventListeners = (video) => {
        video.removeEventListener("play", this.#playListener);
        video.removeEventListener("pause", this.#pauseListener);
        video.removeEventListener("seeking", this.#seekListener);
    };

    #addEventListerners = (video) => {
        video.addEventListener("play", this.#playListener);
        video.addEventListener("pause", this.#pauseListener);
        video.addEventListener("seeking", this.#seekListener);
    };

    #sendMessageCallback = (response) => {};

    #generateInformartionPacket = (requestData, playerExists, currentTime) => {
        let addtionalInfo = {
            player: playerExists,
            url: document.location.href,
            time: currentTime,
        };
        const responseData = { ...requestData, ...addtionalInfo };
        return responseData;
    };

    #getPlayerCurrentTime = () => {
        if (this.#htmlVideo) {
            return this.#htmlVideo.currentTime;
        }
        return;
    };

    #checkIfPlayerExists = () => {
        if (this.#htmlVideo && this.#htmlVideo.readyState >= 2) {
            return true;
        }
        return false;
    };
}
