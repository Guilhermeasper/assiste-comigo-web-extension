import {
    tabSendMessage,
    getSessionId,
    getUserId,
    getSessionUrl,
} from "./../utils/utils.js";

import socket from "./socketLogic.js";

chrome.runtime.onMessage.addListener(onMessage);

async function getInfo(request, response) {
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

async function startCreate(response) {
    let userId = await getUserId();
    await socket.connect();
    socket.addSocketListeners();
    let packet = {
        userId: userId,
    };
    socket.emitCommand("create", packet);
    response({ code: 200 });
}

async function finishCreate(request, response) {
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
        getInfo: getInfo.bind(request, response),
        startCreate: startCreate.bind(response),
        finishCreate: finishCreate.bind(request, response),
        startConnect: startConnect.bind(request, response),
        finishConnect: finishConnect.bind(request, response),
        disconnect: disconnect.bind(request, response),
    };
    typeOptions[type]();
    return true;
}
