function toggleStateViewer(e) {
    var checked = document.getElementById("stateViewerEnabled").checked;
    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_STATE_VARS, data)
    sendMessage(messageType.STATE_VARS, "getStateVariables");
}

document.getElementById("toggleStateViewer").addEventListener("click", toggleStateViewer);

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

function initializeStateVariableEventListeners() {
    var checkEvent = function (e, row, element) {
        sendMessage(messageType.STATE_VARS, {
            variable: row.name,
            enable: element[0].checked
        })
    };
    $('#stateVarTable').on('check.bs.table', checkEvent)
    $('#stateVarTable').on('uncheck.bs.table', checkEvent);
    $('#stateVarTable').on('check-all.bs.table', function(e, rows) {
        for (var i = 0; i < rows.length; i++) {
            sendMessage(messageType.STATE_VARS, {
                variable: rows[i].name,
                enable: true
            })
        }
    });
    $('#stateVarTable').on('check-all.bs.table', function(e, rows) {
        for (var i = 0; i < rows.length; i++) {
            sendMessage(messageType.STATE_VARS, {
                variable: rows[i].name,
                enable: false
            })
        }
    });

}

function initializeStateVariableTables(initialStateVarData) {
    $('#stateVarTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'State',
            checkbox: true
        }],
        data: convertStateVarDataIntoTableData(initialStateVarData)
    });
    initializeStateVariableEventListeners()
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
            row: dataPair,
            uniqueId: dataPair.name
        });
    }
}
