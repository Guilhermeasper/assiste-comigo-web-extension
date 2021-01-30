document.addEventListener("DOMContentLoaded", DOMContentLoaded);

function DOMContentLoaded(){
    const informationIcon = document.getElementById("informationIcon");
    informationIcon.addEventListener("click", informationIconCallback);
    chrome.storage.local.remove(
        ["sessionId", "sessionUrl"],
        function () {
            console.log("Info removed");
            //window.location.assign("./../homepageView/homepage.html");
        }
    );
}

function informationIconCallback(){
    var newURL = `chrome-extension://${chrome.runtime.id}/about/index.html`;
    chrome.tabs.create({ url: newURL });
}