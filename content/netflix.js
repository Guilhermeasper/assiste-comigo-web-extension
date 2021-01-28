class AssisteComigoNeflix {
    #assisteComigoId;
    #serverPause;
    #serverPlay;
    #serverSeek;
    #player;
    #video;

    constructor() {
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
        this.#player = this.#getNetflixPlayer();
        this.#video = this.#getHtmlVideo();
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
        this.#player = this.#getNetflixPlayer();
        this.#video = this.#getHtmlVideo();
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #startSession = (request) => {
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        if (this.#video) this.#addEventListerners(this.#video);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #completeEndSession = (request) => {
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        if (this.#video) this.#removeEventListeners(this.#video);
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
                this.#player.play();
                break;
            case "pause":
                this.#serverPause = true;
                this.#player.pause();
                break;
            case "seek":
                this.#serverSeek = true;
                this.#player.seek(requestData.time);
                break;
            default:
                break;
        }
    };

    #playListener = () => {
        if (!this.#serverPlay) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPlay", time: this.#player.getCurrentTime() },
                this.#sendMessageCallback
            );
        }
        this.#serverPlay = false;
    };

    #pauseListener = () => {
        const player = this.#getNetflixPlayer();
        if (!this.#serverPause) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPause", time: this.#player.getCurrentTime() },
                this.#sendMessageCallback
            );
        }
        this.#serverPause = false;
    };

    #seekListener = () => {
        const player = this.#getNetflixPlayer();
        if (!this.#serverSeek) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerSeek", time: this.#player.getCurrentTime() },
                this.#sendMessageCallback
            );
        }
        this.#serverSeek = false;
    };

    #getNetflixPlayer = () => {
        const videoPlayer = window.netflix.appContext.state.playerApp.getAPI()
            .videoPlayer;
        const playerSessionId = videoPlayer.getAllPlayerSessionIds();
        const player = videoPlayer.getVideoPlayerBySessionId(
            playerSessionId[0]
        );
        return player;
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

    #checkIfPlayerExists = () => {
        if (this.#player) {
            return true;
        }
        return false;
    };

    #getPlayerCurrentTime = (player) => {
        if (this.#player) {
            return this.#player.getCurrentTime();
        }
        return;
    };

    #getHtmlVideo = () => {
        const htmlVideo = document.querySelector("video");
        return htmlVideo;
    };
}

const assisteComigoNetflix = new AssisteComigoNeflix();
