document.getElementById("frameControlPlay").addEventListener("click", function(e) {
    sendMessage(messageType.FRAME_CONTROL_PLAY, "");
});

document.getElementById("frameControlPause").addEventListener("click", function(e) {
    sendMessage(messageType.FRAME_CONTROL_PAUSE, "");
});

