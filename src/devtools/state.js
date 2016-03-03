var states = {};
states.activeContext = null;

function setInitialState(uuid) {
    initialState = {};
    initialState.buffer = {};
    initialState.buffer.bufferSize = 0;
    initialState.buffer.frameBufferSize = 0;
    initialState.buffer.renderBufferSize = 0;
    initialState.callStack = [];
    initialState.programUsageCount = [];
    initialState.duplicateProgramUses = [];
    initialState.texture = null;
    initialState.textureList = 0;
    initialState.histogram = null;
    initialState.contexts = [];
    initialState.stateVars = {};
    initialState.activeTab = initialTab;
    states[uuid] = initialState;
}

function getContextState(uuid) {
    if (!uuid || !(uuid in states)) {
        setInitialState(uuid);
    }
    return states[uuid];
}
