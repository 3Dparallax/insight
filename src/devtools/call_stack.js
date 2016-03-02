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
        var functionName = callStack[i].name;
        var functionArgs = callStack[i].args;
        var functionDuration = callStack[i].time;
        var functionTimeOfExecution = callStack[i].executionTime;
        var rowClass = "callStack";
        if (i > 0 && i < callStack.length - 1
            && (callStack[i].name == callStack[i - 1].name ||
                callStack[i].name == callStack[i + 1].name)) {

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