chrome.runtime.onMessage.addListener(onMessage);

async function init(request, response) {
    console.log("Initializing content module");
    const newdata = {
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    console.log(newRequest);
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function getInfo(request, response) {
    console.log("Get to the getInfo function");
    let userId = await getUserId();
    let sessionId = await getSessionId();
    let sessionUrl = await getSessionUrl();
    const newdata = {
        userId: userId,
        sessionId: sessionId,
        extensionId: chrome.runtime.id,
        sessionUrl: sessionUrl,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function finishCreate(request, response) {
    console.log("Finish create");
    console.log(request);
    let userId = await getUserId();
    let sessionId = await getSessionId();
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
        sessionId: sessionId,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function startConnect(request, response) {
    let userId = await getUserId();
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function finishConnect(request, response) {
    let userId = await getUserId();
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function disconnect(request, response) {
    let userId = await getUserId();
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

function onMessage(request, sender, response) {
    console.log(request, sender, response);
    const type = request.type;
    const typeOptions = {
        init: init.bind(this, request, response),
        getInfo: getInfo.bind(this, request, response),
        finishCreate: finishCreate.bind(this, request, response),
        startConnect: startConnect.bind(this, request, response),
        finishConnect: finishConnect.bind(this, request, response),
        disconnect: disconnect.bind(this, request, response),
    };
    typeOptions[type]();
    return true;
}
