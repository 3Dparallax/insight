function toggleStateViewer(e) {
    var checked = document.getElementById("stateViewerEnabled").checked;
    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_STATE_VARS, data)
    sendMessage(messageType.STATE_VARS, "getStateVariables");
}

document.getElementById("toggleStateViewer").addEventListener("click", toggleStateViewer);

function convertStateVarDataIntoTableData(initialStateVarData) {
    var retData = [];
    for (var key in initialStateVarData) {
        var dataElement = {};
        dataElement.name = key;
        dataElement.value = initialStateVarData[key];
        retData.push(dataElement);
    }
    return retData;
}

function initializeStateVariableEventListeners() {
    var checkEvent = function (e, row, element) {
        sendMessage(messageType.STATE_VARS, {
            variable: row.name,
            enable: element[0].checked
        })
    };
    $('#stateVarBoolTable').on('check.bs.table', checkEvent)
    $('#stateVarBoolTable').on('uncheck.bs.table', checkEvent);
    $('#stateVarBoolTable').on('check-all.bs.table', function(e, rows) {
        for (var i = 0; i < rows.length; i++) {
            sendMessage(messageType.STATE_VARS, {
                variable: rows[i].name,
                enable: true
            })
        }
    });
    $('#stateVarBoolTable').on('check-all.bs.table', function(e, rows) {
        for (var i = 0; i < rows.length; i++) {
            sendMessage(messageType.STATE_VARS, {
                variable: rows[i].name,
                enable: false
            })
        }
    });

}

function initializeStateVariableTables(initialStateVarData) {
    $('#stateVarBoolTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'State',
            checkbox: true
        }],
        data: convertStateVarDataIntoTableData(initialStateVarData.boolStates)
    });
    initializeStateVariableEventListeners()
    $('#stateVarNumTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'Value',
        }],
        data: convertStateVarDataIntoTableData(initialStateVarData.numberStates)
    });
    $('#stateVarEnumTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'State',
        }],
        data: convertStateVarDataIntoTableData(initialStateVarData.enumStates)
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
    tableIDs = {
        boolStates: '#stateVarBoolTable',
        numberStates: '#stateVarNumTable',
        enumStates: '#stateVarEnumTable',
    }
    for (type in newStateVarData.data) {
        tableData = convertStateVarDataIntoTableData(newStateVarData.data[type]);
        for (var i = 0; i < tableData.length; i++) {
            dataPair = tableData[i]
            var action = 'updateRow';
            $(tableIDs[type]).bootstrapTable(action, {
                index: i,
                row: dataPair,
                uniqueId: dataPair.name
            });
        }
    }
}
