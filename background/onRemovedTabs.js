chrome.tabs.onRemoved.addListener(onRemovedTabs);

function onRemovedTabs(tabId, removeInfo){
    console.log("A tab has been removed");
    console.log(tabId);
    console.log(removeInfo);
}