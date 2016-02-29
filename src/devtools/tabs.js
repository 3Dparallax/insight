var tabMap = {
    "tabBar-pixel-inspector": "pixelInspector",
    "tabBar-program-usage": "programUsage",
    "tabBar-call-stack": "callStack"
}

var changeTab = function() {
    var tabBarElements = document.getElementsByClassName("tabBar-element");
    for (var i = 0; i < tabBarElements.length; i++) {
       tabBarElements[i].classList.remove("tabBar-element-enabled");
    }
    var tabElements = document.getElementsByClassName("tab");
    for (var i = 0; i < tabElements.length; i++) {
       tabElements[i].classList.remove("tab-enabled");
    }

    this.classList.add("tabBar-element-enabled");
    document.getElementById(tabMap[this.id]).classList.add("tab-enabled");
};

var elements = document.getElementsByClassName("tabBar-element");
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', changeTab, false);
}
