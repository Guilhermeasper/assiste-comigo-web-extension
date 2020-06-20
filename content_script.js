console.log("Content script executando");

var client = io.connect("https://assistecomigo.herokuapp.com/");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getVideo() {

  const videos = document.querySelectorAll("video");
  var video;
  videos.forEach((element) => {
    if (element.src.split(":")[0] == "blob") {
      video = element;
    }
  });
  return video;
}

function set_url(url) {
  chrome.storage.local.set({ url: url }, function () {
    console.log("URL value is set to " + url);
  });
}

// $(document).ready(() => {
//   $(document).click((event) => {
//     if (document.querySelectorAll(".dv-player-fullscreen").length == 0) {
//       teste =
//         "https://www.primevideo.com/" +
//         $(event.target).parent().parent().parent().attr("href");
//       set_url(teste);
//     } else if (
//       $(event.target)
//         .parent()
//         .parent()
//         .attr("class")
//         .toString()
//         .includes("closeButtonWrapper")
//     ) {
//       chrome.storage.local.remove(["sessionId"], function () {
//         console.log("SID removed");
//       });
//     }
//   });
// });

function getSessionId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["sessionId"], (result) => {
      storage_sessionId = result.sessionId;
      console.log("sessionId value currently is " + result.sessionId);
      resolve(storage_sessionId);
    });
  });
}

function setsessionId(newSessionId) {
  chrome.storage.local.set({ sessionId: newSessionId }, function () {
    console.log("SID value is set to " + newSessionId);
  });
}

function gen_sendMessage(msg) {
  chrome.runtime.sendMessage(msg);
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  console.log(msg);
  
  var video = getVideo();
  console.log(video);

  // homescreen return
  if (document.querySelectorAll(".dv-player-fullscreen").length == 0 && document.location.href.includes("primevideo.com")) {
    response({page:"homepage"});
    return true;
  }

  let info;

  if (msg.command == "info") {
    chrome.storage.local.get(["url"], (result) => {
      console.log("url value currently is " + result.url);
      try {
        info = {
          page : "player",
          address: document.location.href,
          time: video.currentTime,
          url: result.url,
        };
        response(info);
      } catch (err) {
        console.log(err);
        response("err");
      }
    });
  } else if(msg.command == "create"){
    client.emit("create", { id: msg.sessionId });
    video.addEventListener("pause", () => {
      client.emit("pause",{id: msg.sessionId} );
    });
    video.addEventListener("play", () => {
      client.emit("play",{id: msg.sessionId} );
    });
  
    video.addEventListener("seeking", () =>{
      client.emit("seek", {id: msg.sessionId, time: video.currentTime});
    })
    client.on("room_play", (data) => {
      video.play();
    });
  
    client.on("room_pause", (data) => {
      video.pause();
    });
  
    client.on("room_seek", (data) => {
      video.currentTime = data.time;
    });
  } else if(msg.command == "connection"){
    client.emit("sessionConnect", { id: msg.sessionId });
    video.addEventListener("pause", () => {
      client.emit("pause",{id: msg.sessionId} );
    });
    video.addEventListener("play", () => {
      client.emit("play",{id: msg.sessionId} );
    });
  
    video.addEventListener("seeking", () =>{
      client.emit("seek", {id: msg.sessionId, time: video.currentTime});
    })
    client.on("room_play", (data) => {
      video.play();
    });
  
    client.on("room_pause", (data) => {
      video.pause();
    });
    client.on("room_seek", (data) => {
      video.currentTime = data.time;
    });
  } else if (msg.command == "disconnect"){
    client.emit("leaveSession", {id: msg.sessionId})
  }else if (msg.command == "play_test"){
    video.play()
  }else if (msg.command == "pause_test"){
    video.pause()
  }
  return true;
});
