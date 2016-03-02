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
        var idx = 0;
        for(var programIdKey in newProgramData) {
            var action = '';
            if (glpFrontEnd.programUsageData[programIdKey] != undefined) {
                // Update the row
                action = 'updateRow';
                glpFrontEnd.programUsageData[programIdKey] = newProgramData[programIdKey];
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
    var checked = document.getElementById("programUsageEnabled").checked;
    if (!checked) return;
    sendMessage(messageType.RESET_PROGRAM_USAGE_COUNT, "resetProgramUsageCount")
}

document.getElementById("resetProgramUsageCount").addEventListener("click", resetProgramUsageCount);

function getProgramUsageCount(e) {
    var checked = document.getElementById("programUsageEnabled").checked;
    if (!checked) return;
    sendMessage(messageType.GET_PROGRAM_USAGE_COUNT, "getProgramUsageCount")
}

document.getElementById("getProgramUsageCount").addEventListener("click", getProgramUsageCount);
