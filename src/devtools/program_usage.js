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
