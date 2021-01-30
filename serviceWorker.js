self.addEventListener('install', function(event) {
    console.log('Service worker successfully installed.')
});

importScripts("utils/workerUtils.js");
importScripts('background/onInstalled.js');
importScripts('background/onMessage.js');
importScripts('background/onMessageExternal.js');
importScripts('background/onRemovedTabs.js');
