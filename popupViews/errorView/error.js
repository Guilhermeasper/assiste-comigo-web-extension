document.addEventListener("DOMContentLoaded", DOMContentLoaded);

function DOMContentLoaded(){
    chrome.storage.local.remove(
        ["sessionId", "sessionUrl"],
        function () {
            console.log("Info removed");
            window.location.assign("./../homepageView/homepage.html");
        }
    );
}