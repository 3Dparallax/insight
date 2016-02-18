var connections = {};
var contentTabID = null;

// Pass messages from DevTools panel to content script
chrome.runtime.onConnect.addListener(function (port) {
    var extensionListener =  function (message, sender, sendResponse) {
        // Store connection in connections list
        if (message.name == "init") {
          connections[message.tabId] = port;
          return;
        }

        if (contentTabID == null) {
          console.log("message sent before init")
          return;
        }
        chrome.tabs.sendMessage(contentTabID, message, null);
    };
    port.onMessage.addListener(extensionListener);

    // Remove connection from connection list on disconnect
    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);

        var tabs = Object.keys(connections);
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

// Pass messages from content script to DevTools panel
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Instantiate content tab ID for panel->content messaging
    contentTabID = sender.tab.id;

    // TODO: Send only to appropriate connection
    //       We currently maintain one connection so this *should* be okay
    for (connection in connections) {
      connections[connection].postMessage(request);
    }
    return true;
});
