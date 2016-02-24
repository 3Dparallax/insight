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
    } else if (msg.type == "getProgramUsageCount") {
        for( var programUsage in msg.data.programUsageCount ) {
            console.log(msg.data.programUsageCount[programUsage]);
        }
    } else if (msg.type == "getDuplicateProgramUsage") {
        for( var duplicatedProgram in msg.data.duplicateProgramUses ) {
            // console.log(duplicatedProgram);
        }
    }

    if (msg.type == "FunctionHistogram") {
        try {
            displayHistogram(msg.data);
        } catch(e) {
            console.log(e);
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


// Program Usage Count

document.getElementById("mostRecentCalls").addEventListener("click", getMostRecentCalls);

function getFunctionHistogram(e) {
    sendMessage("functionHistogramRequest", {threshold: 10});
}

function displayHistogram(histogram) {
    var data = {
        labels: histogram.labels,
        datasets: [
            {
                label: "Call Frequency",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: histogram.values
            }
        ]
    };
    console.log("Displaying histogram");
    var ctx = document.getElementById("myChart").getContext("2d");
    var myBarChart = new Chart(ctx).Bar(data, {});
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);

function beginProgramUsageCount(e) {
    sendMessage("beginProgramUsageCount", "beginProgramUsageCount")
}

document.getElementById("beginProgramUsageCount").addEventListener("click", beginProgramUsageCount);

function stopProgramUsageCount(e) {
    sendMessage("stopProgramUsageCount", "stopProgramUsageCount")
}

document.getElementById("stopProgramUsageCount").addEventListener("click", stopProgramUsageCount);

function resetProgramUsageCount(e) {
    sendMessage("resetProgramUsageCount", "resetProgramUsageCount")
}

document.getElementById("resetProgramUsageCount").addEventListener("click", resetProgramUsageCount);

function getProgramUsageCount(e) {
    sendMessage("getProgramUsageCount", "getProgramUsageCount")
}

document.getElementById("getProgramUsageCount").addEventListener("click", getProgramUsageCount);

function toggleDuplicateProgramUsage(e) {
    var checked = document.getElementById("toggleDuplicateProgramUsage").checked;
    var data = {"enabled": checked};
    sendMessage("toggleDuplicateProgramUsage", data)
}

document.getElementById("toggleDuplicateProgramUsage").addEventListener("click", toggleDuplicateProgramUsage);

function getDuplicateProgramUse(e) {
    sendMessage("getDuplicateProgramUse", "getDuplicateProgramUse")
}

document.getElementById("getDuplicateProgramUse").addEventListener("click", getDuplicateProgramUse);