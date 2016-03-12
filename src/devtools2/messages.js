define(function(){
    var instance = null;

    function Messages() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Messages, use Messages.getInstance()");
        }
        this.initialize();
    }
    Messages.prototype = {
        initialize: function() {
            // Initialize connection
            var backgroundPageConnection = chrome.runtime.connect({
                name: "panel"
            });

            backgroundPageConnection.postMessage({
                name: 'init',
                tabId: chrome.devtools.inspectedWindow.tabId
            });

            this.connection = backgroundPageConnection;
        },
        sendMessage: function(context, type, data) {
            this.connection.postMessage({ "source": "panel", "activeContext": context,  "type": type, "data": data});
        }
    };

    Messages.getInstance = function() {
        if (instance === null) {
            instance = new Messages();
        }
        return instance;
    };

    return Messages.getInstance();
});
