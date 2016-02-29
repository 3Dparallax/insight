requestContexts();

function requestContexts() {
    sendMessage(messageType.GET_CONTEXTS, {});
}

function updateContexts(contexts) {
    var noContext = document.getElementById("no-context")
    noContext.classList.remove("no-context-hidden");
    var main = document.getElementById("main");
    main.classList.remove("main-hidden");

    if (contexts.length == 0) {
        main.classList.add("main-hidden");
        return;
    }

    document.getElementById("contextBar").innerHTML = "";

    noContext.classList.add("no-context-hidden");
    for (var i = 0; i< contexts.length; i++) {
        addContext(contexts[i].__name, contexts[i].__uuid);
    }

    setActiveContext(contexts[0].__uuid);
}

function addContext(name, uuid) {
    var contextElement = document.createElement("div");
    var contextBar = document.getElementById("contextBar");

    contextElement.classList.add("context-element");
    contextElement.id = uuid;
    contextElement.innerHTML = name;
    contextBar.appendChild(contextElement);
}

var activeContext = null;
function setActiveContext(uuid) {
    var contextElement = document.getElementById(uuid);
    contextElement.classList.add("context-element-enabled");
    activeContext = uuid;
    refreshTab();
}
