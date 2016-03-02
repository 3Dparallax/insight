var initialTab = "tabBar-pixel-inspector";
var tabMap = {
    "tabBar-pixel-inspector": "pixelInspector",
    "tabBar-program-usage": "programUsage",
    "tabBar-program-duplicate": "programDuplicate",
    "tabBar-call-stack": "callStack",
    "tabBar-call-histogram": "callHistogram",
    "tabBar-texture-viewer": "textureViewer",
    "tabBar-buffer-viewer": "bufferViewer",
    "tabBar-state-viewer": "stateViewer",
}

var changeTab = function(tabElementID) {
    var tabBarElements = document.getElementsByClassName("tabBar-element");
    for (var i = 0; i < tabBarElements.length; i++) {
       tabBarElements[i].classList.remove("tabBar-element-enabled");
    }
    var tabElements = document.getElementsByClassName("tab");
    for (var i = 0; i < tabElements.length; i++) {
       tabElements[i].classList.remove("tab-enabled");
    }

    document.getElementById(tabElementID).classList.add("tabBar-element-enabled");
    document.getElementById(tabMap[tabElementID]).classList.add("tab-enabled");
};

var elements = document.getElementsByClassName("tabBar-element");
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', function() {
        changeTab(this.id);
    }, false);
}

var updateTabs = function(state) {
    displayTexture(state.texture);
    updateTextureList(state.textureList);
    updateBufferList(state.buffer.bufferSize);
    updateFrameBufferList(state.buffer.frameBufferSize);
    updateRenderBufferList(state.buffer.renderBufferSize);
    displayHistogram(state.histogram);
    updatePixelInspector(state.pixelInspectorEnabled);
}

var refreshTabs = function(uuid) {
    var state = getContextState(uuid);
    updateTabs(state);
    changeTab(state.activeTab);
}
