chrome.tabs.onRemoved.addListener(onRemovedTabs);

async function onRemovedTabs(tabId, removeInfo){
    const sessionTabId = await getFromSyncStorage("sessionTabId");
    if(tabId === sessionTabId){
        console.log("Tab running session was Closed");
        clearInfo();
    }
}