document.addEventListener("DOMContentLoaded", DOMContentLoaded);

async function DOMContentLoaded(){
    const informationIcon = document.getElementById("informationIcon");
    informationIcon.addEventListener("click", informationIconCallback);
    const errorMessage = await getFromSyncStorage("errorMessage");
    console.log(errorMessage);
    const htmlErrorInfo = document.getElementById("info");
    htmlErrorInfo.innerText = chrome.i18n.getMessage(errorMessage);
}

function informationIconCallback(){
    var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
    chrome.tabs.create({ url: newURL });
}