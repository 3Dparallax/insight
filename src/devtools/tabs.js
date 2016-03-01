var initialTab = "tabBar-pixel-inspector";
var tabMap = {
    "tabBar-pixel-inspector": "pixelInspector",
    "tabBar-program-usage": "programUsage",
    "tabBar-call-stack": "callStack",
    "tabBar-texture-viewer": "textureViewer",
    "tabBar-buffer-viewer": "bufferViewer",
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
    displayCallStack(state.callStack);
    displayTexture(state.texture);
    updateTextureList(state.textureList);
    displayHistogram(state.histogram);
    updatePixelInspector(state.pixelInspectorEnabled);
}

var refreshTabs = function(uuid) {
    var state = getContextState(uuid);
    updateTabs(state);
    changeTab(state.activeTab);
}
