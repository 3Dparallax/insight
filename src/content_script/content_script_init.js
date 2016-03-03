// Note: Files are appended in order
var fileDirectory = "src/content_script/"
files = [
  "insight.js",
  "buffer_viewer.js",
  "program_usage_counter.js",
  "duplicate_program_detection.js",
  "pixel_inspector.js",
  "texture_viewer.js",
  "messaging.js",
  "helpers.js",
  "call_stack.js",
  "state_variables.js",
  "fcn_bindings.js",
  "webgl_bind.js",
];

var sharedFileDirectory = "src/shared/"
sharedFiles = [
  "message_types.js"
];

appendFiles(sharedFileDirectory, sharedFiles)
appendFiles(fileDirectory, files)

function appendFiles(directory, files) {
  for (var i=0; i<files.length; i++) {
    // From: http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(directory + files[i]);
    s.onload = function() {
      this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
  }
}

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
