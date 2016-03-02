
function updateBufferList(length) {
    console.log("update buffer list");
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
            console.log("texture");
            console.log(states.activeContext);
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
            sendMessage(messageType.GET_BUFFER, { "index": this.id });
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
            sendMessage(messageType.GET_BUFFER, { "index": this.id });
        };

        bufferList.appendChild(bufferElementLi);
    }
}

function getBuffers(e) {
    sendMessage(messageType.GET_FRAME_BUFFERS, "");
}

document.getElementById("getBuffers").addEventListener("click", getBuffers);
function getFrameBuffers(e) {
    sendMessage(messageType.GET_FRAME_BUFFERS, "");
}

document.getElementById("getFrameBuffers").addEventListener("click", getFrameBuffers);

function getRenderBuffers(e) {
    sendMessage(messageType.GET_RENDER_BUFFERS, "");
}

document.getElementById("getRenderBuffers").addEventListener("click", getRenderBuffers);
