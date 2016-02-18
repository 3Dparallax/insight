// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.onMessage.addListener(function(msg) {
    if (msg.source != "content") {
        return;
    }

    var newdiv = document.createElement("DIV");
    newdiv.appendChild(document.createTextNode(JSON.stringify(msg)));
    document.body.appendChild(newdiv);

    console.log(msg);
});

function sendMessage(data) {
    backgroundPageConnection.postMessage({source: "panel", data: data});
}

function testSend() {
    sendMessage({"hello": "world"});
}

document.getElementById("send").addEventListener("click", testSend);
