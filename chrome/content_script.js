var s = document.createElement('script');
s.src = chrome.extension.getURL('main.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

// From: https://developer.chrome.com/extensions/devtools#injecting
// Use window events to send messages between content script and main.js
window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null) {
    return;
  }
  chrome.runtime.sendMessage(message);
});

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
   window.postMessage(msg, "*");
});
