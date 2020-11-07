import {
    getSessionId,
    getUserId,
    clearInfo,
    setSessionId,
    setSessionUrl,
} from "./../utils/utils.js";

import socket from "./socketLogic.js"

chrome.runtime.onMessageExternal.addListener(onMessageExternal);

function getInfoExternal(request, response) {
    chrome.runtime.sendMessage(request);
    response({ code: 200 });
}

function startConnectExternal(request, response, url, urlParams) {
    if (urlParams.has("assistecomigo")) {
        const sessionId = urlParams.get("assistecomigo");
        setSessionId(sessionId).then(() => {
            getUserId().then((userId) => {
                socket.connect().then(() => {
                    socket.addSocketListeners();
                    let packet = {
                        userId: userId,
                        sessionId: sessionId,
                    };
                    socket.emitCommand("join", packet);
                    let sessionUrl = url;
                    if (url.includes("?")) {
                        sessionUrl = `${url}&assistecomigo=${sessionId}`;
                    } else {
                        sessionUrl = `${url}&assistecomigo=${sessionId}`;
                    }
                    setSessionUrl(sessionUrl);
                });
            });
        });
    } else {
        response({ code: 400 });
    }
}

function finishCreateExternal(request, response, url) {
    let sessionUrl = url;
    const sessionId = request.sessionId;
    if (url.includes("?")) {
        sessionUrl = `${url}&assistecomigo=${sessionId}`;
    } else {
        sessionUrl = `${url}?assistecomigo=${sessionId}`;
    }
    setSessionUrl(sessionUrl).then(() => {
        const newdata = {
            sessionUrl: sessionUrl,
        };
        const newRequest = { ...request, ...newdata };
        chrome.runtime.sendMessage(newRequest);
    });

    response({ code: 200 });
}

function playExternal(request, response) {
    getUserId().then((userId) => {
        getSessionId().then((sessionId) => {
            let packet = {
                userId: userId,
                sessionId: sessionId,
                time: request.time,
            };
            socket.emitCommand("play", packet);
            response({ code: 200 });
        });
    });
}

function pauseExternal(request, response) {
    getUserId().then((userId) => {
        getSessionId().then((sessionId) => {
            let packet = {
                userId: userId,
                sessionId: sessionId,
                time: request.time,
            };
            socket.emitCommand("pause", packet);
            response({ code: 200 });
        });
    });
}

function seekExternal(request, response) {
    getUserId().then((userId) => {
        getSessionId().then((sessionId) => {
            let packet = {
                userId: userId,
                sessionId: sessionId,
                time: request.time,
            };
            socket.emitCommand("seek", packet);
            response({ code: 200 });
        });
    });
}

function disconnectExternal(request, response) {
    clearInfo();
    if (socket.socket) {
        socket.emitCommand("disconnect", packet);
        socket.disconnect();
    }
    response({ code: 200 });
}

/**
 * Listerner for messages from external code
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
function onMessageExternal(request, sender, response) {
    // if (sender.url == blocklistedWebsite) return; // don't allow this web page access
    const url = request.url;
    const urlParams = new URLSearchParams(url);
    const typeOptions = {
        getInfo: getInfoExternal.bind(request, response),
        startConnect: startConnectExternal.bind(
            request,
            response,
            url,
            urlParams
        ),
        finishCreate: finishCreateExternal.bind(request, response, url),
        play: playExternal.bind(request, response),
        pause: pauseExternal.bind(request, response),
        seek: seekExternal.bind(request, response),
        disconnect: disconnectExternal.bind(request, response),
    };
    typeOptions[request.type];
}