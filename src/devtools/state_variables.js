function getStateVariables(e) {
    sendMessage(messageType.STATE_VARS, "getStateVariables");
}

document.getElementById("getStates").addEventListener("click", getStateVariables);

function convertStateVarDataIntoTableData(initialStateVarData) {
    var retData = [];
    for (var type in initialStateVarData) {
        for (var key in initialStateVarData[type]) {
            var dataElement = {};
            dataElement.name = key;
            dataElement.value = initialStateVarData[type][key];
            retData.push(dataElement);
        }
    }
    return retData;
}

function initializeStateVariableTables(initialStateVarData) {
    $('#stateVarTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'State'
        }],
        data: convertStateVarDataIntoTableData(initialStateVarData)
    });
}

function updateStateVariableTables(newStateVarData) {
    if (Object.keys(newStateVarData).length === 0) {
        return;
    }
    if (!newStateVarData.initialized) {
        initializeStateVariableTables(newStateVarData.data);
        newStateVarData.initialized = true;
        return;
    }
    tableData = convertStateVarDataIntoTableData(newStateVarData.data);
    for (var i = 0; i < tableData.length; i++) {
        dataPair = tableData[i]
        var action = 'updateRow';
        $('#stateVarTable').bootstrapTable(action, {
            index: i,
            row: dataPair
        });
    }
}
