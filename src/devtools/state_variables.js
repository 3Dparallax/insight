function getStateVariables(e) {
    sendMessage(messageType.STATE_VARS, "getStateVariables");
}

document.getElementById("getStates").addEventListener("click", getStateVariables);

function convertStateVarDataIntoTableData(initialStateVarData) {
    var retData = [];
    for(var key in initialStateVarData) {
        var dataElement = {};
        dataElement.name = key;
        dataElement.value = initialStateVarData[key];
        retData.push(dataElement);
    }
    return retData;
}

function initializeStateVariableTable(initialStateVarData) {
    var tableData = convertStateVarDataIntoTableData(initialStateVarData);

    // Creating the table with initial values
    $('#stateVarTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'State'
        }],
        data: tableData
    });
}

function updateStateVariableTable(newStateVarData) {
    if (!glpFrontEnd.stateVariableTableInitialized) {
        initializeStateVariableTable(newStateVarData);
        glpFrontEnd.stateVariableTableInitialized = true;
    } else {
        var tableElement = $("#stateVarTableCollected")
        var idx = 0;
        for (var key in newStateVarData) {
            var action = 'updateRow';
            $('#stateVarTable').bootstrapTable(action, {
                index: idx,
                row: {
                    name: key,
                    value: newStateVarData[key]
                }
            });
            idx++;
        }
    }
}
