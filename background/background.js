import {
    tabSendMessage,
    getSessionId,
    getUserId,
    setUserId,
    getTabUrl,
    clearInfo,
    setSessionId,
    setSessionUrl,
    getSessionUrl,
} from "./../utils/utils.js";

import { Socket } from "./socketLogic.js";

var sckt = new Socket();

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.includes("primevideo.com") || tab.url.includes("viki.com")) {
        chrome.storage.local.set({ tabId: tab.id }, function () {
            console.log("Value is set to " + tab.id);
        });
    }
});

// chrome.tabs.onRemoved.addListener(function (tabId, info, tab) {
//     chrome.storage.local.get(["tabId"], (result) => {
//         if (tabId == result.tabId) {
//             chrome.storage.local.remove(["sessionId"], function () {
//                 console.log("SID removed");
//             });
//         }
//     });
// });

chrome.runtime.onInstalled.addListener(function (details) {
    clearInfo();
    let tmpSocket = io.connect("https://assistecomigo.herokuapp.com/", {
        transports: ["websocket"],
    });
    tmpSocket.on("newId", (data) => {
        console.log(`The user created by server is ${data.newId}`);
        setUserId(data.newId);
        tmpSocket.disconnect();
    });
    tmpSocket.emit("getId", {});
    // chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    //     console.log("Rules Removed");
    //     chrome.declarativeContent.onPageChanged.addRules([
    //         {
    //             conditions: [
    //                 new chrome.declarativeContent.PageStateMatcher({
    //                     pageUrl: {
    //                         urlMatches:
    //                             "*",
    //                             //"(vimeo|crunchyroll|primevideo|viki|youtube|anitube|netflix).(com|site)",
    //                     },
    //                 }),
    //             ],
    //             actions: [new chrome.declarativeContent.ShowPageAction()],
    //         },
    //     ]);
    //     console.log("New rules added");
    // });
});

chrome.runtime.onMessageExternal.addListener((request, sender, response) => {
    // if (sender.url == blocklistedWebsite) return; // don't allow this web page access
    const url = request.url;
    const urlParams = new URLSearchParams(url);
    if (request.type == "info") {
        chrome.runtime.sendMessage(request);
        response({ code: 200 });
    } else if (request.type == "startConnect") {
        if (urlParams.has("assistecomigo")) {
            const sessionId = urlParams.get("assistecomigo");
            setSessionId(sessionId).then(() => {
                getUserId().then((userId) => {
                    sckt.connect().then(() => {
                        sckt.addSocketListeners();
                        let packet = {
                            userId: userId,
                            sessionId: sessionId,
                        };
                        sckt.emitCommand("join", packet);
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
    } else if (request.type == "finishCreate") {
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
    } else if (request.type == "play") {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                    time: request.time,
                };
                sckt.emitCommand("play", packet);
                response({ code: 200 });
            });
        });
    } else if (request.type == "pause") {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                    time: request.time,
                };
                sckt.emitCommand("pause", packet);
                response({ code: 200 });
            });
        });
    } else if (request.type == "seek") {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                let packet = {
                    userId: userId,
                    sessionId: sessionId,
                    time: request.time,
                };
                sckt.emitCommand("seek", packet);
                response({ code: 200 });
            });
        });
    } else if (request.type == "disconnect") {
        clearInfo();
        if (sckt.socket) {
            sckt.emitCommand("disconnect", packet);
            sckt.disconnect();
        }

        response({ code: 200 });
    }
});

chrome.runtime.onMessage.addListener((request, sender, response) => {
    const type = request.type;
    if (type == "info") {
        console.log("Received info request");
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                getSessionUrl().then((sessionUrl) => {
                    const newdata = {
                        userId: userId,
                        sessionId: sessionId,
                        extensionId: chrome.runtime.id,
                        sessionUrl: sessionUrl,
                    };
                    const newRequest = { ...request, ...newdata };
                    console.log(newRequest);
                    tabSendMessage(newRequest).then((result) => {
                        response(result);
                    });
                });
            });
        });
    } else if (type == "startCreate") {
        console.log("Start creating session");
        getUserId().then((userId) => {
            sckt.connect().then(() => {
                sckt.addSocketListeners();
                let packet = {
                    userId: userId,
                };
                sckt.emitCommand("create", packet);
                response({ code: 200 });
            });
        });
    } else if (type == "finishCreate") {
        console.log("Finishing creating session");
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                const newdata = {
                    userId: userId,
                    extensionId: chrome.runtime.id,
                    sessionId: sessionId,
                };
                const newRequest = { ...request, ...newdata };
                console.log(
                    `Should send ${request.type} to content script after this`
                );
                tabSendMessage(newRequest).then((result) => {
                    console.log(result);
                });
                console.log("Should sent message to content script");
            });
        });
        response({ code: 200 });
    } else if (type == "startConnect") {
        getUserId().then((userId) => {
            const newdata = {
                userId: userId,
                extensionId: chrome.runtime.id,
            };
            const newRequest = { ...request, ...newdata };
            tabSendMessage(newRequest).then((result) => {
                response(result);
            });
        });
    } else if (type == "finishConnect") {
        getUserId().then((userId) => {
            const newdata = {
                userId: userId,
                extensionId: chrome.runtime.id,
            };
            const newRequest = { ...request, ...newdata };
            tabSendMessage(newRequest).then((result) => {
                response(result);
            });
        });
    } else if (type == "disconnect") {
        getUserId().then((userId) => {
            const newdata = {
                userId: userId,
                extensionId: chrome.runtime.id,
            };
            const newRequest = { ...request, ...newdata };
            tabSendMessage(newRequest).then((result) => {
                response(result);
            });
        });
    }
    return true;
});
