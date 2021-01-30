chrome.runtime.onMessageExternal.addListener(onMessageExternal);

/**
 * Listerner for messages from external code
 * @param {Object} request - Object cotaining request information
 * @param {Object} sender - Object cotaining sender information
 * @param {Object} response - Callback to respond message received
 */
function onMessageExternal(request, sender, response) {
    // if (sender.url == blocklistedWebsite) return; // don't allow this web page access
    console.log("onMessageExternal new request.");
    console.log(request);
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
        finishConnect: finishConnectExternal.bind(this, request, response, url, urlParams),
        listenerPlay: playExternal.bind(this, request, response),
        listenerPause: pauseExternal.bind(this, request, response),
        listenerSeek: seekExternal.bind(this, request, response),
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
        await setToSyncStorage("sessionId", sessionId);
        let userId = await getFromSyncStorage("userId");
        let sessionUrl = await parseUrl(url, sessionId);
        await setToSyncStorage("sessionUrl", sessionUrl);
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
async function finishConnectExternal(request, response, url, urlParams) {
    const currentTabId = await getTabId();
    await setToSyncStorage("sessionTabId", currentTabId);
    let userId = await getFromSyncStorage("userId");
    const sessionId = await getFromSyncStorage("sessionId");
    await setToSyncStorage("sessionUrl", url);
    const newdata = {
        sessionUrl: url,
        sessionId: sessionId,
        userId: userId,
    };
    const newRequest = { ...request, ...newdata };
    console.log(newRequest);
    chrome.runtime.sendMessage(newRequest);
    response({ code: 200 });
}
/**
 * Passes the create packte from the page to the popup
 * @param {Object} request 
 * @param {Object} response 
 * @param {String} url 
 */
async function finishCreateExternal(request, response, url) {
    console.log(request);
    let userId = await getFromSyncStorage("userId");
    const currentTabId = await getTabId();
    await setToSyncStorage("sessionTabId", currentTabId);
    const sessionId = request.sessionId;
    const sessionUrl = new URL(url);
    sessionUrl.searchParams.append("assistecomigo", sessionId);
    await setToSyncStorage("sessionUrl", sessionUrl.href);
    const newdata = {
        sessionUrl: sessionUrl.href,
        userId: userId,
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
    tabSendMessage(request);
    response({ code: 200 });
}

/**
 * Send a pause command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
async function pauseExternal(request, response) {
    tabSendMessage(request);
    response({ code: 200 });
}

/**
 * Send a seek command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
async function seekExternal(request, response) {
    tabSendMessage(request);
    response({ code: 200 });
}

/**
 * Send a disconnect command to the server
 * @param {Object} request - Object containing request data
 * @param {Function} response - Function to response to the request
 */
function disconnectExternal(request, response) {
    clearInfo();
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
