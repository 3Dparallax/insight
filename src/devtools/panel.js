var glpFrontEnd = {};

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

    if (msg.type == messageType.GET_CONTEXTS) {
        updateContexts(JSON.parse(msg.data.contexts));
        return;
    }

    if (!msg.activeContext) {
        console.log("All messages must specify an active context uuid");
        return;
    }

    var state = getContextState(msg.activeContext);

    if (msg.type == messageType.CALL_STACK) {
        state.callStack = msg.data.functionNames;
    } else if (msg.type == messageType.GET_PROGRAM_USAGE_COUNT) {
        state.programUsageCount = msg.data.programUsageCount;
        updateProgramUsageTable(JSON.parse(msg.data.programUsageCount));
    } else if (msg.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
        state.duplicateProgramUses = msg.data.duplicateProgramUses;
    } else if (msg.type == messageType.GET_TEXTURE) {
        state.texture = msg.data;
    } else if (msg.type == messageType.GET_TEXTURES) {
        state.textureList = msg.data.length;
    } else if (msg.type == messageType.FUNCTION_HISTOGRAM) {
        state.histogram = msg.data;
    }

    if (states.activeContext == msg.activeContext) {
        updateTabs(state);
    }

    console.log(msg);
});

function sendMessage(type, data) {
    console.log("Sending: " + JSON.stringify(data));
    backgroundPageConnection.postMessage({ "source": "panel", "activeContext": states.activeContext,  "type": type, "data": data});
}

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
    if (histogram == null) {
        return;
    }
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

function convertProgramUsageDataIntoTableData(initialProgramData) {
    var retData = [];
    for(var programIdKey in initialProgramData) {
        var dataElement = {};
        dataElement.programID = programIdKey;
        dataElement.count = initialProgramData[programIdKey];
        retData.push(dataElement);
    }
    return retData;
}

function initializeProgramUsageTable(initialProgramData) {
    document.getElementById("programUsageTableNotEnabled").style.display = "none";
    document.getElementById("programUsageTableCollecting").style.display = "none";
    document.getElementById("programUsageTableCollected").style.display = "inline";

    var tableData = convertProgramUsageDataIntoTableData(initialProgramData);

    // Creating the table with initial values
    $('#programUsageTable').bootstrapTable({
        columns: [{
            field: 'programID',
            title: 'Program'
        },
        {
            field: 'count',
            title: 'Usage Count'
        }],
        data: tableData
    });
}

function updateProgramUsageTable(newProgramData) {
    if( !glpFrontEnd.programUsageTableInitialized ) {
        initializeProgramUsageTable(newProgramData);
        glpFrontEnd.programUsageTableInitialized = true;
        glpFrontEnd.programUsageData = newProgramData;
    } else {
        var tableElement = $("#programUsageTableCollected")
        var idx = 0;
        for(var programIdKey in newProgramData) {
            var action = '';
            if (glpFrontEnd.programUsageData[programIdKey] != undefined) {
                // Update the row
                action = 'updateRow';
            } else {
                // Otherwise, add a row for it right in the same index
                action = 'insertRow';
            }
            $('#programUsageTable').bootstrapTable(action, {
                index: idx,
                row: {
                    programID: programIdKey,
                    count: newProgramData[programIdKey]
                }
            });
            idx++;
        }
    }
}

function displayTexture(texture) {
    if (texture == null) {
        return;
    }
    var ctx = document.getElementById("textureCanvas").getContext("2d");
    var imageData = ctx.getImageData(0, 0, 256, 256);
    imageData.data.set(texture.pixels);
    ctx.putImageData(imageData, 0, 0);
}

function updateTextureList(length) {
    var textureList = document.getElementById("textures-list");

    var elementsToAdd = length - textureList.children.length;
    if (elementsToAdd == 0) {
        return;
    }

    var baseIndex = textureList.children.length;
    if (elementsToAdd < 0) {
        textureList.innerHTML = "";
        elementsToAdd = length;
        baseIndex = 0;
    }

    for (var i = 0; i < elementsToAdd; i++) {
        var elementIndex = i + baseIndex;

        var textureElementA = document.createElement("a");
        textureElementA.href = "#";
        textureElementA.innerHTML = "texture" + elementIndex;

        var textureElementLi = document.createElement("li");
        textureElementLi.id = elementIndex;
        textureElementLi.appendChild(textureElementA);

        textureElementLi.onclick = function() {
            sendMessage(messageType.GET_TEXTURE, { "index": this.id });
        };

        textureList.appendChild(textureElementLi);
    }
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);


// Program Usage Count
function toggleProgramUsageCount(e) {
    var checked = document.getElementById("programUsageEnabled").checked;
    var firstTimeEnabling = (document.getElementById("programUsageTableNotEnabled").style.display != "none");
    if(checked && firstTimeEnabling) {
        document.getElementById("programUsageTableNotEnabled").style.display = "none";
        document.getElementById("programUsageTableCollecting").style.display = "block";
    }

    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_PROGRAM_USAGE_COUNT, data);
}

document.getElementById("toggleProgramUsageCount").addEventListener("click", toggleProgramUsageCount);


function resetProgramUsageCount(e) {
    alert("resetting program usage count")
    sendMessage(messageType.RESET_PROGRAM_USAGE_COUNT, "resetProgramUsageCount")
}

document.getElementById("resetProgramUsageCount").addEventListener("click", resetProgramUsageCount);

function getProgramUsageCount(e) {
    var checked = document.getElementById("programUsageEnabled").checked;
    if (!checked) return;
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
    sendMessage(messageType.GET_TEXTURES, "");
}

document.getElementById("getTextures").addEventListener("click", getTextures);
