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
        displayCallStack(msg.data.functionNames);
    } else if (msg.type == "getProgramUsageCount") {
        for( var programUsage in msg.data.programUsageCount ) {
            console.log(msg.data.programUsageCount[programUsage]);
        }
    } else if (msg.type == "getDuplicateProgramUsage") {
        for( var duplicatedProgram in msg.data.duplicateProgramUses ) {
            // console.log(duplicatedProgram);
        }
    } else if (msg.type == "Texture") {
        displayTexture(msg.data);
    } else if (msg.type == "Textures") {
        updateTextureList(msg.data.length);
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
    var checked = document.getElementById("pixelInspectorEnable").checked;
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

function displayCallStack(callStack) {
    var callStackTable = document.getElementById("callStackTable");
    while (callStackTable.firstChild) {
        callStackTable.removeChild(callStackTable.firstChild);
    }
    var callStackInnerHTML = "<tr><th>Execution Time</th><th>Function</th><th>Duration(&mu;s)</th><th>Arguments</th></tr>";
    for (var i = 0; i < callStack.length; i++) {
        console.log(callStack[i]);
        var functionName = callStack[i][0];
        var functionArgs = callStack[i][1];
        var functionDuration = callStack[i][2];
        var functionTimeOfExecution = callStack[i][3];
        var rowClass = "callStack";
        if (i > 0 && i < callStack.length - 1
            && (callStack[i][0] == callStack[i - 1][0] ||
                callStack[i][0] == callStack[i + 1][0])) {
            rowClass = "callStackRepeated";
        }
        callStackInnerHTML += "<tr class=\"" + rowClass +"\">";
        callStackInnerHTML += "<td style=\"border-right:1px solid\">" + functionTimeOfExecution + "</td>";
        callStackInnerHTML += "<td>" + functionName + "</td>";
        callStackInnerHTML += "<td>" + functionDuration + "</td>";
        callStackInnerHTML += "<td>" + functionArgs + "</td>";
        callStackInnerHTML += "</tr>";
    }
    callStackTable.innerHTML = callStackInnerHTML;
}

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

function displayTexture(texture) {
    console.log("Displaying texture");
    var ctx = document.getElementById("textureCanvas").getContext("2d");
    var imageData = ctx.getImageData(0, 0, 512, 512);
    imageData.data.set(texture.pixels);
    ctx.putImageData(imageData, 0, 0);
}

function updateTextureList(length) {
    console.log("Update textures list");
    var textureTable = document.getElementById("texturesTable");

    while (textureTable.firstChild) {
        textureTable.removeChild(textureTable.firstChild);
    }

    var textureTableInnerHTML = "";
    for (var i = 0; i < length; i++) {
        textureTableInnerHTML += "<tr>";
        textureTableInnerHTML += "<td>" + "Texture" + i + "</td>";
        textureTableInnerHTML += "</tr>";
    }
    textureTable.innerHTML = textureTableInnerHTML;

    for (var i = 0; i < textureTable.rows.length; i++) {
        textureTable.rows[i].onclick = function() {
            var index = this.rowIndex + 1;
            sendMessage("getTexture", { "index" : index } );
        }
    }
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);


// Program Usage Count

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

function getTextures(e) {
    sendMessage("getTexture", { "index" : "0" } );
}

document.getElementById("getTextures").addEventListener("click", getTextures);
