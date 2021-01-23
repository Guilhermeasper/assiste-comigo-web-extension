class AssisteComigoNeflix {
    #assisteComigoId;
    #serverPause;
    #serverPlay;
    #serverSeek;

    constructor() {
        this.#serverPause = false;
        this.#serverPlay = false;
        this.#serverSeek = false;
        document.addEventListener("init", this.#init);
        document.addEventListener("getInfo", this.#getInfo);
        document.addEventListener("finishCreate", this.#StartSession);
        document.addEventListener("startConnect", this.#startConnect);
        document.addEventListener("finishConnect", this.#StartSession);
        document.addEventListener("disconnect", this.#completeEndSession);
        document.addEventListener("play", this.#playbackCommands);
        document.addEventListener("pause", this.#playbackCommands);
        document.addEventListener("seek", this.#playbackCommands);
    }

    #init = (request) => {
        const contentRequestData = request.detail;
        const extensionId = contentRequestData.extensionId;
        this.#assisteComigoId = extensionId;
    };

    #prepareInformation = (requestData) => {
        const player = this.#getNetflixPlayer();
        const playerExists = this.#checkIfPlayerExists(player);
        const playerCurrentTime = this.#getPlayerCurrentTime(player);
        const responseDataPacket = this.#generateInformartionPacket(
            requestData,
            playerExists,
            playerCurrentTime
        );
        return responseDataPacket;
    };

    #getInfo = (request) => {
        const requestData = request.detail;
        const responseDataPacket = this.#prepareInformation(requestData);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #StartSession = (request) => {
        const requestData = request.detail;
        const video = this.#getHtmlVideo();
        const responseDataPacket = this.#prepareInformation(requestData);
        if (video) this.#addEventListerners(video);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #completeEndSession = (request) => {
        const requestData = request.detail;
        const video = this.#getHtmlVideo();
        const responseDataPacket = this.#prepareInformation(requestData);
        if (video) this.#removeEventListeners(video);
        chrome.runtime.sendMessage(
            this.#assisteComigoId,
            responseDataPacket,
            this.#sendMessageCallback
        );
    };

    #startConnect = (request) => {
        const requestData = request.detail;
        let info = { url: document.location.href };
        const newData = { ...requestData, ...info };
        chrome.runtime.sendMessage(this.#assisteComigoId, newData, this.#sendMessageCallback);
    }

    #playbackCommands = (request) => {
        const requestData = request.detail;
        const requestType = requestData.type;
        const player = getNetflixPlayer();
        switch (requestType) {
            case "play":
                this.#serverPlay = true;
                player.play()
                break;
            case "pause":
                this.#serverPause = true;
                player.pause();
                break;
            case "seek":
                this.#serverSeek = true;
                player.seek(requestData.time);
                break;
            default:
                console.log(`Can't find ${requestType} command`);
                break;
        }
    }

    #playListener = () => {
        const player = this.#getNetflixPlayer();
        if (!this.#serverPlay) {
            chrome.runtime.sendMessage(
                this.#assisteComigoId,
                { type: "listenerPlay", time: player.getCurrentTime() },
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
                { type: "listenerPause", time: player.getCurrentTime() },
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
                { type: "listenerSeek", time: player.getCurrentTime() },
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
        video.removeEventListener("seeked", this.#seekListener);
    }

    #addEventListerners = (video) => {
        video.addEventListener("play", this.#playListener);
        video.addEventListener("pause", this.#pauseListener);
        video.addEventListener("seeking", this.#seekListener);
    };

    #sendMessageCallback = (response) => {
        console.log(response);
    };

    #generateInformartionPacket = (requestData, playerExists, currentTime) => {
        let addtionalInfo = {
            player: playerExists,
            url: document.location.href,
            time: currentTime,
        };
        const responseData = { ...requestData, ...addtionalInfo };
        return responseData;
    };

    #checkIfPlayerExists = (player) => {
        if (player) {
            return true;
        }
        return false;
    };

    #getPlayerCurrentTime = (player) => {
        if (player) {
            return player.getCurrentTime();
        }
        return;
    };

    #getHtmlVideo = () => {
        const htmlVideo = document.querySelector("video");
        return htmlVideo;
    };
}

const assisteComigoNetflix = new AssisteComigoNeflix();