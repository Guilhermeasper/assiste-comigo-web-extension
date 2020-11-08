chrome.tabs.onUpdated.addListener(onUpdated);

/**
 * Fired when some tab is updated
 * @param {String} tabId
 * @param {Object} changeInfo
 * @param {Object} tab
 */
function onUpdated(tabId, changeInfo, tab) {
    if (tab.url.includes("primevideo.com") || tab.url.includes("viki.com")) {
        chrome.storage.local.set({ tabId: tab.id }, function () {
            console.log("Value is set to " + tab.id);
        });
    }
}