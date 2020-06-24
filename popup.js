function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSessionId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["sessionId"], (result) => {
      storage_sessionId = result.sessionId;
      console.log("sessionId value currently is " + result.sessionId);
      resolve(storage_sessionId);
    });
  });
}

function setSessionId(newSessionId) {
  chrome.storage.local.set({ sessionId: newSessionId }, function () {
    console.log("SID value is set to " + newSessionId);
  });
}

function removeSessionId() {
  chrome.storage.local.remove(["sessionId"], function () {
    console.log("sessionId removed");
  });
}

function getTabId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      var activeTab = tabs[0];
      resolve(activeTab);
    });
  });
}



function clearPopup() {
  var rowCreate = document.getElementById("rowCreate");
  var rowHomepage = document.getElementById("rowHomepage");
  var rowInSession = document.getElementById("rowInSession");
  var rowError = document.getElementById("rowError");
  
  rowHomepage.style.display = "none";
  rowCreate.style.display = "none";
  rowInSession.style.display = "none";
  rowError.style.display = "none";
}

function generic_sendMessage(msg) {
  chrome.runtime.sendMessage(msg);
}

function copyToClipboard(url) {
  const textAreaElement = document.createElement("textarea");
  textAreaElement.value = url;
  textAreaElement.style.position = "absolute";
  textAreaElement.style.left = "-9001px";
  document.body.appendChild(textAreaElement);
  textAreaElement.select();
  document.execCommand("copy");
  document.body.removeChild(textAreaElement);
}

document.addEventListener(
  "DOMContentLoaded",
  async function () {
    /*------------------------------------------------------
    ----------------DEVELOPER PURPOSES ONLY-----------------
    --------------------------------------------------------
    --------------------------START-------------------------
    -------------------------------------------------------- */
    var play_button = document.getElementById("play");
    var pause_button = document.getElementById("pause");
    // play_button.style.display = "block";
    // pause_button.style.display = "block";
    play_button.addEventListener("click", function () {
      console.log("playing");
      tab_sendMessage({ command: "play_test" });
    });

    pause_button.addEventListener("click", function () {
      console.log("pausing");
      tab_sendMessage({ command: "pause_test" });
    });
    /*------------------------------------------------------
    ----------------DEVELOPER PURPOSES ONLY-----------------
    --------------------------------------------------------
    --------------------------END---------------------------
    -------------------------------------------------------- */

    var createButton = document.getElementById("create");
    var disconnectButton = document.getElementById("disconnect");
    var urlField = document.getElementById("url");
    var idField = document.getElementById("id");
    var copy = document.getElementById("urlCopyButton");
    var rowCreate = document.getElementById("rowCreate");
    var rowHomepage = document.getElementById("rowHomepage");
    var rowInSession = document.getElementById("rowInSession");
    var rowError = document.getElementById("rowError");
    var sessionId = await getSessionId();

    // Set all divs to none
    clearPopup();

    var resp = await tab_sendMessage();
    console.log(resp);
    if (sessionId && resp.page == "homepage") {
      rowError.style.display = "block";
      removeSessionId();
    } else if (!sessionId && resp.page == "homepage") {
      rowHomepage.style.display = "block";
    } else if (sessionId && resp.page == "player") {
      rowInSession.style.display = "block";
      idField.textContent = sessionId;
      copy.addEventListener("click", copyToClipboard(resp.url + `?pvt=${sessionId}`));
    } else if (!sessionId && resp.page == "player") {
      if (resp.address.includes("?pvt=")) {
        array_aux = resp.address.split("?pvt=");
        urlSessionId = array_aux[array_aux.length - 1];
        rowInSession.style.display = "block";
        idField.textContent = sessionId;
        setSessionId(urlSessionId);
        tab_sendMessage({ command: "connection" , sessionId: urlSessionId});
        copy.addEventListener("click", copyToClipboard(resp.url + `?pvt=${sessionId}`));
      } else {
        rowCreate.style.display = "block";
      }
    }

    createButton.addEventListener("click", function () {
      let tempSessionId = Math.random().toString(36).substr(2, 9);
      setSessionId(tempSessionId);
      clearPopup();
      rowInSession.style.display = "block";
      idField.textContent = tempSessionId;
      tab_sendMessage({ command: "create" , sessionId: tempSessionId});
      copy.addEventListener("click", copyToClipboard(resp.url + `?pvt=${tempSessionId}`));
    });

    disconnectButton.addEventListener("click", function () {
      removeSessionId();
      clearPopup();
      rowCreate.style.display = "block";
    });
    
    
  },
  false
);
