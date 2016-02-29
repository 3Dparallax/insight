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

    if (msg.type == messageType.CALL_STACK) {
        displayCallStack(msg.data.functionNames);
    } else if (msg.type == messageType.GET_PROGRAM_USAGE_COUNT) {
        for( var programUsage in msg.data.programUsageCount ) {
            console.log(msg.data.programUsageCount[programUsage]);
        }
    } else if (msg.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
        for( var duplicatedProgram in msg.data.duplicateProgramUses ) {
            // console.log(duplicatedProgram);
        }
    } else if (msg.type == messageType.TEXTURE) {
        displayTexture(msg.data);
    } else if (msg.type == messageType.TEXTURE_LIST) {
        updateTextureList(msg.data.length);
    } else if (msg.type == messageType.FUNCTION_HISTOGRAM) {
        try {
            displayHistogram(msg.data);
        } catch(e) {
            console.log(e);
        }
    } else if (msg.type == messageType.GET_CONTEXTS) {
        updateContexts(JSON.parse(msg.data.contexts));
    }

    console.log(msg);
});

function sendMessage(type, data) {
    console.log("Sending: " + JSON.stringify(data));
    backgroundPageConnection.postMessage({source: "panel", type: type, data: data});
}

function pixelInspectorChanged(e) {
    var checked = document.getElementById("pixelInspectorEnable").checked;
    var data = {"enabled": checked};
    sendMessage(messageType.PIXEL_INSPECTOR, data);
}

document.getElementById("pixelInspector").addEventListener("click", pixelInspectorChanged);

function getCallsSinceDraw(e) {
    sendMessage(messageType.CALL_STACK, "callsSinceDraw");
}

document.getElementById("callsSinceDraw").addEventListener("click", getCallsSinceDraw);

function getMostRecentCalls(e) {
    sendMessage(messageType.CALL_STACK, "mostRecentCalls");
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
    sendMessage(messageType.FUNCTION_HISTOGRAM, {threshold: 10});
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
    var imageData = ctx.getImageData(0, 0, 256, 256);
    imageData.data.set(texture.pixels);
    ctx.putImageData(imageData, 0, 0);
}

function updateTextureList(length) {
    var textureList = document.getElementById("textures-list");
    textureList.innerHTML = ""

    for (var i = 0; i < length; i++) {
        var textureElement = document.createElement("div");
        textureElement.classList.add("texture-element");
        textureElement.innerHTML = "Texture" + i;
        textureElement.id = i;
        textureList.appendChild(textureElement);
        textureElement.onclick = function() {
            sendMessage(messageType.TEXTURE, { "index" : this.id } );
        }
    }
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);


// Program Usage Count

function beginProgramUsageCount(e) {
    sendMessage(messageType.BEGIN_PROGRAM_USAGE_COUNT, "beginProgramUsageCount")
}

document.getElementById("beginProgramUsageCount").addEventListener("click", beginProgramUsageCount);

function stopProgramUsageCount(e) {
    sendMessage(messageType.STOP_PROGRAM_USAGE_COUNT, "stopProgramUsageCount")
}

document.getElementById("stopProgramUsageCount").addEventListener("click", stopProgramUsageCount);

function resetProgramUsageCount(e) {
    sendMessage(messageType.RESET_PROGRAM_USAGE_COUNT, "resetProgramUsageCount")
}

document.getElementById("resetProgramUsageCount").addEventListener("click", resetProgramUsageCount);

function getProgramUsageCount(e) {
    sendMessage(messageType.GET_PROGRAM_USAGE_COUNT, "getProgramUsageCount")
}

document.getElementById("getProgramUsageCount").addEventListener("click", getProgramUsageCount);

function toggleDuplicateProgramUsage(e) {
    var checked = document.getElementById("toggleDuplicateProgramUsage").checked;
    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE, data)
}

document.getElementById("toggleDuplicateProgramUsage").addEventListener("click", toggleDuplicateProgramUsage);

function getDuplicateProgramUse(e) {
    sendMessage(messageType.GET_DUPLICATE_PROGRAM_USAGE, "getDuplicateProgramUse")
}

document.getElementById("getDuplicateProgramUse").addEventListener("click", getDuplicateProgramUse);

function getTextures(e) {
    sendMessage(messageType.TEXTURE, { "index" : "0" } );
}

document.getElementById("getTextures").addEventListener("click", getTextures);
