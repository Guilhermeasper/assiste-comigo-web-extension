function get_tabId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["tabId"], (result) => {
      storage_sid = result.id;
      console.log("tabId value currently is " + result.tabId);
      resolve(result);
    });
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url.includes("primevideo.com") || tab.url.includes("viki.com")) {
    chrome.storage.local.set({ tabId: tab.id }, function () {
      console.log("Value is set to " + tab.id);
    });
  }
});

urlRegex = "www.primevideo.com";
chrome.tabs.onRemoved.addListener(function (tabId, info, tab) {
  chrome.storage.local.get(["tabId"], (result) => {
    if (tabId == result.tabId) {
      console.log("Prime Video Closed");
      chrome.storage.local.remove(["tabId"], function () {
        console.log("tabId removed");
      });
      chrome.storage.local.remove(["url"], function () {
        console.log("url removed");
      });
      chrome.storage.local.remove(["sessionId"], function () {
        console.log("SID removed");
      });
    }
  });
});

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    console.log("Rules Removed");
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlMatches: '(primevideo|viki|youtube|anitube|netflix)\.(com|site)',
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
    console.log("New rules added");
  });
});
