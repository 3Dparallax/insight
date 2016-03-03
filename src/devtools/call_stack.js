glpFrontEnd.callStackTableInitialized = false;

function getCallsSinceDraw(e) {
    var checked = document.getElementById("callStackEnabled").checked;
    if (!checked) return;
    sendMessage(messageType.GET_CALL_STACK, "bothCallStacks");
}

document.getElementById("getCallStack").addEventListener("click", getCallsSinceDraw);

function toggleCallStack(e) {
    var checked = document.getElementById("callStackEnabled").checked;
    var firstTimeEnabling = (document.getElementById("callStackNotEnabled").style.display != "none");
    if (checked && firstTimeEnabling) {
        document.getElementById("callStackNotEnabled").style.display = "none";
        document.getElementById("callStackCollecting").style.display = "block";
    }
    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_CALL_STACK, data)
}

document.getElementById("toggleCallStack").addEventListener("click", toggleCallStack);

function convertCallStackDataIntoTableData(callStack) {
    var retData = [];
    for (var i = 0; i < callStack.length; i++) {
        var obj = callStack[i];
        var objElement = {};
        objElement.execTime = obj.executionTime;
        objElement.fcn = obj.name;
        objElement.duration = obj.time;
        objElement.args = obj.args;
        retData.push(objElement);
    }
    return retData;
}

function updateCallStackTables(initialCallStack) {
    document.getElementById("callStackNotEnabled").style.display = "none";
    document.getElementById("callStackCollecting").style.display = "none";
    document.getElementById("callStackCollected").style.display = "block";
    var mostRecentData = convertCallStackDataIntoTableData(initialCallStack.mostRecentCalls);
    var lastDrawnTable = convertCallStackDataIntoTableData(initialCallStack.callsSinceDraw);

    if (!glpFrontEnd.callStackTableInitialized) {
        $('#mostRecentCallTable').bootstrapTable({});
        $('#lastDrawnCallTable').bootstrapTable({});
        glpFrontEnd.callStackTableInitialized = true;
    }

    $('#lastDrawnCallTable').bootstrapTable("load", lastDrawnTable);
    $('#mostRecentCallTable').bootstrapTable("load", mostRecentData);
}

