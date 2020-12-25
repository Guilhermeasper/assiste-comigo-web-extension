importScripts("./utils/utils.js");

chrome.runtime.onMessageExternal.addListener(onMessageExternal);

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
        getInfo: getInfoExternal.bind(this, request, response),
        startConnect: startConnectExternal.bind(
            this,
            request,
            response,
            url,
            urlParams
        ),
        finishCreate: finishCreateExternal.bind(this, request, response, url),
        play: playExternal.bind(this, request, response),
        pause: pauseExternal.bind(this, request, response),
        seek: seekExternal.bind(this, request, response),
        disconnect: disconnectExternal.bind(this, request, response),
    };
    typeOptions[request.type]();
    return true;
}

/**
 * Passes the info coming from the page to the popup
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
function getInfoExternal(request, response) {
    chrome.runtime.sendMessage(request);
    response({ code: 200 });
}

/**
 * Send a message to the server to join the current room session
 * @param {Object} request - Contains request data
 * @param {Object} response - Response to the request
 * @param {String} url - URL of the current session
 * @param {URLSearchParams} urlParams - Parameters of the url
 */
async function startConnectExternal(request, response, url, urlParams){
    if (urlParams.has("assistecomigo")) {
        const sessionId = urlParams.get("assistecomigo");
        await setSessionId(sessionId);
        let userId = await getUserId();
        await socket.connect();
        socket.addSocketListeners();
        let packet = {
            userId: userId,
            sessionId: sessionId,
        };
        socket.emitCommand("join", packet);
        let sessionUrl = await parseUrl(url, sessionId);
        await setSessionUrl(sessionUrl);
        response({ code: 200});
    } else {
        response({ code: 400 });
    }
}

/**
 * Passes the create packte from the page to the popup
 * @param {Object} request 
 * @param {Object} response 
 * @param {String} url 
 */
async function finishCreateExternal(request, response, url) {
    let sessionUrl = url;
    const sessionId = request.sessionId;
    if (url.includes("?")) {
        sessionUrl = `${url}&assistecomigo=${sessionId}`;
    } else {
        sessionUrl = `${url}?assistecomigo=${sessionId}`;
    }
    await setSessionUrl(sessionUrl);
    const newdata = {
        sessionUrl: sessionUrl,
    };
    const newRequest = { ...request, ...newdata };
    chrome.runtime.sendMessage(newRequest);
    response({ code: 200 });
}

/**
 * Send a play command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
async function playExternal(request, response) {
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("play", packet);
    response({ code: 200 });
}

/**
 * Send a pause command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
async function pauseExternal(request, response) {
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("pause", packet);
    response({ code: 200 });
}

/**
 * Send a seek command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
async function seekExternal(request, response) {
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let packet = {
        userId: userId,
        sessionId: sessionId,
        time: request.time,
    };
    socket.emitCommand("seek", packet);
    response({ code: 200 });
}

/**
 * Send a disconnect command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
function disconnectExternal(request, response) {
    clearInfo();
    if (socket.socket) {
        socket.emitCommand("disconnect", {});
        socket.disconnect();
    }
    response({ code: 200 });
}

/**
 * Parse the session url by inserting the session id
 * @param {String} url Url to be parsed
 * @param {String} sessionId Session id to be inserted on the url
 */
async function parseUrl(url, sessionId){
    if (url.includes("?")) {
        return `${url}&assistecomigo=${sessionId}`;
    } else {
        return `${url}&assistecomigo=${sessionId}`;
    }
}
