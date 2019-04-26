var connections = {};

// Pass messages from DevTools panel to content script
chrome.runtime.onConnect.addListener(function (port) {
    var extensionListener =  function (message, sender, sendResponse) {
        // Store connection in connections list
        if (message.name == "init") {
          connections[message.tabId] = port;
          return;
        }

        var tabs = Object.keys(connections);
        var contentTabID = null;
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            contentTabID = tabs[i];
            break;
          }
        }

        if (contentTabID == null) {
          console.log("unknown tab id")
          return;
        }

        chrome.tabs.sendMessage(Number(contentTabID), message, null, null);
    };
    port.onMessage.addListener(extensionListener);

    // Remove connection from connection list on disconnect
    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);

        var tabs = Object.keys(connections);
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            // Disable all extension behaviour when the dev panel closes
            chrome.tabs.sendMessage(Number(tabs[i]), {"source": "panel", "type": "disableAllContexts"}, null, null);
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

// Pass messages from content script to DevTools panel
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Instantiate content tab ID for panel->content messaging
    if (sender.tab) {
      var tabId = sender.tab.id;
      if (tabId in connections) {
        connections[tabId].postMessage(request);
      } else {
        console.log("Tab not found in connection list.");
      }
    } else {
      console.log("sender.tab not defined.");
    }
    return true;
});
