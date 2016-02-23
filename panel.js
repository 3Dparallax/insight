// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.onMessage.addListener(function(msg) {
    if (msg.type == "CallStack") {
        console.log(msg.data.functionNames.length);
        for (var i = 0; i < msg.data.functionNames.length; i++) {
            console.log(msg.data.functionNames[i]);
        }
    }

    if (msg.type == "FunctionHistogram") {
        console.log("HISTOGRAM");
        console.log(Object.keys(msg.data.histogram).length);
        console.log("FUNCTIONHISTOGRAM");
        for (var functionName in msg.data.histogram) {
            console.log(functionName + " " + msg.data.histogram[functionName]);
        }
    }

    if (msg.source != "content") {
        return;
    }

    var newdiv = document.createElement("DIV");
    newdiv.appendChild(document.createTextNode(JSON.stringify(msg.data)));
    document.body.appendChild(newdiv);

    console.log(msg);
});

function sendMessage(type, data) {
    console.log("Sending: " + JSON.stringify(data));
    backgroundPageConnection.postMessage({source: "panel", type: type, data: data});
}

function pixelInspectorChanged(e) {
    var checked = document.getElementById("pixelInspector").checked;
    var data = {"enabled": checked};
    sendMessage("pixelInspector", data);
}

document.getElementById("pixelInspector").addEventListener("click", pixelInspectorChanged);

function testSend() {
    sendMessage("test", {"hello": "world"});
}

document.getElementById("send").addEventListener("click", testSend);

function getCallsSinceDraw(e) {
    sendMessage("callStackRequest", "callsSinceDraw");
}

document.getElementById("callsSinceDraw").addEventListener("click", getCallsSinceDraw);

function getMostRecentCalls(e) {
    sendMessage("callStackRequest", "mostRecentCalls");
}

document.getElementById("mostRecentCalls").addEventListener("click", getMostRecentCalls);

function getFunctionHistogram(e) {
    sendMessage("functionHistogramRequest", "");
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);
