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