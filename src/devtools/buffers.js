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

    var bufferTerm = document.createElement("dt");
    bufferTerm.innerHTML = "buffer";
    bufferParams.appendChild(bufferTerm);

    var bufferDataDescription = document.createElement("dd");
    bufferDataDescription.innerHTML = buffer.buffer;
    bufferParams.appendChild(bufferDataDescription);

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
