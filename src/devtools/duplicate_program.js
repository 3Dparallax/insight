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
