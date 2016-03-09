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

function updateBufferList(length) {
    var bufferList = document.getElementById("buffers-list");

    var elementsToAdd = length - bufferList.children.length;
    if (elementsToAdd == 0) {
        return;
    }

    var baseIndex = bufferList.children.length;
    if (elementsToAdd < 0) {
        bufferList.innerHTML = "";
        elementsToAdd = length;
        baseIndex = 0;
    }

    for (var i = 0; i < elementsToAdd; i++) {
        var elementIndex = i + baseIndex;

        var bufferElementA = document.createElement("a");
        bufferElementA.href = "#";
        bufferElementA.innerHTML = "buffer" + elementIndex;

        var bufferElementLi = document.createElement("li");
        bufferElementLi.id = elementIndex;
        bufferElementLi.appendChild(bufferElementA);

        bufferElementLi.onclick = function() {
            sendMessage(messageType.GET_BUFFER, { "index": this.id });
        };

        bufferList.appendChild(bufferElementLi);
    }
}

function updateFrameBufferList(length) {
    var bufferList = document.getElementById("frame-buffers-list");

    var elementsToAdd = length - bufferList.children.length;
    if (elementsToAdd == 0) {
        return;
    }

    var baseIndex = bufferList.children.length;
    if (elementsToAdd < 0) {
        bufferList.innerHTML = "";
        elementsToAdd = length;
        baseIndex = 0;
    }

    for (var i = 0; i < elementsToAdd; i++) {
        var elementIndex = i + baseIndex;

        var bufferElementA = document.createElement("a");
        bufferElementA.href = "#";
        bufferElementA.innerHTML = "buffer" + elementIndex;

        var bufferElementLi = document.createElement("li");
        bufferElementLi.id = elementIndex;
        bufferElementLi.appendChild(bufferElementA);

        bufferElementLi.onclick = function() {
            sendMessage(messageType.GET_FRAME_BUFFER, { "index": this.id });
        };

        bufferList.appendChild(bufferElementLi);
    }
}

function updateRenderBufferList(length) {
    var bufferList = document.getElementById("render-buffers-list");

    var elementsToAdd = length - bufferList.children.length;
    if (elementsToAdd == 0) {
        return;
    }

    var baseIndex = bufferList.children.length;
    if (elementsToAdd < 0) {
        bufferList.innerHTML = "";
        elementsToAdd = length;
        baseIndex = 0;
    }

    for (var i = 0; i < elementsToAdd; i++) {
        var elementIndex = i + baseIndex;

        var bufferElementA = document.createElement("a");
        bufferElementA.href = "#";
        bufferElementA.innerHTML = "buffer" + elementIndex;

        var bufferElementLi = document.createElement("li");
        bufferElementLi.id = elementIndex;
        bufferElementLi.appendChild(bufferElementA);

        bufferElementLi.onclick = function() {
            sendMessage(messageType.GET_RENDER_BUFFER, { "index": this.id });
        };

        bufferList.appendChild(bufferElementLi);
    }
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
