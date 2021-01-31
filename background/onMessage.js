chrome.runtime.onMessage.addListener(onMessage);

async function init(request, sender, response) {
    console.log("Initializing content module");
    const tabId = sender.tab.id;
    const newdata = {
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessageId(newRequest, tabId);
    response(result);
}

async function getInfo(request, sender, response) {
    console.log("Get to the getInfo function");
    const userId = await getFromSyncStorage("userId");
    const sessionId = await getFromSyncStorage("sessionId");
    const sessionUrl = await getFromSyncStorage("sessionUrl");
    const extensionId = chrome.runtime.id;
    const newdata = {
        userId: userId,
        sessionId: sessionId,
        extensionId: extensionId,
        sessionUrl: sessionUrl,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function finishCreate(request, sender, response) {
    let userId = await getFromSyncStorage("userId");
    let sessionId = await getFromSyncStorage("sessionId");
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
        sessionId: sessionId,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function startConnect(request, sender, response) {
    let userId = await getFromSyncStorage("userId");
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function finishConnect(request, sender, response) {
    let userId = await getFromSyncStorage("userId");
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

async function disconnect(request, sender, response) {
    let userId = await getFromSyncStorage("userId");
    const newdata = {
        userId: userId,
        extensionId: chrome.runtime.id,
    };
    const newRequest = { ...request, ...newdata };
    let result = await tabSendMessage(newRequest);
    response(result);
}

function onMessage(request, sender, response) {
    const type = request.type;
    const typeOptions = {
        init: init.bind(this, request, sender, response),
        getInfo: getInfo.bind(this, request, sender, response),
        finishCreate: finishCreate.bind(this, request, sender, response),
        startConnect: startConnect.bind(this, request, sender, response),
        finishConnect: finishConnect.bind(this, request, sender, response),
        disconnect: disconnect.bind(this, request, sender, response),
    };
    typeOptions[type]();
    return true;
}
