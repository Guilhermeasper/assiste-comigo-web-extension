document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const player = request.player;
        const userId = request.userId;
        const sessionId = request.sessionId;
        const url = request.url;
        if (!userId) {
            window.location.assign("./../errorView/error.html");
        } else {
            if (player && sessionId) {
                window.location.assign("./../inSessionView/inSession.html");
            } else if (!sessionId && url.includes("assistecomigo=")){
                window.location.assign("./../connectView/connect.html");
            } else if (player && !sessionId) {
                window.location.assign(
                    "./../createSessionView/createSession.html"
                );
            }
        }
    });

    chrome.runtime.sendMessage({ type: "info"}, (result) => {
        console.log(result);
    });
});
