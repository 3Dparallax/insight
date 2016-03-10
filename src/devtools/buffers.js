function displayBuffer(buffer) {
    if (buffer == null) {
        return;
    }

    var bufferParams = document.getElementById("bufferParameters");
    bufferParams.innerHTML = "";

    var deletedTerm = document.createElement("dt");
    deletedTerm.innerHTML = "Deleted";
    bufferParams.appendChild(deletedTerm);

    var deletedDescription = document.createElement("dd");
    deletedDescription.innerHTML = buffer.deleted ? "Destroyed" : "Active";
    bufferParams.appendChild(deletedDescription);

    var bufferDataTerm = document.createElement("dt");
    bufferDataTerm.innerHTML = "bufferData";
    bufferParams.appendChild(bufferDataTerm);

    if (buffer.bufferDataCalls) {
        for (var i = 0; i < buffer.bufferDataCalls.length; i++) {
            var bufferDataDescription = document.createElement("dd");
            bufferDataDescription.innerHTML = buffer.bufferDataCalls[i];
            bufferParams.appendChild(bufferDataDescription);
        }
    }

    var bufferSubDataTerm = document.createElement("dt");
    bufferSubDataTerm.innerHTML = "bufferSubData";
    bufferParams.appendChild(bufferSubDataTerm);

    if (buffer.bufferSubDataCalls) {
        for (var i = 0; i < buffer.bufferSubDataCalls.length; i++) {
            var bufferSubDataDescription = document.createElement("dd");
            bufferSubDataDescription.innerHTML = buffer.bufferSubDataCalls[i];
            bufferParams.appendChild(bufferSubDataDescription);
        }
    }
}

function updateBufferTable(bootstrapTableId, length, onRowClick) {
    var bufferData = [];
    for (var i = 0; i < length; i++) {
        var value = "buffer" + i;
        var element = { "bufferId" : value };
        bufferData.push(element);
    }

    if (length == 0) {
        $(bootstrapTableId).bootstrapTable({});
    } else {
        $(bootstrapTableId).bootstrapTable("load", bufferData);
    }

    $(bootstrapTableId + " > tbody > tr").on("click", function(event) {
        $(this).addClass("active").siblings().removeClass("active");

        onRowClick($(this).index());
    });
}

function updateBufferList(length) {
    updateBufferTable("#buffer-list", length, function(idx) {
        sendMessage(messageType.GET_BUFFER, { "index": idx });
    });
}

function updateFrameBufferList(length) {
    updateBufferTable("#frame-buffer-list", length, function(idx) {
        sendMessage(messageType.GET_FRAME_BUFFER, { "index": idx });
    });
}

function updateRenderBufferList(length) {
    updateBufferTable("#render-buffer-list", length, function(idx) {
        sendMessage(messageType.GET_RENDER_BUFFER, { "index": idx });
    });
}

document.getElementById("getBuffers").addEventListener("click", function getBuffers(e) {
    sendMessage(messageType.GET_BUFFERS, "");
});

document.getElementById("getFrameBuffers").addEventListener("click", function(e) {
    sendMessage(messageType.GET_FRAME_BUFFERS, "");
});

document.getElementById("getRenderBuffers").addEventListener("click", function(e) {
    sendMessage(messageType.GET_RENDER_BUFFERS, "");
});
