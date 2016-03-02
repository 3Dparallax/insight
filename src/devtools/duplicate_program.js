function convertProgramDuplicateDataIntoTableData(initialProgramData) {
    var retData = [];
    for (var i = 0; i < initialProgramData.length; i++) {
        var dataElement = {};
        var obj = initialProgramData[i];
        dataElement.programID = obj.programId;
        dataElement.filenameLinenumber = obj.fileName + " : " + obj.lineNumber;
        dataElement.functionName = obj.functionName;
        dataElement.count = obj.count;
        retData.push(dataElement);
    }
    return retData;
}

function initializeProgramDuplicatesTable(initialProgramData) {
    document.getElementById("programDuplicateTableNotEnabled").style.display = "none";
    document.getElementById("programDuplicateTableCollecting").style.display = "none";
    document.getElementById("programDuplicateTableCollected").style.display = "inline";

    var tableData = convertProgramDuplicateDataIntoTableData(initialProgramData);

    // Creating the table with initial values
    $('#programDuplicateTable').bootstrapTable({
        columns: [{
            field: 'programID',
            title: 'Program'
        },
        {
            field: 'filenameLinenumber',
            title: 'Filename : Linenumber'
        },
        {
            field: 'functionName',
            title: 'Function Name'
        }],
        data: tableData
    });
}

function updateProgramDuplicateTable(newProgramData) {
    if( !glpFrontEnd.programDuplicateTableInitialized ) {
        initializeProgramDuplicatesTable(newProgramData);
        glpFrontEnd.programDuplicateTableInitialized = true;
        glpFrontEnd.programDuplicateData = newProgramData;
    } else {
        var idx = 0;
        for (var i = 0; i < newProgramData.length; i++) {
            var obj = newProgramData[i];
            if (glpFrontEnd.programDuplicateData[programIdKey] != undefined) {
                // Update the row
                action = 'updateRow';
                glpFrontEnd.programDuplicateData[programIdKey] = obj;
            } else {
                // Otherwise, add a row for it right in the same index
                action = 'insertRow';
            }

            $('#programDuplicateTable').bootstrapTable(action, {
                index: idx,
                row: {
                    programID: obj.programId,
                    filenameLinenumber : obj.fileName + " : " + obj.lineNumber,
                    functionName : obj.functionName
                }
            });
            idx++;
        }
    }
}

function toggleDuplicateProgramUsage(e) {
    var checked = document.getElementById("programDuplicatesEnabled").checked;
    var firstTimeEnabling = (document.getElementById("programDuplicateTableNotEnabled").style.display != "none");
    if (checked && firstTimeEnabling) {
        document.getElementById("programDuplicateTableNotEnabled").style.display = "none";
        document.getElementById("programDuplicateTableCollecting").style.display = "block";
    }
    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE, data)
}

document.getElementById("toggleProgramDuplicates").addEventListener("click", toggleDuplicateProgramUsage);

function getDuplicateProgramUse(e) {
    var checked = document.getElementById("programDuplicatesEnabled").checked;
    if (!checked) return;
    sendMessage(messageType.GET_DUPLICATE_PROGRAM_USAGE, "getDuplicateProgramUse")
}

document.getElementById("getProgramDuplicates").addEventListener("click", getDuplicateProgramUse);

function resetProgramDuplicates(e) {
    var checked = document.getElementById("programDuplicatesEnabled").checked;
    if (!checked) return;
    sendMessage(messageType.RESET_DUPLICATE_PROGRAM_USAGE, "resetDuplicateProgramUsage")
}

document.getElementById("resetProgramDuplicates").addEventListener("click", resetProgramDuplicates);

