import {
    tabSendMessage,
    getSessionId,
    getUserId,
    setUserId,
    getTabUrl,
    removeSessionId,
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
    removeSessionId();
    let tmpSocket = io.connect("https://guilhermeasper.com.br:443", {transports: ['websocket']});
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

chrome.runtime.onMessage.addListener((message, sender, response) => {
    if (message.command == "log") {
        console.log("New log message:");
        console.log(message);
        // sckt.emitCommand("log", message).then(() => {
        //     response("ok");
        // });
    } else if (message.command == "play") {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                let packet = {
                    userId: userId,
                    time: message.time,
                    sessionId: sessionId,
                };
                getTabUrl().then((url) => {
                    sckt.emitCommand("play", packet);
                    response({
                        page: "player",
                        address: url,
                        type: "played",
                        status: "completed",
                    });
                });
            });
        });
    } else if (message.command == "pause") {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                let packet = {
                    userId: userId,
                    time: message.time,
                    sessionId: sessionId,
                };
                getTabUrl().then((url) => {
                    sckt.emitCommand("pause", packet);
                    response({
                        page: "player",
                        address: url,
                        type: "paused",
                        status: "completed",
                    });
                });
            });
        });
    } else if (message.command == "seek") {
        getUserId().then((userId) => {
            getSessionId().then((sessionId) => {
                let packet = {
                    userId: userId,
                    time: message.time,
                    sessionId: sessionId,
                };
                getTabUrl().then((url) => {
                    sckt.emitCommand("seek", packet);
                    response({
                        page: "player",
                        address: url,
                        type: "seeked",
                        status: "completed",
                    });
                });
            });
        });
    } else if (message.command == "createSession") {
        console.log("Recebeu mensagem")
        sckt.connect().then(() => {
            console.log("Chegou aqui");
            sckt.addSocketListeners();
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    let packet = {
                        userId: userId,
                        sessionId: sessionId,
                    };
                    sckt.emitCommand("create", packet);
                    
                    tabSendMessage({ command: "createSession" }).then(
                        (responseFromTab) => {
                            
                            response({
                                page: "player",
                                address: responseFromTab.address,
                                type: "creation",
                                status: "completed",
                            });
                        }
                    );
                });
            });
        });
    } else if (message.command == "connection") {
        sckt.connect().then(() => {
            sckt.addSocketListeners();
            getUserId().then((userId) => {
                getSessionId().then((sessionId) => {
                    let packet = {
                        userId: userId,
                        sessionId: sessionId,
                    };
                    sckt.emitCommand("join", packet);
                    tabSendMessage({ command: "connection" }).then(
                        (responseFromTab) => {
                            response({
                                page: "player",
                                address: responseFromTab.address,
                                type: "connection",
                                status: "completed",
                            });
                        }
                    );
                });
            });
        });
    } else if (message.command == "disconnect") {
        sckt.disconnect();
        tabSendMessage({ command: "disconnect" }).then((responseFromTab) => {
            response({
                page: "player",
                address: responseFromTab.address,
                type: "disconnect",
                status: "completed",
            });
        });
    } else if (message.command == "checkConnection") {
        console.log("Checking connection");
        if (sckt) {
            console.log("Conectado ao servidor!");
        } else {
            console.log("Não está conectado");
        }
    } else if (message.command == "sessionReady") {
        return true;
    } else {
        response({
            page: "undentified",
            address: responseFromTab.address,
            type: "none",
            status: "unknown",
        });
    }
    return true;
});
