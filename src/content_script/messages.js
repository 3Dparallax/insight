var glpMessages = (function (gl) {

messages = {}

/**
 * Sends messages to the devtools panel
 * @param {WebGLContext} The WebGL Context the Message is sent from.
 * @param {String} Message type
 * @param {Dictionary} Message data
 */
messages.sendMessage = function(type, data) {
  window.postMessage({
    "source": "content",
    "activeContext": gl.__uuid,
    "type": type,
    "data": data
  }, "*");
}

messages.getCurrentProgramUsageCount = function() {
  this.sendMessage(
    messageType.GET_PROGRAM_USAGE_COUNT,
    {"programUsageCount": JSON.stringify(gl.glp().programUsageCounter.usages)}
  );
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
messages.getDuplicateProgramUsage = function() {
  this.sendMessage(
    messageType.GET_DUPLICATE_PROGRAM_USAGE,
    {"duplicateProgramUses": JSON.stringify(gl.glp().duplicateProgramDetection.duplicates)}
  );
}

messages.getTextures = function() {
  gl.glp().textureViewer.getTextures();
}

messages.getTexture = function(index) {
  gl.glp().textureViewer.getTexture(index);
}

/**
 * Sends call stack information to the panel
 * @param {String} Type of stack requested
 */
messages.sendCallStack = function(type) {
  var callStack = gl.glp().callStack.getStack();
  this.sendMessage(
    messageType.CALL_STACK,
    {"functionNames": callStack}
  );
}

/**
 * Sends histogram of function calls to the panel
 */
messages.sendFunctionHistogram = function(threshold) {
  var dataSeries = []
  var labels = []
  var histogram = gl.glp().histogram.histogram
  for (var functionName in histogram) {
      if (histogram[functionName] >= threshold) {
          labels.push(functionName)
          dataSeries.push(histogram[functionName])
      }
  }

  this.sendMessage(
    messageType.FUNCTION_HISTOGRAM,
    {"labels": labels, "values": dataSeries}
  );
}

/**
 * Toggles the status of the pixel inspector being enabled/disabled
 * @param {Bool} Enabled
 */
messages.pixelInspectorToggle = function(enabled) {
  if (enabled) {
    gl.glp().pixelInspector.enable();
  } else {
    gl.glp().pixelInspector.disable();
  }
}

/**
 * Sends call state variable information to the panel
 */
messages.sendStateVars = function() {
  var stateVars = JSON.stringify(gl.glp().stateTracker.getStates());
  this.sendMessage(
    messageType.STATE_VARS,
    {"stateVars": stateVars})
}

return messages;
});
