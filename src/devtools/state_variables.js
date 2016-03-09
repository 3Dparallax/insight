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
            type: "bool",
            variable: row.name,
            enable: element[0].checked
        });
    };
    $('#stateVarBoolTable').on('check.bs.table', checkEvent)
    $('#stateVarBoolTable').on('uncheck.bs.table', checkEvent);
    $('#stateVarBoolTable').on('check-all.bs.table', function(e, rows) {
        for (var i = 0; i < rows.length; i++) {
            sendMessage(messageType.STATE_VARS, {
                type: "bool",
                variable: rows[i].name,
                enable: true
            });
        }
    });
    $('#stateVarBoolTable').on('check-all.bs.table', function(e, rows) {
        for (var i = 0; i < rows.length; i++) {
            sendMessage(messageType.STATE_VARS, {
                type: "bool",
                variable: rows[i].name,
                enable: false
            });
        }
    });

}

function initializeBoolTable(data) {
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
        data: convertStateVarDataIntoTableData(data)
    });
    initializeStateVariableEventListeners();
}

function isEditableState(name) {
    isEditable = [
                  "DEPTH_CLEAR_VALUE",
                  "LINE_WIDTH",
                  "PACK_ALIGNMENT",
                  "POLYGON_OFFSET_FACTOR",
                  "POLYGON_OFFSET_UNITS",
                  "STENCIL_REF",
                  "STENCIL_BACK_REF",
                 ]
    return (isEditable.indexOf(name) != -1)
}

function addTextboxToNumberTable() {
    rowElements = $('#stateVarNumTable').children()[1].children;
    for (var i = 0; i < rowElements.length; i++) {
        name = rowElements[i].children[0].innerText;
        if (!isEditableState(name)) {
            continue;
        }
        var input = document.createElement("input");
        input.type = "number";
        input.id = name + "Input";
        cell = rowElements[i].children[1];
        input.defaultValue = cell.innerText;
        cell.innerText = "";

        input.addEventListener("change", function(variableName){
            return function() {
                sendMessage(messageType.STATE_VARS, {
                    type: "num",
                    variable: variableName,
                    value: document.getElementById(variableName + "Input").value
                });
            };
        }(name));
        cell.appendChild(input);
    }
}

function initializeNumberTable(data) {
    $('#stateVarNumTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'Value',
        }],
        data: convertStateVarDataIntoTableData(data),
        uniqueId: "unique"
    });
    addTextboxToNumberTable();
}

function initializeEnumTable(data) {
    $('#stateVarEnumTable').bootstrapTable({
        columns: [{
            field: 'name',
            title: 'Variable'
        },
        {
            field: 'value',
            title: 'State',
        }],
        data: convertStateVarDataIntoTableData(data)
    });
}

function initializeStateVariableTables(initialStateVarData) {
    initializeBoolTable(initialStateVarData.boolStates);
    initializeNumberTable(initialStateVarData.numberStates);
    initializeEnumTable(initialStateVarData.enumStates);
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
            });
        }
    }
    addTextboxToNumberTable();
}
