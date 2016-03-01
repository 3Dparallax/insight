var states = {};
states.activeContext = null;

function setInitialState(uuid) {
    initialState = {};
    initialState.callStack = [];
    initialState.programUsageCount = [];
    initialState.duplicateProgramUses = [];
    initialState.texture = null;
    initialState.textureList = 0;
    initialState.histogram = null;
    initialState.contexts = [];
    initialState.activeTab = initialTab;
    states[uuid] = initialState;
}

function getContextState(uuid) {
    if (!uuid || !(uuid in states)) {
        setInitialState(uuid);
    }
    return states[uuid];
}
