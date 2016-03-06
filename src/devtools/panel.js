var glpFrontEnd = {};

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.onMessage.addListener(function(msg) {
    if (msg.source != "content") {
        return;
    }

    if (msg.type == messageType.GET_CONTEXTS) {
        updateContexts(JSON.parse(msg.data.contexts));
        return;
    }

    if (!msg.activeContext) {
        console.log("All messages must specify an active context uuid");
        return;
    }

    var state = getContextState(msg.activeContext);

    if (msg.type == messageType.CALL_STACK) {
        state.callStack = msg.data.functionNames;
        updateCallStackTables(msg.data.functionNames);
    } else if (msg.type == messageType.GET_PROGRAM_USAGE_COUNT) {
        state.programUsageCount = msg.data.programUsageCount;
        updateProgramUsageTable(JSON.parse(msg.data.programUsageCount));
    } else if (msg.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
        state.duplicateProgramUses = msg.data.duplicateProgramUses;
        updateProgramDuplicateTable(JSON.parse(msg.data.duplicateProgramUses));
    } else if (msg.type == messageType.GET_TEXTURE) {
        state.texture = JSON.parse(msg.data);
    } else if (msg.type == messageType.GET_TEXTURES) {
        state.textureList = msg.data.length;
    } else if (msg.type == messageType.FUNCTION_HISTOGRAM) {
        state.histogram = msg.data;
    } else if (msg.type == messageType.GET_BUFFER) {
        state.buffer.buffer = JSON.parse(msg.data);
    } else if (msg.type == messageType.GET_BUFFERS) {
        state.buffer.bufferSize = msg.data.length;
    } else if (msg.type == messageType.GET_FRAME_BUFFERS) {
        state.buffer.frameBufferSize = msg.data.length;
    } else if (msg.type == messageType.GET_RENDER_BUFFERS) {
        state.buffer.renderBufferSize = msg.data.length;
    } else if (msg.type == messageType.STATE_VARS) {
        if (!state.stateVars) {
            state.stateVars = {data: JSON.parse(msg.data.stateVars), initialized: false};
        } else {
            state.stateVars = {data: JSON.parse(msg.data.stateVars), initialized: state.stateVars.initialized};
        }
    }

    if (states.activeContext == msg.activeContext) {
        updateTabs(state);
    }

    console.log(msg);
});

function sendMessage(type, data) {
    console.log("Sending " + type + " with " + JSON.stringify(data));
    backgroundPageConnection.postMessage({ "source": "panel", "activeContext": states.activeContext,  "type": type, "data": data});
}
